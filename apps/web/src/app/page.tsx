import { TopNav } from "@/components/layout/TopNav";
import { UploadArea } from "@/components/UploadArea";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F5F5] overflow-hidden relative z-0">
      <TopNav />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-0 relative overflow-y-auto w-full max-w-[1200px] mx-auto">
        <UploadArea />
      </main>
    </div>
  );
}
