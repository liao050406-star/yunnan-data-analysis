/**
 * 使用 Supabase Service Role 写入演示账号、企业备案与季度填报数据。
 * 需配置 .env：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY
 * 用法：npm run db:seed
 */

import { createClient, type User } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请在 .env 中配置。');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo123456';

type DemoEnterprise = {
  email: string;
  username: string;
  fullName: string;
  organizationName: string;
  cityCode: string;
  creditCode: string;
  enterpriseName: string;
  enterpriseType: 'state' | 'private' | 'foreign' | 'gov';
  industry: 'it' | 'mfg' | 'agri' | 'service';
  address: string;
  baseEmployees: number;
  filingStatus: 'approved' | 'pending' | 'draft';
  submissions: Array<{
    periodYear: number;
    periodQuarter: number;
    surveyPeriod: string;
    currentEmployees: number;
    avgSalary: number;
    totalSalaryBill: number;
    newHires: number;
    jobVacancies: number;
    status: 'approved' | 'pending' | 'draft';
  }>;
};

const DEMOS: DemoEnterprise[] = [
  {
    email: 'demo-enterprise-1@yunnan-portal.gov.cn',
    username: 'demo_ent_1',
    fullName: '演示企业一联系人',
    organizationName: '昆明云数智造科技有限公司',
    cityCode: '530102',
    creditCode: '91530102MA7D8EXAMPLE01',
    enterpriseName: '昆明云数智造科技有限公司',
    enterpriseType: 'private',
    industry: 'mfg',
    address: '云南省昆明市五华区学府路688号',
    baseEmployees: 128,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 132,
        avgSalary: 7850.5,
        totalSalaryBill: 1036266.0,
        newHires: 8,
        jobVacancies: 3,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 135,
        avgSalary: 7920.0,
        totalSalaryBill: 1069200.0,
        newHires: 5,
        jobVacancies: 2,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-2@yunnan-portal.gov.cn',
    username: 'demo_ent_2',
    fullName: '演示企业二联系人',
    organizationName: '大理苍洱高原农业发展有限公司',
    cityCode: '532901',
    creditCode: '91532901MA7D8EXAMPLE02',
    enterpriseName: '大理苍洱高原农业发展有限公司',
    enterpriseType: 'private',
    industry: 'agri',
    address: '云南省大理白族自治州大理市凤仪镇',
    baseEmployees: 86,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 88,
        avgSalary: 5200.0,
        totalSalaryBill: 457600.0,
        newHires: 4,
        jobVacancies: 6,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 91,
        avgSalary: 4980.0,
        totalSalaryBill: 453180.0,
        newHires: 2,
        jobVacancies: 4,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-4@yunnan-portal.gov.cn',
    username: 'demo_ent_4',
    fullName: '演示曲靖联系人',
    organizationName: '曲靖滇东装备制造有限公司',
    cityCode: '530302',
    creditCode: '91530302MA7D8EXAMPLE04',
    enterpriseName: '曲靖滇东装备制造有限公司',
    enterpriseType: 'private',
    industry: 'mfg',
    address: '云南省曲靖市麒麟区翠峰北路168号',
    baseEmployees: 210,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2025,
        periodQuarter: 4,
        surveyPeriod: 'Q4 2025',
        currentEmployees: 205,
        avgSalary: 6120.0,
        totalSalaryBill: 1254600.0,
        newHires: 6,
        jobVacancies: 5,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 208,
        avgSalary: 6180.0,
        totalSalaryBill: 1287840.0,
        newHires: 4,
        jobVacancies: 3,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 212,
        avgSalary: 6250.0,
        totalSalaryBill: 1325000.0,
        newHires: 5,
        jobVacancies: 2,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-5@yunnan-portal.gov.cn',
    username: 'demo_ent_5',
    fullName: '演示玉溪联系人',
    organizationName: '玉溪滇中现代服务有限公司',
    cityCode: '530402',
    creditCode: '91530402MA7D8EXAMPLE05',
    enterpriseName: '玉溪滇中现代服务有限公司',
    enterpriseType: 'private',
    industry: 'service',
    address: '云南省玉溪市红塔区凤凰路96号',
    baseEmployees: 156,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2025,
        periodQuarter: 4,
        surveyPeriod: 'Q4 2025',
        currentEmployees: 152,
        avgSalary: 5400.0,
        totalSalaryBill: 820800.0,
        newHires: 3,
        jobVacancies: 8,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 154,
        avgSalary: 5480.0,
        totalSalaryBill: 843920.0,
        newHires: 5,
        jobVacancies: 6,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 158,
        avgSalary: 5520.0,
        totalSalaryBill: 872160.0,
        newHires: 4,
        jobVacancies: 5,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-6@yunnan-portal.gov.cn',
    username: 'demo_ent_6',
    fullName: '演示楚雄联系人',
    organizationName: '楚雄彝州绿色能源有限公司',
    cityCode: '532301',
    creditCode: '91532301MA7D8EXAMPLE06',
    enterpriseName: '楚雄彝州绿色能源有限公司',
    enterpriseType: 'state',
    industry: 'mfg',
    address: '云南省楚雄彝族自治州楚雄市开发区永安路',
    baseEmployees: 92,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 94,
        avgSalary: 7100.0,
        totalSalaryBill: 667400.0,
        newHires: 2,
        jobVacancies: 1,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 96,
        avgSalary: 7180.0,
        totalSalaryBill: 689280.0,
        newHires: 3,
        jobVacancies: 0,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-7@yunnan-portal.gov.cn',
    username: 'demo_ent_7',
    fullName: '演示红河联系人',
    organizationName: '红河边境贸易加工有限公司',
    cityCode: '532503',
    creditCode: '91532503MA7D8EXAMPLE07',
    enterpriseName: '红河边境贸易加工有限公司',
    enterpriseType: 'private',
    industry: 'mfg',
    address: '云南省红河哈尼族彝族自治州蒙自市雨过铺街道',
    baseEmployees: 178,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2025,
        periodQuarter: 4,
        surveyPeriod: 'Q4 2025',
        currentEmployees: 175,
        avgSalary: 5800.0,
        totalSalaryBill: 1015000.0,
        newHires: 7,
        jobVacancies: 4,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 180,
        avgSalary: 5850.0,
        totalSalaryBill: 1053000.0,
        newHires: 6,
        jobVacancies: 3,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-8@yunnan-portal.gov.cn',
    username: 'demo_ent_8',
    fullName: '演示版纳联系人',
    organizationName: '景洪热带文旅服务有限公司',
    cityCode: '532801',
    creditCode: '91532801MA7D8EXAMPLE08',
    enterpriseName: '景洪热带文旅服务有限公司',
    enterpriseType: 'private',
    industry: 'service',
    address: '云南省西双版纳傣族自治州景洪市告庄西双景',
    baseEmployees: 64,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 68,
        avgSalary: 4650.0,
        totalSalaryBill: 316200.0,
        newHires: 5,
        jobVacancies: 12,
        status: 'approved',
      },
      {
        periodYear: 2026,
        periodQuarter: 2,
        surveyPeriod: 'Q2 2026',
        currentEmployees: 72,
        avgSalary: 4720.0,
        totalSalaryBill: 339840.0,
        newHires: 4,
        jobVacancies: 10,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-9@yunnan-portal.gov.cn',
    username: 'demo_ent_9',
    fullName: '演示昭通联系人',
    organizationName: '昭通乌蒙山生态农业合作社',
    cityCode: '530602',
    creditCode: '91530602MA7D8EXAMPLE09',
    enterpriseName: '昭通乌蒙山生态农业合作社',
    enterpriseType: 'private',
    industry: 'agri',
    address: '云南省昭通市昭阳区太平街道',
    baseEmployees: 54,
    filingStatus: 'approved',
    submissions: [
      {
        periodYear: 2026,
        periodQuarter: 1,
        surveyPeriod: 'Q1 2026',
        currentEmployees: 56,
        avgSalary: 4100.0,
        totalSalaryBill: 229600.0,
        newHires: 3,
        jobVacancies: 2,
        status: 'approved',
      },
    ],
  },
  {
    email: 'demo-enterprise-3@yunnan-portal.gov.cn',
    username: 'demo_ent_3',
    fullName: '演示企业三联系人',
    organizationName: '云南智联信息服务有限公司',
    cityCode: '530103',
    creditCode: '91530103MA7D8EXAMPLE03',
    enterpriseName: '云南智联信息服务有限公司',
    enterpriseType: 'private',
    industry: 'it',
    address: '云南省昆明市盘龙区北京路延长线',
    baseEmployees: 45,
    filingStatus: 'pending',
    submissions: [],
  },
];

async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return (data.users as User[]).find((u) => u.email === email) ?? null;
}

async function ensureUser(email: string, password: string) {
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error(`创建用户失败: ${email}`);
  return data.user;
}

async function upsertProfile(
  userId: string,
  row: {
    username: string;
    fullName: string;
    role: 'enterprise' | 'city' | 'admin';
    organizationName?: string | null;
    cityCode?: string | null;
  }
) {
  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: userId,
      username: row.username,
      full_name: row.fullName,
      role: row.role,
      organization_name: row.organizationName ?? null,
      city_code: row.cityCode ?? null,
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

const STAFF_ACCOUNTS: Array<{
  email: string;
  username: string;
  fullName: string;
  role: 'city' | 'admin';
  organizationName: string;
  cityCode: string | null;
}> = [
  {
    email: 'demo-city@yunnan-portal.gov.cn',
    username: 'demo_city',
    fullName: '演示市级专员',
    role: 'city',
    organizationName: '昆明市人力资源和社会保障数据分中心',
    cityCode: '530100',
  },
  {
    email: 'demo-admin@yunnan-portal.gov.cn',
    username: 'demo_admin',
    fullName: '演示省级管理员',
    role: 'admin',
    organizationName: '云南省人力资源和社会保障厅',
    cityCode: null,
  },
];

async function upsertFiling(userId: string, demo: DemoEnterprise) {
  const { data: existing } = await supabase
    .from('enterprise_filings')
    .select('id')
    .eq('credit_code', demo.creditCode)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('enterprise_filings')
      .update({
        user_id: userId,
        enterprise_name: demo.enterpriseName,
        enterprise_type: demo.enterpriseType,
        industry: demo.industry,
        address: demo.address,
        region: '云南省 [530000]',
        contact_person: demo.fullName,
        contact_phone: '13800138000',
        contact_email: demo.email,
        base_employee_count: demo.baseEmployees,
        status: demo.filingStatus,
        business_scope: '演示数据：软件开发、技术咨询及相关服务。',
      })
      .eq('id', existing.id)
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from('enterprise_filings')
    .insert({
      user_id: userId,
      credit_code: demo.creditCode,
      enterprise_name: demo.enterpriseName,
      enterprise_type: demo.enterpriseType,
      industry: demo.industry,
      address: demo.address,
      region: '云南省 [530000]',
      contact_person: demo.fullName,
      contact_phone: '13800138000',
      contact_email: demo.email,
      base_employee_count: demo.baseEmployees,
      status: demo.filingStatus,
      business_scope: '演示数据：软件开发、技术咨询及相关服务。',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertSubmissions(
  enterpriseId: string,
  userId: string,
  baseEmployees: number,
  demo: DemoEnterprise
) {
  for (const s of demo.submissions) {
    const row = {
      enterprise_id: enterpriseId,
      user_id: userId,
      survey_period: s.surveyPeriod,
      period_year: s.periodYear,
      period_quarter: s.periodQuarter,
      base_employee_count: baseEmployees,
      current_employee_count: s.currentEmployees,
      avg_salary: s.avgSalary,
      total_salary_bill: s.totalSalaryBill,
      new_hires: s.newHires,
      job_vacancies: s.jobVacancies,
      status: s.status,
      submitted_at: s.status === 'draft' ? null : new Date().toISOString(),
    };

    const { error } = await supabase.from('data_submissions').upsert(row, {
      onConflict: 'enterprise_id,period_year,period_quarter',
    });
    if (error) throw error;
  }
}

async function main() {
  console.log('开始写入演示数据（企业用户 / 备案 / 填报）…');

  for (const demo of DEMOS) {
    const user = await ensureUser(demo.email, DEMO_PASSWORD);
    await upsertProfile(user.id, {
      username: demo.username,
      fullName: demo.fullName,
      role: 'enterprise',
      organizationName: demo.organizationName,
      cityCode: demo.cityCode,
    });
    const filingId = await upsertFiling(user.id, demo);
    await upsertSubmissions(filingId, user.id, demo.baseEmployees, demo);
    console.log(`  ✓ ${demo.enterpriseName} (${demo.email})`);
  }

  console.log('');
  console.log('写入市级 / 省级演示账号…');
  for (const s of STAFF_ACCOUNTS) {
    const user = await ensureUser(s.email, DEMO_PASSWORD);
    await upsertProfile(user.id, {
      username: s.username,
      fullName: s.fullName,
      role: s.role,
      organizationName: s.organizationName,
      cityCode: s.cityCode,
    });
    console.log(`  ✓ ${s.role === 'city' ? '市级' : '省级'} ${s.username} (${s.email})`);
  }

  console.log('');
  console.log('完成。演示账号密码（默认）：', DEMO_PASSWORD);
  console.log('企业：demo_ent_1 / 市级：demo_city（选「市级管理」）/ 省级：demo_admin（选「省级管理」）');
  console.log('也可使用完整邮箱登录。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
