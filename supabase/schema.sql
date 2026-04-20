-- ============================================================
-- 云南省企业数据采集系统 - Supabase 数据库初始化脚本
-- Yunnan Municipal Data Portal - Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. 用户档案表 (users profile - extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('enterprise', 'city', 'admin')),
  organization_name TEXT,
  city_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. 企业备案信息表 (Enterprise Registration)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enterprise_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 基本主体信息
  region TEXT NOT NULL DEFAULT '云南省 [530000]',
  credit_code TEXT NOT NULL UNIQUE,
  enterprise_name TEXT NOT NULL,
  
  -- 性质与分类
  enterprise_type TEXT CHECK (enterprise_type IN ('state', 'private', 'foreign', 'gov')),
  industry TEXT CHECK (industry IN ('it', 'mfg', 'agri', 'service')),
  business_scope TEXT,
  
  -- 通讯与位置
  address TEXT,
  postal_code TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- 元数据
  base_employee_count INTEGER DEFAULT 0, -- 建档期基期人数（首次填报锁定）
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  audit_note TEXT,
  audited_by UUID REFERENCES auth.users(id),
  audited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. 月度数据填报表 (Monthly Submission)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.data_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise_filings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- 周期
  survey_period TEXT NOT NULL,   -- e.g. "Q2 2026"
  period_year INTEGER NOT NULL,
  period_quarter INTEGER NOT NULL CHECK (period_quarter BETWEEN 1 AND 4),
  
  -- 就业人数
  base_employee_count INTEGER NOT NULL,        -- 基期人数（只读）
  current_employee_count INTEGER NOT NULL,     -- 本期末在岗人数
  
  -- 减员说明（若有下降则必填）
  decline_type TEXT,      -- 减少类型
  decline_cause TEXT,     -- 核心诱因
  decline_remark TEXT,    -- 补充说明
  
  -- 工资薪酬模块
  avg_salary NUMERIC(12, 2),          -- 本期平均工资
  total_salary_bill NUMERIC(14, 2),   -- 本期工资总额
  
  -- 招聘与空缺
  new_hires INTEGER DEFAULT 0,
  job_vacancies INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  audit_note TEXT,
  audited_by UUID REFERENCES auth.users(id),
  audited_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(enterprise_id, period_year, period_quarter)
);

-- ─────────────────────────────────────────────
-- 4. 调查周期配置表 (Survey Cycles)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.survey_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  period_label TEXT NOT NULL UNIQUE,   -- e.g. "Q2 2026"
  period_year INTEGER NOT NULL,
  period_quarter INTEGER NOT NULL,
  open_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. 政策法规汇编表 (Policy Library)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.policy_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('law', 'regulation', 'notice', 'guide')),
  issuer TEXT,
  issue_date DATE,
  summary TEXT,
  content TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. 合规自检记录表 (Compliance Checks)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise_filings(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  filing_completeness INTEGER,
  submission_timeliness INTEGER,
  anomaly_explanation INTEGER,
  contact_validity INTEGER,
  survey_participation INTEGER,
  details JSONB
);

-- ─────────────────────────────────────────────
-- 7. 区域网格表 (Grid Management)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.regional_grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_name TEXT NOT NULL,
  region_code TEXT UNIQUE NOT NULL,
  parent_code TEXT,
  grid_count INTEGER DEFAULT 0,
  assigned_user_count INTEGER DEFAULT 0,
  enterprise_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'stable' CHECK (status IN ('stable', 'warning', 'critical')),
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. 系统审计日志表 (System Audit Logs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. 帮助与反馈表 (Help & Feedback)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT CHECK (category IN ('bug', 'feature', 'question', 'complaint', 'other')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

-- user_profiles: 用户只能读写自己的档案
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- enterprise_filings: 企业只能操作自己的备案；管理员可查看全部
CREATE POLICY "Enterprise manages own filings" ON public.enterprise_filings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins and city view all filings" ON public.enterprise_filings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'city'))
  );
CREATE POLICY "Admins can update filing status" ON public.enterprise_filings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'city'))
  );

-- data_submissions: 同上
CREATE POLICY "Enterprise manages own submissions" ON public.data_submissions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins and city view submissions" ON public.data_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'city'))
  );
CREATE POLICY "Admins update submission status" ON public.data_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'city'))
  );

-- survey_cycles: 所有人可读，仅 admin 可写
CREATE POLICY "All users read survey cycles" ON public.survey_cycles
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin manages cycles" ON public.survey_cycles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- policy_documents: 所有认证用户可读
CREATE POLICY "All users read policy docs" ON public.policy_documents
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "Admin manages policy docs" ON public.policy_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- compliance_checks: 企业读自己
CREATE POLICY "Enterprise reads own compliance" ON public.compliance_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enterprise_filings ef
      WHERE ef.id = enterprise_id AND ef.user_id = auth.uid()
    )
  );
CREATE POLICY "Admin reads all compliance" ON public.compliance_checks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'city'))
  );

-- regional_grids: 管理员可写，其他可读
CREATE POLICY "All read grids" ON public.regional_grids
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin manages grids" ON public.regional_grids
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- audit_logs: 用户可读自己的日志，管理员可读全部
CREATE POLICY "User reads own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin reads all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "System inserts audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- feedback_tickets: 用户操作自己的工单
CREATE POLICY "User manages own tickets" ON public.feedback_tickets
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin manages all tickets" ON public.feedback_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enterprise_filings_user ON public.enterprise_filings(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_filings_status ON public.enterprise_filings(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_filings_credit ON public.enterprise_filings(credit_code);
CREATE INDEX IF NOT EXISTS idx_data_submissions_enterprise ON public.data_submissions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_data_submissions_status ON public.data_submissions(status);
CREATE INDEX IF NOT EXISTS idx_data_submissions_period ON public.data_submissions(period_year, period_quarter);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_user ON public.feedback_tickets(user_id);

-- ─────────────────────────────────────────────
-- Triggers: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enterprise_filings_updated_at
  BEFORE UPDATE ON public.enterprise_filings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_data_submissions_updated_at
  BEFORE UPDATE ON public.data_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- Seed: 初始调查周期数据
-- ─────────────────────────────────────────────
INSERT INTO public.survey_cycles (name, period_label, period_year, period_quarter, open_date, deadline, status)
VALUES 
  ('2025年第一季度就业调查', 'Q1 2025', 2025, 1, '2025-01-01', '2025-03-31', 'closed'),
  ('2025年第二季度就业调查', 'Q2 2025', 2025, 2, '2025-04-01', '2025-06-30', 'closed'),
  ('2025年第三季度就业调查', 'Q3 2025', 2025, 3, '2025-07-01', '2025-09-30', 'closed'),
  ('2025年第四季度就业调查', 'Q4 2025', 2025, 4, '2025-10-01', '2025-12-31', 'closed'),
  ('2026年第一季度就业调查', 'Q1 2026', 2026, 1, '2026-01-01', '2026-03-31', 'closed'),
  ('2026年第二季度就业调查', 'Q2 2026', 2026, 2, '2026-04-01', '2026-06-30', 'active')
ON CONFLICT (period_label) DO NOTHING;

-- Seed: 政策法规
INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
VALUES 
  ('云南省重点企业用工监测管理办法', 'regulation', '云南省人力资源和社会保障厅', '2024-01-15', 
   '规定全省重点企业参与月度用工数据监测的基本义务和操作规程。', ARRAY['用工监测', '企业义务']),
  ('关于做好2026年企业用工数据统计工作的通知', 'notice', '云南省统计局', '2026-01-05',
   '明确2026年各季度数据上报时间节点和关键指标填报要求。', ARRAY['2026', '数据统计', '上报通知']),
  ('企业裁员及减员报告操作指引', 'guide', '云南省人社厅就业促进处', '2025-06-20',
   '指导企业在发生规模性减员时，依规填报减员原因及应对措施。', ARRAY['减员', '裁员', '操作指引'])
ON CONFLICT DO NOTHING;

-- Seed: 区域网格数据
INSERT INTO public.regional_grids (region_name, region_code, grid_count, assigned_user_count, enterprise_count, status)
VALUES 
  ('五华区', '530102', 12, 45, 840, 'stable'),
  ('盘龙区', '530103', 10, 38, 720, 'stable'),
  ('西山区', '530112', 15, 52, 1100, 'warning'),
  ('官渡区', '530111', 18, 64, 1450, 'stable'),
  ('呈贡区', '530114', 8, 30, 540, 'stable'),
  ('晋宁区', '530115', 6, 22, 380, 'stable'),
  ('富民县', '530124', 4, 15, 210, 'stable'),
  ('宜良县', '530125', 5, 18, 290, 'stable')
ON CONFLICT (region_code) DO NOTHING;
