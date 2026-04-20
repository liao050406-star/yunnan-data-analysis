import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  key?: string | number;
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      )}
    >
      <Icon className={cn("size-5", active ? "text-white" : "text-on-surface-variant group-hover:text-primary")} strokeWidth={active ? 2.5 : 2} />
      <span className={cn("flex-1 text-left", active && "font-bold tracking-wide")}>{label}</span>
      {badge && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold",
          active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  items: SidebarItemProps[];
  userRole: string;
  userName: string;
  onItemClick: (label: string) => void;
  activeLabel: string;
}

export default function Sidebar({ items, userRole, userName, onItemClick, activeLabel }: SidebarProps) {
  return (
    <aside className="bg-surface-container-low h-screen w-64 border-r border-outline-variant/30 hidden md:flex flex-col py-6 shrink-0 font-headline">
      <div className="px-6 mb-8 flex flex-col items-center">
        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-white p-3 mb-3 shadow-[0_12px_24px_rgba(0,71,207,0.15)]">
           <span className="text-2xl font-black italic">YN</span>
        </div>
        <h2 className="font-bold text-on-surface text-base">{userName}</h2>
        <p className="text-on-surface-variant text-xs text-center mt-1">{userRole}</p>
      </div>

      <div className="px-4 mb-6">
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95">
          <span className="text-lg">+</span> 新建数据请求
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={activeLabel === item.label}
            onClick={() => onItemClick(item.label)}
          />
        ))}
      </nav>
      
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/20">
         <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              YS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">系统版本</span>
              <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">v2.4.0 Stable</span>
            </div>
         </div>
      </div>
    </aside>
  );
}
