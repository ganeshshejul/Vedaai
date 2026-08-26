import { Sparkles } from "lucide-react";

export function LoadingArea() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Animated Sparkles / Extracting Icon */}
        <div className="relative w-32 h-32 flex items-center justify-center animate-pulse">
           <div className="absolute w-20 h-20 bg-gradient-to-tr from-[#FF5623] to-[#FB975D] rounded-full blur-xl opacity-50" />
           <Sparkles size={64} className="text-[#FF5623] z-10" fill="currentColor" stroke="none" />
           {/* Custom spark shapes replicating the image */}
           <div className="absolute top-4 right-4 w-4 h-4 bg-[#FF5623] rounded-full opacity-60" />
           <div className="absolute bottom-8 left-4 w-3 h-3 bg-[#FF5623] rounded-full opacity-80" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold text-[#303030] tracking-tight">Extracting...</h2>
          <p className="text-gray-500 text-lg">This may take a while</p>
        </div>
      </div>
    </div>
  );
}
