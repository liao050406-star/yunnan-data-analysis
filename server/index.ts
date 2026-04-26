/**
 * 云南省企业数据采集系统 - 后端服务
 * Yunnan Municipal Data Portal - Backend API Server
 *
 * 技术栈: Node.js + Express + Supabase (via supabase-js)
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase config. Please set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.'
  );
}
const SUPABASE_AUTH_KEY = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_AUTH_KEY) {
  throw new Error('Missing Supabase auth key. Please set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.');
}
const RESOLVED_SUPABASE_URL: string = SUPABASE_URL;
const RESOLVED_SERVICE_ROLE_KEY: string = SUPABASE_SERVICE_ROLE_KEY;
const RESOLVED_AUTH_KEY: string = SUPABASE_AUTH_KEY;

// ─── Supabase Admin Client (service role, never store user session) ──────────
const supabase = createClient(
  RESOLVED_SUPABASE_URL,
  RESOLVED_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 每次登录请求使用独立的 auth client，避免把用户 session 写入全局 client。
function createAuthClientForSignIn() {
  return createClient(
    RESOLVED_SUPABASE_URL,
    RESOLVED_AUTH_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = new Set([
  process.env.APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Auth Helper: verify Bearer token from Supabase ──────────────────────────
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未提供授权令牌' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: '无效的令牌，请重新登录' });

  (req as any).user = user;
  next();
}

// ─── Audit Log Helper ─────────────────────────────────────────────────────────
async function logAction(userId: string, action: string, resourceType?: string, resourceId?: string, meta?: object) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: meta,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 * 统一登录接口（企业/市级/省级）
 */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });

  // 登录邮箱解析策略（避免触发 user_profiles 的 RLS 递归）：
  // - 直接输入邮箱：直接使用
  // - 演示用户名：按约定映射到 seed 脚本里的真实邮箱
  // - 其他用户名：回退为 `${username}@yunnan-portal.gov.cn`
  let email = username.includes('@') ? username : `${username}@yunnan-portal.gov.cn`;
  if (!username.includes('@')) {
    const demoEnterpriseMatch = username.match(/^demo_ent_(\d+)$/);
    if (demoEnterpriseMatch) {
      email = `demo-enterprise-${demoEnterpriseMatch[1]}@yunnan-portal.gov.cn`;
    } else if (username === 'demo_city') {
      email = 'demo-city@yunnan-portal.gov.cn';
    } else if (username === 'demo_admin') {
      email = 'demo-admin@yunnan-portal.gov.cn';
    }
  }

  const authClient = createAuthClientForSignIn();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: '用户名或密码错误，请检查后重试' });

  // 获取用户档案（包含角色信息）
  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileErr) return res.status(500).json({ error: profileErr.message });
  if (!profile) {
    return res.status(403).json({
      error: '该账号尚未开通系统档案（user_profiles）。请在 Supabase 中创建对应角色记录，或运行 npm run db:seed 写入演示账号。',
    });
  }

  await logAction(data.user.id, 'login', 'auth', data.user.id);

  res.json({
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      profile,
    }
  });
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const user = (req as any).user;
  await logAction(user.id, 'logout');
  // 前端仅需删除本地 token；这里不对全局 client 做 signOut，避免影响并发请求。
  res.json({ success: true });
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return res.status(404).json({ error: '用户档案不存在' });
  res.json({ user: { ...user, profile } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE FILING ROUTES (企业备案)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/filings/my
 * 获取当前企业自己的备案信息
 */
app.get('/api/filings/my', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data, error } = await supabase
    .from('enterprise_filings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  res.json({ filing: data });
});

/**
 * POST /api/filings
 * 新建企业备案
 */
app.post('/api/filings', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const {
    credit_code, enterprise_name, enterprise_type, industry, business_scope,
    address, postal_code, contact_person, contact_phone, contact_email,
    base_employee_count
  } = req.body;

  if (!credit_code || !enterprise_name) {
    return res.status(400).json({ error: '统一社会信用代码和企业名称为必填项' });
  }

  const { data, error } = await supabase
    .from('enterprise_filings')
    .insert({
      user_id: user.id,
      credit_code, enterprise_name, enterprise_type, industry, business_scope,
      address, postal_code, contact_person, contact_phone, contact_email,
      base_employee_count: base_employee_count || 0,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: '该统一社会信用代码已存在' });
    return res.status(500).json({ error: error.message });
  }

  await logAction(user.id, 'create_filing', 'enterprise_filing', data.id);
  res.status(201).json({ filing: data });
});

/**
 * PUT /api/filings/:id
 * 更新备案（草稿/已退回状态可修改）
 */
app.put('/api/filings/:id', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  // 确认是自己的备案且可编辑
  const { data: existing } = await supabase
    .from('enterprise_filings')
    .select('id, status, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existing) return res.status(404).json({ error: '备案不存在或无权限修改' });
  if (!['draft', 'rejected'].includes(existing.status)) {
    return res.status(400).json({ error: '当前备案状态不允许修改' });
  }

  const { data, error } = await supabase
    .from('enterprise_filings')
    .update({ ...req.body, status: 'pending' })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await logAction(user.id, 'update_filing', 'enterprise_filing', id);
  res.json({ filing: data });
});

/**
 * POST /api/filings/:id/save-draft
 * 保存草稿（不改变状态）
 */
app.post('/api/filings/:id/save-draft', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('enterprise_filings')
    .update({ ...req.body, status: 'draft' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ filing: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES: Audit Queue (审核任务中心)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/filings
 * 管理员获取所有备案（可筛选状态/区域/关键字）
 */
app.get('/api/admin/filings', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { status, region, keyword, page = 1, limit = 20 } = req.query;

  // 权限校验
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['admin', 'city'].includes(profile.role)) {
    return res.status(403).json({ error: '权限不足' });
  }

  let query = supabase
    .from('enterprise_filings')
    .select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status as string);
  if (region) query = query.ilike('address', `%${region}%`);
  if (keyword) {
    query = query.or(`enterprise_name.ilike.%${keyword}%,credit_code.ilike.%${keyword}%`);
  }

  const offset = (Number(page) - 1) * Number(limit);
  query = query.range(offset, offset + Number(limit) - 1)
               .order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const userIds = [...new Set((data || []).map((row: any) => row.user_id).filter(Boolean))];
  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase.from('user_profiles').select('id, username, full_name').in('id', userIds)
    : { data: [], error: null };
  if (profilesError) return res.status(500).json({ error: profilesError.message });

  const profileById = new Map((profiles || []).map((row: any) => [row.id, row]));
  const filings = (data || []).map((row: any) => ({
    ...row,
    user_profiles: profileById.get(row.user_id) || null,
  }));

  res.json({ filings, total: count, page: Number(page), limit: Number(limit) });
});

/**
 * PUT /api/admin/filings/:id/audit
 * 审核备案（批准 / 退回）
 */
app.put('/api/admin/filings/:id/audit', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { action, note } = req.body; // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action 必须为 approve 或 reject' });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const { data, error } = await supabase
    .from('enterprise_filings')
    .update({
      status: newStatus,
      audit_note: note,
      audited_by: user.id,
      audited_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await logAction(user.id, `filing_${newStatus}`, 'enterprise_filing', id, { note });
  res.json({ filing: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA SUBMISSIONS (月度数据填报)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/submissions/my
 * 获取当前企业的所有上报记录
 */
app.get('/api/submissions/my', requireAuth, async (req, res) => {
  const user = (req as any).user;

  const { data: filing } = await supabase
    .from('enterprise_filings')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!filing) return res.json({ submissions: [] });

  const { data, error } = await supabase
    .from('data_submissions')
    .select('*')
    .eq('enterprise_id', filing.id)
    .order('period_year', { ascending: false })
    .order('period_quarter', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ submissions: data });
});

/**
 * GET /api/submissions/current
 * 获取当前激活周期的填报（或草稿）
 */
app.get('/api/submissions/current', requireAuth, async (req, res) => {
  const user = (req as any).user;

  // 获取活跃周期
  const { data: cycle } = await supabase
    .from('survey_cycles')
    .select('*')
    .eq('status', 'active')
    .single();

  if (!cycle) return res.json({ submission: null, cycle: null });

  const { data: filing } = await supabase
    .from('enterprise_filings')
    .select('id, base_employee_count')
    .eq('user_id', user.id)
    .single();

  if (!filing) return res.json({ submission: null, cycle });

  const { data } = await supabase
    .from('data_submissions')
    .select('*')
    .eq('enterprise_id', filing.id)
    .eq('period_year', cycle.period_year)
    .eq('period_quarter', cycle.period_quarter)
    .single();

  res.json({ submission: data, cycle, enterprise: filing });
});

/**
 * POST /api/submissions
 * 提交月度数据（或保存草稿）
 */
app.post('/api/submissions', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { isDraft = false, ...body } = req.body;

  const { data: filing } = await supabase
    .from('enterprise_filings')
    .select('id, status, base_employee_count')
    .eq('user_id', user.id)
    .single();

  if (!filing || filing.status !== 'approved') {
    return res.status(400).json({ error: '企业备案尚未审核通过，无法提交数据' });
  }

  const { data: cycle } = await supabase
    .from('survey_cycles')
    .select('*')
    .eq('status', 'active')
    .single();

  if (!cycle) return res.status(400).json({ error: '当前没有开放的调查周期' });

  const submissionData = {
    enterprise_id: filing.id,
    user_id: user.id,
    survey_period: cycle.period_label,
    period_year: cycle.period_year,
    period_quarter: cycle.period_quarter,
    base_employee_count: filing.base_employee_count,
    current_employee_count: body.current_employee_count,
    decline_type: body.decline_type,
    decline_cause: body.decline_cause,
    decline_remark: body.decline_remark,
    avg_salary: body.avg_salary,
    total_salary_bill: body.total_salary_bill,
    new_hires: body.new_hires || 0,
    job_vacancies: body.job_vacancies || 0,
    status: isDraft ? 'draft' : 'pending',
    submitted_at: isDraft ? null : new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('data_submissions')
    .upsert(submissionData, { onConflict: 'enterprise_id,period_year,period_quarter' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await logAction(user.id, isDraft ? 'save_draft_submission' : 'submit_data', 'data_submission', data.id);
  res.status(201).json({ submission: data });
});

/**
 * PUT /api/admin/submissions/:id/audit
 * 管理员审核月度上报数据
 */
app.put('/api/admin/submissions/:id/audit', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { action, note } = req.body;

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const { data, error } = await supabase
    .from('data_submissions')
    .update({ status: newStatus, audit_note: note, audited_by: user.id, audited_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await logAction(user.id, `submission_${newStatus}`, 'data_submission', id);
  res.json({ submission: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS (数据分析)
// ═══════════════════════════════════════════════════════════════════════════════

/** 根据经营地址推断市州（用于「分市州就业规模」演示聚合） */
function inferPrefectureFromAddress(address: string | null | undefined): string {
  if (!address || !String(address).trim()) return '其他';
  const s = String(address);
  const rules: Array<[RegExp, string]> = [
    [/西双版纳|景洪|勐海|勐腊/, '西双版纳州'],
    [/大理|白族自治州/, '大理州'],
    [/红河|哈尼族|蒙自|个旧|开远|弥勒/, '红河州'],
    [/楚雄|彝族自治州/, '楚雄州'],
    [/文山|壮族|苗族自治州/, '文山州'],
    [/昭通/, '昭通市'],
    [/丽江/, '丽江市'],
    [/普洱|思茅/, '普洱市'],
    [/临沧/, '临沧市'],
    [/保山|腾冲/, '保山市'],
    [/德宏|芒市|瑞丽/, '德宏州'],
    [/怒江/, '怒江州'],
    [/迪庆|香格里拉/, '迪庆州'],
    [/曲靖|麒麟|沾益/, '曲靖市'],
    [/玉溪|红塔|江川/, '玉溪市'],
    [/昆明|五华|盘龙|官渡|西山|呈贡/, '昆明市'],
  ];
  for (const [re, name] of rules) {
    if (re.test(s)) return name;
  }
  return '其他';
}

/** user_profiles.city_code（地级）→ 与 infer 结果一致的市州名，用于市级账号过滤 */
const CITY_CODE_TO_PREFECTURE: Record<string, string> = {
  '530100': '昆明市',
  '530300': '曲靖市',
  '530400': '玉溪市',
  '532900': '大理州',
  '532500': '红河州',
  '532300': '楚雄州',
  '532600': '文山州',
  '530600': '昭通市',
  '530700': '丽江市',
  '530800': '普洱市',
  '530900': '临沧市',
  '530500': '保山市',
  '533100': '德宏州',
  '533300': '怒江州',
  '533400': '迪庆州',
  '532800': '西双版纳州',
};

/** 支持区县代码（如 530102）按前四位归入市州 */
function prefectureLabelForCityCode(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  if (CITY_CODE_TO_PREFECTURE[code]) return CITY_CODE_TO_PREFECTURE[code];
  const prefix4 = code.slice(0, 4);
  const PREFIX_TO_PREFECTURE: Record<string, string> = {
    '5301': '昆明市',
    '5303': '曲靖市',
    '5304': '玉溪市',
    '5305': '保山市',
    '5306': '昭通市',
    '5307': '丽江市',
    '5308': '普洱市',
    '5309': '临沧市',
    '5323': '楚雄州',
    '5325': '红河州',
    '5326': '文山州',
    '5328': '西双版纳州',
    '5329': '大理州',
    '5331': '德宏州',
    '5333': '怒江州',
    '5334': '迪庆州',
  };
  return PREFIX_TO_PREFECTURE[prefix4];
}

/**
 * GET /api/analytics/overview
 * 省级/市级数据总览
 */
app.get('/api/analytics/overview', requireAuth, async (req, res) => {
  const { data: enterprises } = await supabase
    .from('enterprise_filings')
    .select('id', { count: 'exact', head: true });

  const { count: totalEnterprises } = await supabase
    .from('enterprise_filings')
    .select('*', { count: 'exact', head: true });

  const { count: pendingAudit } = await supabase
    .from('enterprise_filings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: totalSubmissions } = await supabase
    .from('data_submissions')
    .select('*', { count: 'exact', head: true });

  const { count: pendingSubmissions } = await supabase
    .from('data_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 汇总就业人数
  const { data: employeeStats } = await supabase
    .from('data_submissions')
    .select('current_employee_count')
    .eq('status', 'approved');

  const totalEmployees = (employeeStats || []).reduce(
    (sum: number, r: any) => sum + (r.current_employee_count || 0), 0
  );

  res.json({
    totalEnterprises: totalEnterprises || 0,
    pendingAudit: pendingAudit || 0,
    totalSubmissions: totalSubmissions || 0,
    pendingSubmissions: pendingSubmissions || 0,
    totalEmployees,
  });
});

/**
 * GET /api/analytics/trend
 * 就业趋势数据（按季度）
 */
app.get('/api/analytics/trend', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('data_submissions')
    .select('period_year, period_quarter, current_employee_count')
    .eq('status', 'approved')
    .order('period_year')
    .order('period_quarter');

  if (error) return res.status(500).json({ error: error.message });

  // 按周期聚合
  const grouped: Record<string, number> = {};
  for (const row of data || []) {
    const key = `${row.period_year}-Q${row.period_quarter}`;
    grouped[key] = (grouped[key] || 0) + (row.current_employee_count || 0);
  }

  const trend = Object.entries(grouped).map(([period, total]) => ({ period, total }));
  res.json({ trend });
});

/**
 * GET /api/analytics/by-industry
 * 按行业分布统计
 */
app.get('/api/analytics/by-industry', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('enterprise_filings')
    .select('industry')
    .eq('status', 'approved');

  if (error) return res.status(500).json({ error: error.message });

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const key = row.industry || 'other';
    counts[key] = (counts[key] || 0) + 1;
  }

  const LABELS: Record<string, string> = {
    it: '信息技术/互联网', mfg: '制造业', agri: '高原特色农业', service: '现代服务业'
  };

  const result = Object.entries(counts).map(([industry, count]) => ({
    industry, label: LABELS[industry] || industry, count
  }));

  res.json({ distribution: result });
});

/**
 * GET /api/analytics/by-region
 * 分市州就业人数：取每家已审备案企业在「最近已审季度」的期末在岗人数，按地址推断市州汇总。
 * 市级账号（user_profiles.role = city）仅返回本市州一条。
 */
app.get('/api/analytics/by-region', requireAuth, async (req, res) => {
  const user = (req as any).user;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, city_code')
    .eq('id', user.id)
    .maybeSingle();

  const { data: rows, error } = await supabase
    .from('data_submissions')
    .select('enterprise_id, current_employee_count, period_year, period_quarter, enterprise_filings ( address, status )')
    .eq('status', 'approved');

  if (error) return res.status(500).json({ error: error.message });

  type SubRow = {
    enterprise_id: string;
    current_employee_count: number;
    period_year: number;
    period_quarter: number;
    enterprise_filings: { address: string | null; status: string } | null;
  };
  type RawSubRow = Omit<SubRow, 'enterprise_filings'> & {
    enterprise_filings: SubRow['enterprise_filings'] | SubRow['enterprise_filings'][];
  };

  const latestByEnterprise = new Map<string, SubRow>();
  for (const raw of rows || []) {
    const row = raw as unknown as RawSubRow;
    const ef = Array.isArray(row.enterprise_filings)
      ? row.enterprise_filings[0]
      : row.enterprise_filings;
    if (!ef || ef.status !== 'approved') continue;

    const prev = latestByEnterprise.get(row.enterprise_id);
    if (
      !prev ||
      row.period_year > prev.period_year ||
      (row.period_year === prev.period_year && row.period_quarter > prev.period_quarter)
    ) {
      latestByEnterprise.set(row.enterprise_id, { ...row, enterprise_filings: ef });
    }
  }

  const byPrefecture: Record<string, number> = {};
  for (const row of latestByEnterprise.values()) {
    const name = inferPrefectureFromAddress(row.enterprise_filings?.address ?? null);
    byPrefecture[name] = (byPrefecture[name] || 0) + (row.current_employee_count || 0);
  }

  let regions = Object.entries(byPrefecture)
    .map(([name, totalEmployees]) => ({ name, totalEmployees }))
    .sort((a, b) => b.totalEmployees - a.totalEmployees);

  if (profile?.role === 'city' && profile.city_code) {
    const label = prefectureLabelForCityCode(profile.city_code);
    if (label) {
      const hit = regions.find((r) => r.name === label);
      regions = hit ? [hit] : [{ name: label, totalEmployees: 0 }];
    }
  }

  res.json({ regions });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY CYCLES (调查周期)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/cycles
 * 获取所有调查周期
 */
app.get('/api/cycles', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('survey_cycles')
    .select('*')
    .order('period_year', { ascending: false })
    .order('period_quarter', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ cycles: data });
});

/**
 * POST /api/cycles (Admin only)
 * 创建新调查周期
 */
app.post('/api/cycles', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: '权限不足' });

  const { data, error } = await supabase
    .from('survey_cycles')
    .insert({ ...req.body, created_by: user.id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await logAction(user.id, 'create_cycle', 'survey_cycle', data.id);
  res.status(201).json({ cycle: data });
});

/**
 * PUT /api/cycles/:id (Admin only)
 * 更新周期状态
 */
app.put('/api/cycles/:id', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: '权限不足' });

  const { data, error } = await supabase
    .from('survey_cycles')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ cycle: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY LIBRARY (政策法规)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/policies
 * 获取政策文件列表
 */
app.get('/api/policies', requireAuth, async (req, res) => {
  const { keyword, category } = req.query;

  let query = supabase
    .from('policy_documents')
    .select('*')
    .eq('is_active', true)
    .order('issue_date', { ascending: false });

  if (category) query = query.eq('category', category as string);
  if (keyword) query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ policies: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE (合规自检)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/compliance/check
 * 执行合规自检，返回评分明细
 */
app.get('/api/compliance/check', requireAuth, async (req, res) => {
  const user = (req as any).user;

  const { data: filing } = await supabase
    .from('enterprise_filings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!filing) {
    return res.json({
      score: 0,
      items: [
        { id: 1, title: '企业基本备案完整度', status: 'fail', score: 0, detail: '尚未完成备案' },
      ]
    });
  }

  // 计算各项得分
  const filingComplete = filing.status === 'approved' ? 100 : filing.status === 'pending' ? 70 : 30;

  const { data: submissions } = await supabase
    .from('data_submissions')
    .select('status, submitted_at, period_year, period_quarter')
    .eq('enterprise_id', filing.id);

  const { data: cycle } = await supabase
    .from('survey_cycles')
    .select('*')
    .eq('status', 'active')
    .single();

  const currentSubmission = (submissions || []).find(
    (s: any) => s.period_year === cycle?.period_year && s.period_quarter === cycle?.period_quarter
  );

  const submissionTimely = currentSubmission?.status === 'approved' ? 100
    : currentSubmission?.status === 'pending' ? 80
    : 0;

  const anomalyExplanation = (submissions || []).filter(
    (s: any) => s.status === 'approved'
  ).length > 0 ? 90 : 70;

  const contactValidity = (filing.contact_phone && filing.contact_email) ? 100 : 60;
  const surveyParticipation = currentSubmission ? 100 : 0;

  const totalScore = Math.round(
    filingComplete * 0.25 + submissionTimely * 0.30 + anomalyExplanation * 0.15
    + contactValidity * 0.15 + surveyParticipation * 0.15
  );

  const items = [
    { id: 1, title: '企业基本备案完整度', status: filingComplete >= 90 ? 'pass' : filingComplete >= 60 ? 'warning' : 'fail', score: filingComplete, lastAudit: filing.updated_at?.slice(0, 10) || '-' },
    { id: 2, title: '月度用工数据报送及时性', status: submissionTimely >= 80 ? 'pass' : submissionTimely > 0 ? 'warning' : 'fail', score: submissionTimely, lastAudit: currentSubmission?.submitted_at?.slice(0, 10) || '-' },
    { id: 3, title: '异常波动原因说明详实度', status: anomalyExplanation >= 80 ? 'pass' : 'warning', score: anomalyExplanation, lastAudit: '-' },
    { id: 4, title: '网格联络人信息有效性', status: contactValidity >= 90 ? 'pass' : 'warning', score: contactValidity, lastAudit: filing.updated_at?.slice(0, 10) || '-' },
    { id: 5, title: '专项调查参与度', status: surveyParticipation === 100 ? 'pass' : 'pending', score: surveyParticipation, lastAudit: '-' },
  ];

  // 保存检查记录
  await supabase.from('compliance_checks').insert({
    enterprise_id: filing.id,
    score: totalScore,
    filing_completeness: filingComplete,
    submission_timeliness: submissionTimely,
    anomaly_explanation: anomalyExplanation,
    contact_validity: contactValidity,
    survey_participation: surveyParticipation,
    details: { items },
  });

  res.json({ score: totalScore, items });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGIONAL GRIDS (区域网格)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/grids
 */
app.get('/api/grids', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('regional_grids')
    .select('*')
    .order('enterprise_count', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ grids: data });
});

/**
 * POST /api/grids (Admin)
 * 新增网格
 */
app.post('/api/grids', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: '权限不足' });

  const { data, error } = await supabase
    .from('regional_grids')
    .insert(req.body)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ grid: data });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM AUDIT LOGS (系统运行审计)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/audit-logs
 * 管理员获取系统日志
 */
app.get('/api/audit-logs', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: '权限不足' });

  const { page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  const userIds = [...new Set((data || []).map((row: any) => row.user_id).filter(Boolean))];
  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase.from('user_profiles').select('id, username, full_name').in('id', userIds)
    : { data: [], error: null };
  if (profilesError) return res.status(500).json({ error: profilesError.message });

  const profileById = new Map((profiles || []).map((row: any) => [row.id, row]));
  const logs = (data || []).map((row: any) => ({
    ...row,
    user_profiles: profileById.get(row.user_id) || null,
  }));

  res.json({ logs, total: count });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK (帮助与反馈)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/feedback
 */
app.post('/api/feedback', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { category, subject, content, priority } = req.body;

  const { data, error } = await supabase
    .from('feedback_tickets')
    .insert({ user_id: user.id, category, subject, content, priority: priority || 'normal' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ticket: data });
});

/**
 * GET /api/feedback/my
 */
app.get('/api/feedback/my', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { data, error } = await supabase
    .from('feedback_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ tickets: data });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: '云南省企业数据采集系统 API' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║  云南省企业数据采集系统 Backend API                    ║
  ║  Server running on http://localhost:${PORT}           ║
  ║  Supabase: ${SUPABASE_URL ? '✓ Connected' : '✗ Not configured'}                        ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
