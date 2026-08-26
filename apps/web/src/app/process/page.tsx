"use client";

import { TopNav } from "@/components/layout/TopNav";
import { LoadingArea } from "@/components/LoadingArea";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMappingStore } from "@/store/mappingStore";

export default function Process() {
  const router = useRouter();
  const { questionPaperBase64, answerSheetBase64, setMappedData, setError } = useMappingStore();

  useEffect(() => {
    const processFiles = async () => {
      if (!questionPaperBase64 || !answerSheetBase64) {
        // If someone hits this page directly without files, go back
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionPaper: questionPaperBase64,
            answerSheet: answerSheetBase64
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to process files");
        }

        const data = await res.json();
        setMappedData(data.mappedData);
        router.push('/mapping');
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        router.push('/mapping'); // Still route there to show the error state or empty state
      }
    };

    processFiles();
  }, [router, questionPaperBase64, answerSheetBase64, setMappedData, setError]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F5F5] overflow-hidden relative z-0">
      <TopNav />
      <main className="flex-1 flex items-stretch justify-stretch relative h-full max-w-[1200px] w-full mx-auto p-4 sm:p-8">
        <LoadingArea />
      </main>
    </div>
  );
}
