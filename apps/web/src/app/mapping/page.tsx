import { TopNav } from "@/components/layout/TopNav";
import { MappingArea } from "@/components/MappingArea";

export default function Mapping() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F5F5] overflow-hidden relative z-0">
      <TopNav />
      <main className="flex-1 flex items-stretch justify-stretch relative h-full max-w-[1400px] w-full mx-auto p-4 sm:p-8 pt-0">
        <MappingArea />
      </main>
    </div>
  );
}
