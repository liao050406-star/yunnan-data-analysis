import { createClient, type User } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase config');

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo123456';

async function must<T>(label: string, promise: PromiseLike<{ data: T; error: any; count?: number | null }>) {
  const { data, error, count } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return (count ?? data) as T;
}

async function getUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return (data.users as User[]).find((u) => u.email === email) ?? null;
}

async function ensureUser(email: string) {
  const existing = await getUserByEmail(email);
  if (existing) return existing;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error(`create user failed: ${email}`);
  return data.user;
}

const staff = await must('staff', supabase
  .from('user_profiles')
  .select('id, username')
  .in('username', ['demo_city', 'demo_admin']));
const city = staff.find((p: any) => p.username === 'demo_city');
const admin = staff.find((p: any) => p.username === 'demo_admin');

const enterprises = [
  { username: 'review_ent_01', email: 'review-enterprise-01@yunnan-portal.gov.cn', name: '昆明高新区云岭精工制造有限公司', contact: '审核演示联系人01', cityCode: '530102', credit: '91530102REVIEW00001', type: 'private', industry: 'mfg', address: '云南省昆明市五华区学府路科创园A座', base: 246, status: 'pending' },
  { username: 'review_ent_02', email: 'review-enterprise-02@yunnan-portal.gov.cn', name: '曲靖经开区新能源装备有限公司', contact: '审核演示联系人02', cityCode: '530302', credit: '91530302REVIEW00002', type: 'private', industry: 'mfg', address: '云南省曲靖市麒麟区翠峰北路装备园', base: 318, status: 'pending' },
  { username: 'review_ent_03', email: 'review-enterprise-03@yunnan-portal.gov.cn', name: '大理洱海智慧农业科技有限公司', contact: '审核演示联系人03', cityCode: '532901', credit: '91532901REVIEW00003', type: 'private', industry: 'agri', address: '云南省大理州大理市凤仪镇农业园区', base: 74, status: 'pending' },
  { username: 'review_ent_04', email: 'review-enterprise-04@yunnan-portal.gov.cn', name: '红河蒙自边贸供应链有限公司', contact: '审核演示联系人04', cityCode: '532503', credit: '91532503REVIEW00004', type: 'private', industry: 'service', address: '云南省红河州蒙自市雨过铺街道综合保税区', base: 132, status: 'pending' },
  { username: 'review_ent_05', email: 'review-enterprise-05@yunnan-portal.gov.cn', name: '玉溪滇中数字服务外包有限公司', contact: '审核演示联系人05', cityCode: '530402', credit: '91530402REVIEW00005', type: 'private', industry: 'it', address: '云南省玉溪市红塔区凤凰路96号', base: 89, status: 'pending' },
  { username: 'review_ent_06', email: 'review-enterprise-06@yunnan-portal.gov.cn', name: '楚雄绿色硅材加工有限公司', contact: '审核演示联系人06', cityCode: '532301', credit: '91532301REVIEW00006', type: 'state', industry: 'mfg', address: '云南省楚雄州楚雄市开发区永安路', base: 201, status: 'pending' },
  { username: 'review_ent_07', email: 'review-enterprise-07@yunnan-portal.gov.cn', name: '昭通乌蒙山农产品冷链有限公司', contact: '审核演示联系人07', cityCode: '530602', credit: '91530602REVIEW00007', type: 'private', industry: 'agri', address: '云南省昭通市昭阳区太平街道冷链物流园', base: 58, status: 'rejected', note: '统一社会信用代码附件不清晰，请重新上传营业执照扫描件。' },
  { username: 'review_ent_08', email: 'review-enterprise-08@yunnan-portal.gov.cn', name: '西双版纳热带文旅运营有限公司', contact: '审核演示联系人08', cityCode: '532801', credit: '91532801REVIEW00008', type: 'private', industry: 'service', address: '云南省西双版纳州景洪市告庄西双景', base: 143, status: 'rejected', note: '联系人手机号与备案材料不一致，需企业确认后再提交。' },
  { username: 'review_ent_09', email: 'review-enterprise-09@yunnan-portal.gov.cn', name: '文山三七产业数字贸易有限公司', contact: '审核演示联系人09', cityCode: '532601', credit: '91532601REVIEW00009', type: 'private', industry: 'agri', address: '云南省文山州文山市三七产业园', base: 96, status: 'approved' },
  { username: 'review_ent_10', email: 'review-enterprise-10@yunnan-portal.gov.cn', name: '迪庆香格里拉生态旅服有限公司', contact: '审核演示联系人10', cityCode: '533401', credit: '91533401REVIEW00010', type: 'private', industry: 'service', address: '云南省迪庆州香格里拉市建塘镇', base: 67, status: 'approved' },
];

const filings: any[] = [];
for (const ent of enterprises) {
  const authUser = await ensureUser(ent.email);
  await must('profile upsert', supabase.from('user_profiles').upsert({
    id: authUser.id,
    username: ent.username,
    full_name: ent.contact,
    role: 'enterprise',
    organization_name: ent.name,
    city_code: ent.cityCode,
  }, { onConflict: 'id' }));

  const audited = ent.status === 'approved' || ent.status === 'rejected';
  const row = {
    user_id: authUser.id,
    region: `云南省[530000] / ${ent.cityCode}`,
    credit_code: ent.credit,
    enterprise_name: ent.name,
    enterprise_type: ent.type,
    industry: ent.industry,
    business_scope: '展示数据：就业失业监测、岗位需求采集和季度用工填报演示。',
    address: ent.address,
    postal_code: '650000',
    contact_person: ent.contact,
    contact_phone: `139${ent.username.slice(-2)}001380`,
    contact_email: ent.email,
    base_employee_count: ent.base,
    status: ent.status,
    audit_note: ent.note ?? null,
    audited_by: audited ? city?.id : null,
    audited_at: audited ? new Date().toISOString() : null,
  };

  const existing = await must('filing lookup', supabase.from('enterprise_filings').select('id').eq('credit_code', ent.credit).maybeSingle());
  const filing = existing?.id
    ? await must('filing update', supabase.from('enterprise_filings').update(row).eq('id', existing.id).select('id, user_id, enterprise_name, base_employee_count, status').single())
    : await must('filing insert', supabase.from('enterprise_filings').insert(row).select('id, user_id, enterprise_name, base_employee_count, status').single());
  filings.push(filing);
}

for (const [idx, filing] of filings.filter((f) => f.status === 'pending').slice(0, 5).entries()) {
  await must('submission upsert', supabase.from('data_submissions').upsert({
    enterprise_id: filing.id,
    user_id: filing.user_id,
    survey_period: 'Q3 2026',
    period_year: 2026,
    period_quarter: 3,
    base_employee_count: filing.base_employee_count,
    current_employee_count: filing.base_employee_count - (idx + 2),
    decline_type: idx % 2 === 0 ? 'market' : 'seasonal',
    decline_cause: idx % 2 === 0 ? '订单阶段性减少，用工需求短期回落' : '季节性淡季岗位减少',
    decline_remark: '展示数据：待市级审核的季度填报记录。',
    avg_salary: 5200 + idx * 450,
    total_salary_bill: (filing.base_employee_count - (idx + 2)) * (5200 + idx * 450),
    new_hires: idx + 1,
    job_vacancies: 3 + idx,
    status: 'pending',
    submitted_at: new Date(Date.now() - idx * 3600000).toISOString(),
  }, { onConflict: 'enterprise_id,period_year,period_quarter' }));
}

await must('cleanup audit batch', supabase.from('audit_logs').delete().contains('metadata', { demo_batch: 'audit-center-2026-q3' }));

const actors = [admin, city].filter(Boolean);
const actions = [
  ['login', 'auth', null, { client: 'Chrome 展示终端' }],
  ['create_filing', 'enterprise_filing', filings[0]?.id, { enterprise: filings[0]?.enterprise_name }],
  ['update_filing', 'enterprise_filing', filings[1]?.id, { field: 'contact_phone' }],
  ['filing_approved', 'enterprise_filing', filings.find((f) => f.status === 'approved')?.id, { note: '材料完整，准予通过' }],
  ['filing_rejected', 'enterprise_filing', filings.find((f) => f.status === 'rejected')?.id, { note: '材料需补正' }],
  ['submit_data', 'data_submission', null, { period: 'Q3 2026', status: 'pending' }],
  ['save_draft_submission', 'data_submission', null, { period: 'Q3 2026' }],
  ['create_cycle', 'survey_cycle', null, { period: 'Q4 2026' }],
  ['submission_approved', 'data_submission', null, { period: 'Q2 2026', reviewer: 'demo_city' }],
  ['submission_rejected', 'data_submission', null, { period: 'Q3 2026', reason: '减员说明不足' }],
  ['export_provincial_summary', 'report', null, { period: 'Q3 2026', format: 'xlsx' }],
  ['batch_review_pending_submissions', 'data_submission', null, { count: 5 }],
  ['risk_warning_generated', 'warning', null, { level: 'yellow', enterprise_count: 4 }],
  ['grid_assignment_update', 'regional_grid', null, { region: '五华区', assigned_user_count: 45 }],
  ['policy_document_publish', 'policy_document', null, { title: '企业失业风险分级处置办法（演示）' }],
];

const logs = Array.from({ length: 45 }, (_, i) => {
  const actor = actors[i % actors.length];
  const [action, resourceType, resourceId, metadata] = actions[i % actions.length] as any[];
  return {
    user_id: actor.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: `10.194.46.${100 + (i % 80)}`,
    user_agent: i % 3 === 0 ? 'Chrome/Windows 展示终端' : i % 3 === 1 ? 'Edge/Windows 市级审核端' : 'System/ScheduledJob',
    metadata: { ...metadata, demo_batch: 'audit-center-2026-q3', sequence: i + 1 },
    created_at: new Date(Date.now() - i * 17 * 60000).toISOString(),
  };
});
await must('audit insert', supabase.from('audit_logs').insert(logs));

const pending = await must('pending count', supabase.from('enterprise_filings').select('*', { count: 'exact', head: true }).eq('status', 'pending'));
const rejected = await must('rejected count', supabase.from('enterprise_filings').select('*', { count: 'exact', head: true }).eq('status', 'rejected'));
const auditLogs = await must('audit count', supabase.from('audit_logs').select('*', { count: 'exact', head: true }));

console.log(JSON.stringify({ pending, rejected, auditLogs }, null, 2));
