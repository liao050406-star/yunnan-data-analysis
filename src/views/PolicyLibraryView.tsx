import { useState } from 'react';
import { motion } from 'motion/react';
import { Library, Search, FileText, BookOpen, Gavel, BookMarked, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { usePolicies } from '../hooks/useApi';

const CATEGORY_CONFIG = {
  law: { label: '法律', icon: Gavel, cls: 'bg-error-container/20 text-on-error-container' },
  regulation: { label: '法规', icon: BookMarked, cls: 'bg-primary/10 text-primary' },
  notice: { label: '通知', icon: FileText, cls: 'bg-secondary-container/20 text-on-secondary-container' },
  guide: { label: '指引', icon: BookOpen, cls: 'bg-tertiary-container/20 text-on-tertiary-container' },
};

export default function PolicyLibraryView() {
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');

  const { data: policies, isLoading, refetch } = usePolicies(keyword, category);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10 pb-20">
      <div>
        <div className="text-xs font-black text-primary uppercase tracking-widest mb-2 font-headline">Policy & Regulation Library</div>
        <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">政策法规汇编</h1>
        <p className="text-on-surface-variant font-medium mt-1">云南省就业数据采集相关法规、通知及操作指引汇总。</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-outline" />
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setKeyword(searchInput)}
            placeholder="搜索政策名称、发文机关..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant/20 rounded-2xl text-sm text-on-surface shadow-cloud focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
        </div>
        <button onClick={() => setKeyword(searchInput)}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-headline font-black text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
          检索
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 flex-wrap">
        {[{ key: '', label: '全部' }, ...Object.entries(CATEGORY_CONFIG).map(([key, v]) => ({ key, label: v.label }))].map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all",
              category === c.key
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-low"
            )}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Policy List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : (policies || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl shadow-cloud border border-outline-variant/10 text-on-surface-variant">
            <AlertCircle className="size-10 opacity-30 mb-3" />
            <p className="font-medium text-sm">未找到相关政策文件</p>
          </div>
        ) : (policies || []).map((policy: any) => {
          const cfg = CATEGORY_CONFIG[policy.category as keyof typeof CATEGORY_CONFIG] || { label: policy.category, icon: FileText, cls: 'bg-surface-container-high text-on-surface-variant' };
          return (
            <div key={policy.id} className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-6 hover:border-primary/20 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", cfg.cls)}>
                  <cfg.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-headline font-black text-on-surface group-hover:text-primary transition-colors leading-snug">{policy.title}</h3>
                    <ExternalLink className="size-4 text-outline opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 mb-3">
                    <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider", cfg.cls)}>{cfg.label}</span>
                    {policy.issuer && <span className="text-xs text-on-surface-variant font-medium">{policy.issuer}</span>}
                    {policy.issue_date && <span className="text-xs text-on-surface-variant">{policy.issue_date}</span>}
                  </div>
                  {policy.summary && (
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{policy.summary}</p>
                  )}
                  {(policy.tags || []).length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {policy.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full"># {tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="bg-surface-container-low/50 rounded-2xl p-6 border border-outline-variant/10">
        <div className="flex items-start gap-3">
          <Library className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-on-surface mb-1">关于政策库</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              本政策法规汇编由省级系统管理员维护更新，仅供参考。如需获取正式法律文本，请访问云南省人力资源和社会保障厅官方网站或中国政府法制信息网。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
