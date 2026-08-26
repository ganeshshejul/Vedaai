"use client";

import Image from "next/image";
import Link from "next/link";
import { Book, CheckSquare, Settings, Users, ArrowLeft, LayoutDashboard, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside className={`${collapsed ? 'w-[80px] rounded-[40px] m-4' : 'w-[280px] rounded-r-[40px]'} h-full bg-white flex flex-col justify-between py-8 px-4 shadow-sm flex-shrink-0 transition-all duration-300`}>
      <div className="flex flex-col gap-10">
        {/* Logo */}
        <div className={`flex items-center justify-center ${collapsed ? '' : 'justify-start px-2'} gap-3`}>
          <Image src="/logo.png" alt="VedaAI Logo" width={32} height={32} />
          {!collapsed && <span className="text-2xl font-bold text-gray-900 tracking-tight">VedaAI</span>}
        </div>

        {/* AI Toolkit Button */}
        {collapsed ? (
          <button onClick={() => toast('Coming Soon')} className="flex items-center justify-center w-12 h-12 mx-auto bg-[#2B2B2B] text-white rounded-full border border-[#FF5623] hover:bg-[#1A1A1A] transition-colors">
            <span className="text-lg">✨</span>
          </button>
        ) : (
          <button onClick={() => toast('Coming Soon')} className="flex items-center justify-center gap-2 bg-[#2B2B2B] text-white rounded-full py-3 px-4 border border-[#FF5623] hover:bg-[#1A1A1A] transition-colors mx-2">
            <span className="text-lg">✨</span>
            <span className="font-semibold text-[15px]">AI Teacher's Toolkit</span>
          </button>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem href="#" icon={<LayoutDashboard size={20} />} label="Home" collapsed={collapsed} onClick={() => toast('Coming Soon')} />
          <NavItem href="#" icon={<Users size={20} />} label="My Classroom" collapsed={collapsed} onClick={() => toast('Coming Soon')} />
          <NavItem href="#" icon={<CheckSquare size={20} />} label="Assignments" collapsed={collapsed} onClick={() => toast('Coming Soon')} />
          <NavItem href="#" icon={<Book size={20} />} label="Exams" active collapsed={collapsed} />
          <NavItem href="#" icon={<Book size={20} />} label="My Library" collapsed={collapsed} onClick={() => toast('Coming Soon')} />
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        {/* Settings */}
        <NavItem href="#" icon={<Settings size={20} />} label="Settings" collapsed={collapsed} onClick={() => toast('Coming Soon')} />

        {/* Profile Card / Icon */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center cursor-pointer" onClick={() => toast('Coming Soon')}>
                <div className="w-6 h-6 border-2 border-green-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-green-500 font-bold">DPS</span>
                </div>
             </div>
             <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => toast('Coming Soon')}>
                <ChevronRight size={20} />
             </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[#F3F3F3] p-4 rounded-xl mx-2 cursor-pointer" onClick={() => toast('Coming Soon')}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 border-2 border-green-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-green-500 font-bold">DPS</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-tight">Delhi Public School</span>
              <span className="text-xs text-gray-500 mt-0.5">Bokaro Steel City</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active, collapsed, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; collapsed?: boolean; onClick?: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center ${collapsed ? 'justify-center mx-auto w-12 h-12' : 'gap-3 px-4 py-3 mx-2'} rounded-xl transition-colors ${
        active 
          ? "bg-[#F3F3F3] text-gray-900 font-semibold" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={active ? "text-gray-900" : "text-gray-400"}>{icon}</span>
      {!collapsed && <span className="text-[15px]">{label}</span>}
    </Link>
  );
}
