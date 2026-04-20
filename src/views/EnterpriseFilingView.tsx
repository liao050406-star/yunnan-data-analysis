import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Landmark, MapPin, Phone, Mail, FileText, CheckCircle, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { useMyFiling, useMutation } from '../hooks/useApi';
import { filingApi } from '../api/client';

export default function EnterpriseFilingView() {
  const { data: filing, isLoading, refetch } = useMyFiling();
  const [form, setForm] = useState({
    credit_code: '', enterprise_name: '', enterprise_type: '', industry: '',
    business_scope: '', address: '', postal_code: '', contact_person: '',
    contact_phone: '', contact_email: '', base_employee_count: '',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { mutate: saveDraft, isLoading: isSaving } = useMutation(
    async () => {
      if (filing?.id) return filingApi.saveDraft(filing.id, form);
      return filingApi.createFiling({ ...form, status: 'draft' });
    }
  );

  const { mutate: submit, isLoading: isSubmitting, error: submitError } = useMutation(
    async () => {
      if (filing?.id) return filingApi.updateFiling(filing.id, form);
      return filingApi.createFiling(form);
    }
  );

  const f = (field: keyof typeof form) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value })),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  const isReadOnly = filing?.status === 'pending' || filing?.status === 'approved';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-24"
    >
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 font-headline">
        <span className="hover:text-primary cursor-pointer transition-colors">数据上报</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-bold">企业备案填报</span>
      </nav>

      <div className="mb-10 relative p-8 bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight mb-3">企业备案信息填报</h1>
          <p className="text-on-surface-variant font-medium max-w-2xl leading-relaxed">
            请完善企业注册信息。准确的信息是符合云南省从业数据标准的前提。备案信息将由所在地市级网格管理员进行异步审核。
          </p>
          {filing?.status && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
              filing.status === 'approved' ? 'bg-tertiary-container text-on-tertiary-container' :
              filing.status === 'pending' ? 'bg-secondary-container text-on-secondary-container' :
              filing.status === 'rejected' ? 'bg-error-container text-on-error-container' :
              'bg-surface-container-high text-on-surface-variant'
            }`}>
              <div className="size-1.5 rounded-full bg-current" />
              {filing.status === 'approved' ? '审核通过' :
               filing.status === 'pending' ? '审核中' :
               filing.status === 'rejected' ? `已退回: ${filing.audit_note || ''}` : '草稿'}
            </div>
          )}
        </div>
        <Building2 className="absolute top-0 right-8 size-48 text-primary opacity-5 pointer-events-none -translate-y-8" />
      </div>

      {submitError && (
        <div className="mb-6 flex items-center gap-3 bg-error-container/30 text-on-error-container p-4 rounded-xl border border-error/20">
          <AlertCircle className="size-4 shrink-0" />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-tertiary-container/30 text-on-tertiary-container p-4 rounded-xl border border-tertiary-container/20">
          <CheckCircle className="size-4 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-10 mb-8 shadow-cloud border border-outline-variant/10">
        <div className="space-y-16">
          {/* 01 基本主体信息 */}
          <section>
            <h3 className="text-lg font-headline font-black text-on-surface mb-8 border-b-2 border-surface-container-low pb-2 inline-block">01 基本主体信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Landmark className="size-3" /> 所属地区 <span className="text-error">*</span>
                </label>
                <input
                  type="text" readOnly value="云南省 [530000]"
                  className="w-full bg-surface-container-low text-on-surface-variant border-0 rounded-xl px-4 py-3.5 font-sans text-sm cursor-not-allowed select-none outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <FileText className="size-3" /> 组织机构代码 / 信用代码 <span className="text-error">*</span>
                </label>
                <input
                  type="text" placeholder="请输入18位统一社会信用代码"
                  disabled={isReadOnly}
                  {...f('credit_code')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="size-3" /> 企业/主体名称 <span className="text-error">*</span>
                </label>
                <input
                  type="text" placeholder="请输入由工商部门核准的法律注册全称"
                  disabled={isReadOnly}
                  {...f('enterprise_name')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* 02 性质与分类 */}
          <section>
            <h3 className="text-lg font-headline font-black text-on-surface mb-8 border-b-2 border-surface-container-low pb-2 inline-block">02 性质与分类</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">单位性质 <span className="text-error">*</span></label>
                <div className="relative">
                  <select disabled={isReadOnly} {...f('enterprise_type')}
                    className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all appearance-none outline-none disabled:opacity-60">
                    <option value="" disabled>请选择主体性质</option>
                    <option value="state">国有企业</option>
                    <option value="private">民营/股份制</option>
                    <option value="foreign">外商/港澳台投资</option>
                    <option value="gov">机关/事业单位</option>
                  </select>
                  <Navigation className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">所属行业 <span className="text-error">*</span></label>
                <div className="relative">
                  <select disabled={isReadOnly} {...f('industry')}
                    className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all appearance-none outline-none disabled:opacity-60">
                    <option value="" disabled>请选择所属行业门类</option>
                    <option value="it">信息技术/互联网</option>
                    <option value="mfg">制造业</option>
                    <option value="agri">高原特色农业</option>
                    <option value="service">现代服务业</option>
                  </select>
                  <Navigation className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">主营业务/经营范围 <span className="text-error">*</span></label>
                <textarea
                  placeholder="请简述主体当前的主要经营活动..." rows={3}
                  disabled={isReadOnly} {...f('business_scope')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none resize-none disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* 03 通讯与位置 */}
          <section>
            <h3 className="text-lg font-headline font-black text-on-surface mb-8 border-b-2 border-surface-container-low pb-2 inline-block">03 通讯与位置信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="size-3" /> 注册详细地址 <span className="text-error">*</span>
                </label>
                <input type="text" placeholder="省/市/区县/街道/路/号" disabled={isReadOnly} {...f('address')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Navigation className="size-3" /> 邮政编码 <span className="text-error">*</span>
                </label>
                <input type="text" placeholder="请输入6位邮编" disabled={isReadOnly} {...f('postal_code')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="size-3" /> 报送联系人 <span className="text-error">*</span>
                </label>
                <input type="text" placeholder="真实姓名" disabled={isReadOnly} {...f('contact_person')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Phone className="size-3" /> 联系电话/手机 <span className="text-error">*</span>
                </label>
                <input type="tel" placeholder="用于紧急数据核对" disabled={isReadOnly} {...f('contact_phone')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Mail className="size-3" /> 电子邮箱 <span className="text-error">*</span>
                </label>
                <input type="email" placeholder="用于公文及反馈接收" disabled={isReadOnly} {...f('contact_email')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">建档期基期人数 <span className="text-error">*</span></label>
                <input type="number" placeholder="首次备案人员规模（后续锁定）" disabled={isReadOnly || (filing?.status === 'approved')} {...f('base_employee_count')}
                  className="w-full bg-surface-container-low text-on-surface border-0 border-b-2 border-transparent focus:border-primary focus:bg-white focus:shadow-sm focus:ring-0 rounded-t-xl px-4 py-3.5 font-sans text-sm transition-all outline-none disabled:opacity-60" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {!isReadOnly && (
        <div className="fixed bottom-0 right-0 left-64 bg-white/90 backdrop-blur-md px-10 py-5 flex justify-end gap-5 border-t border-outline-variant/20 z-40 shadow-cloud">
          <button
            disabled={isSaving}
            onClick={async () => {
              await saveDraft(undefined);
              setSuccessMsg('草稿已保存');
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
            className="px-8 py-3 bg-surface-container-high text-on-surface-variant rounded-xl font-headline font-bold text-sm hover:bg-surface-container-highest transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            保存草稿
          </button>
          <button
            disabled={isSubmitting}
            onClick={async () => {
              await submit(undefined);
              refetch();
              setSuccessMsg('备案信息已提交，等待审核');
              setTimeout(() => setSuccessMsg(null), 5000);
            }}
            className="px-10 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-headline font-black text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
            上报备案信息
          </button>
        </div>
      )}
    </motion.div>
  );
}
