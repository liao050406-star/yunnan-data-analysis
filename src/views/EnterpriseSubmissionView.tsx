import { motion } from 'motion/react';
import { FileUp, Clock, AlertCircle, Info, Send, Save, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function EnterpriseSubmissionView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-32"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-xs font-black text-primary uppercase tracking-widest mb-2 font-headline">Monthly Data Reporting • 2026.04</div>
          <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">月度数据填报</h1>
          <p className="text-on-surface-variant font-medium mt-1">请真实反馈当前调查周期内的企业用工状况。</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-cloud border border-outline-variant/10 flex items-center gap-5">
           <div className="size-10 bg-error/10 text-error rounded-full flex items-center justify-center">
              <Clock className="size-5" />
           </div>
           <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">截止剩余</div>
              <div className="font-headline font-black text-error text-xl tabular-nums">03 Days 14:24</div>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
          <div className="bg-surface-container-low px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center">
             <h3 className="font-headline font-black text-lg text-on-surface">模块一：就业人数 <span className="text-sm font-medium text-on-surface-variant ml-2 tracking-normal">Employment Metrics</span></h3>
             <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Q2 2026 CYCLE</span>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                   建档期基期人数 <span className="text-error">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    readOnly 
                    value="1250" 
                    className="w-full bg-surface-container-low text-on-surface-variant border-none rounded-xl px-5 py-4 text-lg font-headline font-bold cursor-not-allowed outline-none"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-medium text-outline">Persons (不可修改)</div>
                </div>
                <p className="text-xs text-outline flex items-center gap-1.5"><Info className="size-3" /> 此数据为企业在首次备案时锁定的初始规模。</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface uppercase tracking-widest">
                   本期末在岗人数 <span className="text-error">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    placeholder="请输入实际人数"
                    className="w-full bg-surface-container-low border-b-4 border-transparent focus:border-primary focus:bg-white rounded-t-xl px-5 py-4 text-xl font-headline font-bold text-on-surface outline-none transition-all"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">PERSONS</div>
                </div>
              </div>
            </div>

            {/* Warning Message Component */}
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-error-container/30 rounded-2xl p-8 border border-error/10 relative"
            >
              <div className="absolute -top-3 left-6 bg-error text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                <TrendingDown className="size-3 shrink-0" /> 检测到就业规模下降
              </div>
              
              <div className="mt-2 space-y-8">
                <p className="text-sm font-bold text-on-error-container leading-relaxed">系统检测到本期就业人数相较基期显著下降。根据《云南省重点企业用工监测办法》，请详细说明减少原因：</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-error-container/80 uppercase tracking-widest">减少类型 <span className="text-error">*</span></label>
                    <select className="w-full bg-white text-on-surface border-none rounded-xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-error/20 outline-none">
                      <option value="" disabled selected>请选择减员类型</option>
                      <option>自然流失/合同到期</option>
                      <option>结构性调整/产业转移</option>
                      <option>订单缩减/经营困难</option>
                      <option>季节性/周期性停工</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-error-container/80 uppercase tracking-widest">核心诱因 <span className="text-error">*</span></label>
                    <select className="w-full bg-white text-on-surface border-none rounded-xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-error/20 outline-none">
                      <option value="" disabled selected>请选择诱因</option>
                      <option>订单不足</option>
                      <option>自动化替代</option>
                      <option>招工难/工资成本上涨</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-on-error-container/80 uppercase tracking-widest">补充说明 <span className="text-error">*</span></label>
                  <textarea 
                    rows={4}
                    placeholder="请详细描述减员背景、受影响岗位及后续处理计划..."
                    className="w-full bg-white text-on-surface border-none rounded-xl px-5 py-4 font-sans text-sm focus:ring-2 focus:ring-error/20 outline-none resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-white/90 backdrop-blur-md px-10 py-5 flex justify-between items-center z-40 border-t border-outline-variant/20 shadow-cloud">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
           <CheckCircle2 className="size-4" /> AUTO-SAVED: 10:24 AM
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2">
            <Save className="size-4" /> 保存当前进度
          </button>
          <button className="px-10 py-3 bg-primary text-white font-black rounded-xl text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            确认并上报 <Send className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
