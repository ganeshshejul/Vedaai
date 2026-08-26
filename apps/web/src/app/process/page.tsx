import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LoadingArea } from "@/components/LoadingArea";

export default function Process() {
  return (
    <div className="flex w-full h-screen bg-[#F5F5F5] overflow-hidden">
      <Sidebar collapsed={true} />
      <div className="flex-1 flex flex-col h-full relative z-0 pr-4 pb-4">
        <TopNav />
        <main className="flex-1 flex items-stretch justify-stretch relative h-full">
          <LoadingArea />
        </main>
      </div>
    </div>
  );
}
