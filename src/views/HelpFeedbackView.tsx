import { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Send, CheckCircle2, MessageSquare, BookOpen, Headset, Loader2, AlertCircle } from 'lucide-react';
import { useMutation, useMyFeedback } from '../hooks/useApi';
import { feedbackApi } from '../api/client';

export default function HelpFeedbackView() {
  const [form, setForm] = useState({ category: 'question', subject: '', content: '', priority: 'normal' });
  const [submitted, setSubmitted] = useState(false);

  const { data: tickets, refetch } = useMyFeedback();
  const { mutate: submit, isLoading, error } = useMutation(
    () => feedbackApi.submit(form as any)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(undefined);
    setSubmitted(true);
    setForm({ category: 'question', subject: '', content: '', priority: 'normal' });
    refetch();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const STATUS_LABELS: Record<string, string> = {
    open: '待处理', in_progress: '处理中', resolved: '已解决', closed: '已关闭'
  };
  const CATEGORY_LABELS: Record<string, string> = {
    bug: '问题报告', feature: '功能建议', question: '使用咨询', complaint: '投诉建议', other: '其他'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10 pb-20">
      <div>
        <div className="text-xs font-black text-primary uppercase tracking-widest mb-2 font-headline">Support & Help Center</div>
        <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">系统帮助与反馈</h1>
        <p className="text-on-surface-variant font-medium mt-1">遇到使用问题？请通过以下渠道获取支持。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, title: '操作手册', desc: '查看详细的系统使用指南和填报说明', action: '在线查看', color: 'text-primary bg-primary/5 border-primary/10' },
          { icon: Headset, title: '电话支持', desc: '工作日 9:00-18:00 专线技术支持服务', action: '0871-12345678', color: 'text-secondary-container bg-secondary-container/10 border-secondary-container/20' },
          { icon: MessageSquare, title: '在线工单', desc: '提交问题工单，1个工作日内响应', action: '提交工单↓', color: 'text-tertiary-container bg-tertiary-container/10 border-tertiary-container/20' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl p-6 shadow-cloud border flex flex-col gap-4 ${card.color.split(' ')[2]}`}>
            <div className={`size-12 rounded-xl flex items-center justify-center ${card.color.split(' ').slice(0, 2).join(' ')}`}>
              <card.icon className="size-6" />
            </div>
            <div>
              <h3 className="font-headline font-black text-on-surface">{card.title}</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">{card.desc}</p>
            </div>
            <span className={`text-xs font-black ${card.color.split(' ')[0]}`}>{card.action}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30">
            <h3 className="font-headline font-black text-lg text-on-surface">提交问题工单</h3>
          </div>
          <div className="p-6">
            {submitted && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 bg-tertiary-container/20 text-on-tertiary-container p-4 rounded-xl border border-tertiary-container/20">
                <CheckCircle2 className="size-4 shrink-0" />
                <p className="text-sm font-bold">工单已提交，我们将在1个工作日内回复。</p>
              </motion.div>
            )}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-error-container/20 text-on-error-container p-4 rounded-xl border border-error/20">
                <AlertCircle className="size-4 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1.5">问题类型</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary rounded-t-lg px-4 py-3 text-sm outline-none">
                  <option value="bug">🐛 问题报告</option>
                  <option value="feature">💡 功能建议</option>
                  <option value="question">❓ 使用咨询</option>
                  <option value="complaint">📢 投诉建议</option>
                  <option value="other">📝 其他</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1.5">问题标题 *</label>
                <input required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="简短描述您遇到的问题"
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary rounded-t-lg px-4 py-3 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1.5">详细描述 *</label>
                <textarea required rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="请详细描述问题现象、操作步骤或建议内容..."
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary rounded-t-lg px-4 py-3 text-sm outline-none resize-none" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-headline font-black text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0">
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {isLoading ? '提交中...' : '提交工单'}
              </button>
            </form>
          </div>
        </div>

        {/* My Tickets */}
        <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30">
            <h3 className="font-headline font-black text-lg text-on-surface">我的工单记录</h3>
          </div>
          <div className="divide-y divide-outline-variant/10 max-h-[480px] overflow-y-auto">
            {(tickets || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                <HelpCircle className="size-10 opacity-30 mb-3" />
                <p className="text-sm font-medium">暂无工单记录</p>
              </div>
            ) : (tickets || []).map((ticket: any) => (
              <div key={ticket.id} className="p-5 hover:bg-surface-container-low/30 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-bold text-sm text-on-surface truncate">{ticket.subject}</div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${
                    ticket.status === 'resolved' ? 'bg-tertiary-container/20 text-on-tertiary-container' :
                    ticket.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                    'bg-secondary-container/20 text-on-secondary-container'
                  }`}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                  <span className="bg-surface-container-high px-2 py-0.5 rounded-full font-bold">
                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                  </span>
                  <span>{new Date(ticket.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
