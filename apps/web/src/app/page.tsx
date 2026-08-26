import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { UploadArea } from "@/components/UploadArea";

export default function Home() {
  return (
    <div className="flex w-full h-screen bg-[#F5F5F5] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative z-0">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
          <UploadArea />
        </main>
      </div>
    </div>
  );
}
