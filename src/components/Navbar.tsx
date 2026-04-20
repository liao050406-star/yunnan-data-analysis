import { Bell, Search, Settings, User, LogOut, ShieldCheck, Languages, ExternalLink, Inbox, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  title: string;
  onLogout?: () => void;
}

export default function Navbar({ title, onLogout }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'settings' | null>(null);

  const toggleDropdown = (type: 'notifications' | 'settings') => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const notifications = [
    { id: 1, type: 'status', title: '数据上报成功', desc: '云南某重点制造企业 Q1 报表已通过初审。', time: '10分钟前', icon: CheckCircle, color: 'text-tertiary-container' },
    { id: 2, type: 'alert', title: '待办任务提示', desc: '您有 142 项待审核的企业备案申请，请查阅。', time: '2小时前', icon: Inbox, color: 'text-primary' },
    { id: 3, type: 'system', title: '系统更新成功', desc: '政务数据算法 V2.4 已部署完成。', time: '昨天', icon: AlertCircle, color: 'text-on-surface-variant' },
  ];

  const settingsItems = [
    { label: '个人信息及权限', icon: User, desc: '管理您的实名认证与所属网格' },
    { label: '数据安全中心', icon: ShieldCheck, desc: 'CA证书管理与数字签名设置' },
    { label: '国际语言/Language', icon: Languages, desc: '切换中英文工作界面' },
    { label: '退出网格化系统', icon: LogOut, desc: '安全退出当前会话', danger: true, action: onLogout },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 w-full z-50 border-b border-outline-variant/20 shadow-sm flex justify-between items-center px-6 h-16 font-headline shrink-0">
      <div className="flex items-center gap-8">
        <div className="text-xl font-black text-primary tracking-tight">Yunnan Data Portal</div>
        <nav className="hidden lg:flex gap-6 h-full items-center">
          <a href="#" className="text-primary font-bold border-b-2 border-primary h-full flex items-center px-2">工作台</a>
          <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors h-full flex items-center px-2">统计分析</a>
          <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors h-full flex items-center px-2">报表管理</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="搜索数据..." 
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary w-64 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 relative">
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('notifications')}
              className={cn(
                "p-2 rounded-full transition-all active:scale-90 relative",
                activeDropdown === 'notifications' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:text-primary hover:bg-primary/10"
              )}
            >
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-error rounded-full border-2 border-white" />
            </button>

            <AnimatePresence>
              {activeDropdown === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-cloud border border-outline-variant/20 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">通知中心</h3>
                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight">全部标为已读</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-5 hover:bg-surface-container-low/40 transition-colors cursor-pointer group border-b border-outline-variant/10 last:border-0">
                        <div className="flex gap-4">
                          <div className={cn("size-10 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", n.color)}>
                            <n.icon className="size-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-on-surface">{n.title}</h4>
                              <span className="text-[10px] font-medium text-on-surface-variant tabular-nums">{n.time}</span>
                            </div>
                            <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed line-clamp-2">{n.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-surface-container-low/30 text-center">
                    <button className="text-[10px] font-black text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full">
                       查看全量系统历史日志 <ExternalLink className="size-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Trigger */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('settings')}
              className={cn(
                "p-2 rounded-full transition-all active:scale-90",
                activeDropdown === 'settings' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:text-primary hover:bg-primary/10"
              )}
            >
              <Settings className="size-5" />
            </button>

            <AnimatePresence>
              {activeDropdown === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-cloud border border-outline-variant/20 overflow-hidden z-50 origin-top-right text-left"
                >
                  <div className="p-6 bg-gradient-to-br from-primary to-primary-container text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30 overflow-hidden">
                        <img referrerPolicy="no-referrer" src="https://picsum.photos/seed/manager/100/100" alt="Avatar" className="size-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black tracking-tight leading-none mb-1">系统操作员 041-A</h4>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">省级政务负责人</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest border border-white/5">
                      <span>安全等级: EXTREME</span>
                      <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded">VERIFIED</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    {settingsItems.map((item) => (
                      <button 
                        key={item.label} 
                        onClick={item.action}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all group text-left",
                          item.danger ? "hover:bg-error/5" : "hover:bg-surface-container-low"
                      )}>
                        <div className={cn(
                          "size-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                          item.danger ? "bg-error/10 text-error" : "bg-primary/5 text-primary"
                        )}>
                          <item.icon className="size-4" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className={cn("text-[11px] font-bold", item.danger ? "text-error" : "text-on-surface")}>{item.label}</div>
                          <div className="text-[10px] font-medium text-on-surface-variant opacity-60 leading-tight">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant/30 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all ml-1">
            <img 
              referrerPolicy="no-referrer"
              src="https://picsum.photos/seed/manager/100/100" 
              alt="User" 
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>

      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
}
