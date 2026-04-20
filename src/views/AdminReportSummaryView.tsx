import { motion } from 'motion/react';
import { ClipboardCheck, Download, FileSpreadsheet, PieChart, ArrowUpRight, Filter, Search, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const SUMMARY_DATA = [
  { id: 1, name: '昆明市 2026 Q1 用工监测汇总表', type: '季度汇总', status: 'ready', count: 1240, date: '2026-04-10' },
  { id: 2, name: '全省制造业失业风险预警专项报告', type: '专项分析', status: 'processing', count: 450, date: '2026-04-18' },
  { id: 3, name: '曲靖市 3 月份企业申报数据对账单', type: '月度对账', status: 'ready', count: 892, date: '2026-04-12' },
  { id: 4, name: '玉溪市重点企业备案完整度审计表', type: '合规审计', status: 'ready', count: 312, date: '2026-04-05' },
];

export default function AdminReportSummaryView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-10 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-headline mb-2">Aggregate Reporting Center</div>
          <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">报表汇总上报</h1>
          <p className="text-on-surface-variant font-medium mt-1">省级统筹数据导出与周期性分析汇总管理。</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-white border border-outline-variant/30 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center gap-2">
              <Filter className="size-3" /> 筛选统计周期
           </button>
           <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2">
              <FileSpreadsheet className="size-3" /> 生成全量汇总
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '已生成汇总', value: '14', icon: CheckCircle2, color: 'text-tertiary-container' },
          { label: '处理中任务', value: '03', icon: Clock, color: 'text-primary' },
          { label: '覆盖企业总数', value: '2.4k', icon: PieChart, color: 'text-on-surface' },
          { label: '异常报表数', value: '12', icon: ArrowUpRight, color: 'text-error' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all">
             <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-headline font-black text-on-surface">{stat.value}</p>
             </div>
             <div className={cn("size-10 rounded-xl bg-surface-container-low flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="size-5" />
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-cloud overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-container-low/30">
           <div className="flex items-center gap-4">
              <ClipboardCheck className="text-primary size-6" />
              <h3 className="font-headline font-black text-xl text-on-surface">汇总报告清单</h3>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
              <input 
                type="text" 
                placeholder="搜索报告名称..." 
                className="pl-11 pr-6 py-3 bg-white border border-outline-variant/30 rounded-xl text-sm font-medium w-80 outline-none focus:border-primary transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">报表名称</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">分类</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">覆盖项</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">生成时间</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">状态</th>
                <th className="pr-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {SUMMARY_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{item.type}</span>
                  </td>
                  <td className="px-8 py-6 text-center font-mono text-xs font-bold text-on-surface">
                    {item.count}
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-on-surface-variant">
                    {item.date}
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      item.status === 'ready' ? "bg-tertiary-container/10 text-tertiary-container" : "bg-primary/10 text-primary animate-pulse"
                    )}>
                       <div className="size-1.5 rounded-full bg-current" />
                       {item.status === 'ready' ? '就绪' : '生成中'}
                    </div>
                  </td>
                  <td className="pr-8 py-6 text-right">
                    <button className={cn(
                      "p-2 rounded-lg transition-all",
                      item.status === 'ready' ? "text-primary hover:bg-primary/10" : "text-outline opacity-50 cursor-not-allowed"
                    )}>
                      <Download className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 border-t border-outline-variant/10 flex justify-center">
           <button className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] hover:text-primary transition-all">LOAD ARCHIVED REPORTS • 加载存档报告</button>
        </div>
      </div>
    </motion.div>
  );
}
