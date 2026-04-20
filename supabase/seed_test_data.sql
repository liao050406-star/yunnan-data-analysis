-- ============================================================
-- 额外测试数据（可在 Supabase SQL Editor 中单独执行，可重复执行）
-- 依赖：已执行 schema.sql 建表与初始种子
-- ============================================================

-- 调查周期：未来与历史补充
INSERT INTO public.survey_cycles (name, period_label, period_year, period_quarter, open_date, deadline, status)
VALUES
  ('2026年第三季度就业调查', 'Q3 2026', 2026, 3, '2026-07-01', '2026-09-30', 'pending'),
  ('2026年第四季度就业调查', 'Q4 2026', 2026, 4, '2026-10-01', '2026-12-31', 'pending'),
  ('2027年第一季度就业调查', 'Q1 2027', 2027, 1, '2027-01-01', '2027-03-31', 'pending')
ON CONFLICT (period_label) DO NOTHING;

-- 政策法规（按标题去重）
INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
SELECT '中华人民共和国劳动法（2018修正）', 'law', '全国人民代表大会常务委员会', '2018-12-29'::date,
       '劳动用工、劳动合同与工资支付的基础法律依据。', ARRAY['劳动法', '用工', '合同']::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.policy_documents WHERE title = '中华人民共和国劳动法（2018修正）');

INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
SELECT '云南省就业促进条例', 'regulation', '云南省人大常委会', '2022-03-25'::date,
       '规范本省促进就业、稳定岗位与公共就业服务。', ARRAY['就业', '地方条例']::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.policy_documents WHERE title = '云南省就业促进条例');

INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
SELECT '云南省社会保险费征缴暂行规定', 'regulation', '云南省人民政府', '2020-08-10'::date,
       '用人单位社会保险登记、申报与征缴的基本要求。', ARRAY['社保', '征缴']::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.policy_documents WHERE title = '云南省社会保险费征缴暂行规定');

INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
SELECT '企业用工信息填报系统常见问题解答', 'guide', '云南省人社厅信息中心', '2026-02-01'::date,
       '针对本系统登录、填报与审核流程的常见问题说明。', ARRAY['FAQ', '系统', '填报']::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.policy_documents WHERE title = '企业用工信息填报系统常见问题解答');

INSERT INTO public.policy_documents (title, category, issuer, issue_date, summary, tags)
SELECT '关于加强制造业用工监测的紧急通知', 'notice', '云南省工信厅', '2026-03-15'::date,
       '对重点制造业企业增加月度用工波动说明要求。', ARRAY['制造业', '监测', '紧急']::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.policy_documents WHERE title = '关于加强制造业用工监测的紧急通知');

-- 区域网格（地州与区县补充）
INSERT INTO public.regional_grids (region_name, region_code, parent_code, grid_count, assigned_user_count, enterprise_count, status)
VALUES
  ('曲靖市麒麟区', '530302', '530300', 14, 48, 920, 'stable'),
  ('玉溪市红塔区', '530402', '530400', 11, 40, 780, 'stable'),
  ('大理市', '532901', '532900', 16, 55, 1050, 'stable'),
  ('楚雄市', '532301', '532300', 9, 32, 610, 'stable'),
  ('蒙自市', '532503', '532500', 10, 36, 700, 'warning'),
  ('文山市', '532601', '532600', 8, 28, 520, 'stable'),
  ('景洪市', '532801', '532800', 13, 44, 880, 'stable'),
  ('香格里拉市', '533401', '533400', 6, 20, 340, 'stable')
ON CONFLICT (region_code) DO NOTHING;
