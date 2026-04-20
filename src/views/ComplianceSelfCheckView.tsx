import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useComplianceCheck } from '../hooks/useApi';

const STATUS_CONFIG = {
  pass: { icon: CheckCircle, cls: 'bg-tertiary-container/10 text-tertiary-container', label: '达标' },
  warning: { icon: AlertTriangle, cls: 'bg-secondary-container/10 text-secondary-container', label: '待完善' },
  fail: { icon: AlertTriangle, cls: 'bg-error-container/10 text-error', label: '未达标' },
  pending: { icon: Clock, cls: 'bg-surface-container-high text-on-surface-variant', label: '待评估' },
};

export default function ComplianceSelfCheckView() {
  const { data, isLoading, refetch } = useComplianceCheck();
  const score = data?.score ?? 0;
  const items = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-xs font-black text-primary uppercase tracking-widest mb-2 font-headline">Compliance & Risk Assessment</div>
          <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">合规状态自检</h1>
          <p className="text-on-surface-variant font-medium mt-1">基于省级数据监测算法的实时合规性评估报告。</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-cloud border border-outline-variant/10 flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">当前合规评分</span>
              <span className="font-headline font-black text-3xl text-primary tabular-nums">
                {isLoading ? '—' : score}<span className="text-sm font-medium">/100</span>
              </span>
            </div>
            {isLoading
              ? <Loader2 className="size-8 text-primary animate-spin" />
              : <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-[spin_3s_linear_infinite]" />
            }
          </div>
          <button onClick={refetch}
            className="px-5 py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
            <RefreshCw className="size-4" /> 重新检测
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30">
              <h3 className="font-headline font-black text-lg text-on-surface">合规审计明细</h3>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="size-8 text-primary animate-spin" />
                </div>
              ) : items.map((item: any) => {
                const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                return (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-surface-container-low/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", cfg.cls)}>
                        <cfg.icon className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-on-surface">{item.title}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          最近检测: {item.lastAudit || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-headline font-black text-2xl text-on-surface tabular-nums">{item.score}</div>
                        <div className="text-[10px] font-bold text-on-surface-variant">/ 100</div>
                      </div>
                      <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider", cfg.cls)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-6">
            <h3 className="font-headline font-black text-lg text-on-surface mb-6">综合评级</h3>
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "size-28 rounded-full flex items-center justify-center border-8 text-4xl font-headline font-black",
                score >= 90 ? "border-tertiary-container text-tertiary-container bg-tertiary-container/10" :
                score >= 70 ? "border-secondary-container text-secondary-container bg-secondary-container/10" :
                "border-error text-error bg-error/10"
              )}>
                {score >= 90 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D'}
              </div>
              <div className="text-center">
                <div className="font-headline font-black text-3xl text-on-surface">{score} <span className="text-sm font-medium text-on-surface-variant">分</span></div>
                <div className="text-xs text-on-surface-variant mt-1">
                  {score >= 90 ? '优秀合规' : score >= 70 ? '基本合规' : score >= 50 ? '需要改进' : '存在重大风险'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-6">
            <h3 className="font-headline font-black text-base text-on-surface mb-4">改进建议</h3>
            <div className="space-y-3">
              {items.filter((i: any) => i.status !== 'pass').map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-surface-container-low rounded-xl">
                  <p className="text-xs font-bold text-on-surface">{item.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {item.status === 'warning' ? '请尽快完善相关信息' : '此项目尚未完成，请及时处理'}
                  </p>
                </div>
              ))}
              {items.filter((i: any) => i.status !== 'pass').length === 0 && (
                <div className="flex items-center gap-2 text-xs text-on-tertiary-container">
                  <ShieldCheck className="size-4" />
                  <span className="font-bold">全部项目达标，无改进建议</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
