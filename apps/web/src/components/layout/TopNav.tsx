import { ArrowLeft, HelpCircle, Bell, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";

export function TopNav() {
  return (
    <header className="h-[80px] w-full flex items-center justify-between px-8 bg-transparent">
      {/* Left side: Back Button and Breadcrumb */}
      <div className="flex items-center gap-4 text-gray-500">
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 font-medium text-[16px]">
          <span className="text-gray-400">Exams</span>
        </div>
      </div>

      {/* Right side: Icons and Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-gray-700">
          <button className="hover:text-gray-900 transition-colors">
            <HelpCircle size={22} />
          </button>
          
          <button className="hover:text-gray-900 transition-colors relative">
            <Bell size={22} />
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          <button className="hover:text-gray-900 transition-colors">
            <Sparkles size={22} />
          </button>
        </div>

        {/* Profile Dropdown */}
        <button className="flex items-center gap-3 pl-4 border-l border-gray-300 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
            {/* Using a placeholder avatar since I don't have the image file, but assuming an image could be here */}
            <div className="w-full h-full bg-orange-200 text-orange-600 font-bold flex items-center justify-center text-sm">
              MR
            </div>
          </div>
          <span className="font-semibold text-sm text-gray-800">Madhur Rastogi</span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
