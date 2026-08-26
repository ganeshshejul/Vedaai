"use client";

import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMappingStore } from "@/store/mappingStore";
import { generatePdfReport } from "@/utils/generateReport";
import { formatQuestionNumber } from "@/utils/formatQuestion";
import { Download } from "lucide-react";
import Script from "next/script";

export function MappingArea() {
  const { mappedData, answerSheetBase64 } = useMappingStore();
  const [expandedId, setExpandedId] = useState<string | null>(mappedData?.[0]?.question?.id || null);
  const [mobileTab, setMobileTab] = useState<"questions" | "answers">("questions");
  const [scale, setScale] = useState<number>(100);

  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);

  useEffect(() => {
    if (!answerSheetBase64 || !answerSheetBase64.mimeType.includes('pdf')) {
      setPdfPages([]);
      return;
    }

    const loadPdfPages = async () => {
      setIsRenderingPdf(true);
      try {
        const binaryString = window.atob(answerSheetBase64.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        let pdfjsLib = (window as any).pdfjsLib;
        let retries = 0;
        while (!pdfjsLib && retries < 20) {
          await new Promise(r => setTimeout(r, 100));
          pdfjsLib = (window as any).pdfjsLib;
          retries++;
        }
        
        if (!pdfjsLib) throw new Error("pdfjsLib is not loaded after waiting");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pageImages = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pageImages.push(canvas.toDataURL('image/jpeg', 0.9));
          }
        }
        setPdfPages(pageImages);
      } catch (e) {
        console.error("Failed to render PDF pages:", e);
      } finally {
        setIsRenderingPdf(false);
      }
    };

    loadPdfPages();
  }, [answerSheetBase64]);

  const handleZoomIn = () => setScale(s => Math.min(s + 10, 200));
  const handleZoomOut = () => setScale(s => Math.max(s - 10, 50));

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
      
      {/* Mobile Toggle */}
      <div className="lg:hidden w-full flex justify-center mb-4 px-4">
        <div className="bg-white rounded-full p-1 flex w-full max-w-sm shadow-sm border border-gray-200">
          <button 
            className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold transition-colors ${
              mobileTab === "questions" ? "bg-[#303030] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setMobileTab("questions")}
          >
            Questions
          </button>
          <button 
            className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold transition-colors ${
              mobileTab === "answers" ? "bg-[#303030] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setMobileTab("answers")}
          >
            Answer Sheet
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 w-full h-full relative">
        
        {/* Left Pane: Extracted Questions */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-white rounded-[20px] lg:rounded-l-[20px] lg:rounded-r-none shadow-sm border border-gray-100 overflow-hidden h-full ${mobileTab === 'questions' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-[18px]">Extracted <span className="font-bold">Questions</span> <span className="hidden sm:inline">(from question paper)</span></h2>
            <button onClick={() => setExpandedId(null)} className="text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors">
              Collapse All
            </button>
          </div>
          
          {/* AI Grading Summary Banner */}
          {mappedData.length > 0 && (
            <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-blue-900 font-bold text-sm mb-1">AI Grading Complete</h3>
                <p className="text-blue-700 text-xs">
                  {mappedData.length} questions • {mappedData.filter(m => m.status !== 'unanswered').length} answered • {mappedData.filter(m => m.status === 'unanswered').length} unanswered
                </p>
                <p className="text-blue-800 font-semibold mt-2">
                  Suggested Total: {mappedData.reduce((acc, curr) => acc + (curr.finalMarks ?? curr.aiSuggestedMarks ?? 0), 0)} / {mappedData.reduce((acc, curr) => acc + (curr.question.maxScore || 0), 0)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0">

                <button 
                  onClick={async () => {
                    const toastId = toast.loading("Generating PDF Report...");
                    try {
                      await generatePdfReport(mappedData, answerSheetBase64);
                      toast.success("PDF Generated Successfully", { id: toastId });
                    } catch (e) {
                      console.error("PDF generation failed:", e);
                      toast.error("Failed to generate PDF", { id: toastId });
                    }
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  <Download size={14} />
                  Download Report
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {mappedData.map((item, index) => {
              const q = item.question;
              const isExpanded = expandedId === q.id;
              const currentScore = item.finalMarks ?? item.aiSuggestedMarks ?? 0;
              const isPerfectScore = currentScore === q.maxScore;
              const needsReview = (item.aiConfidence && item.aiConfidence < 0.7) || item.status === 'ambiguous';
              
              return (
                <div 
                  key={q.id || index} 
                  className={`flex flex-col border rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-[#FF5623] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  >
                    <div className={`min-w-[32px] h-8 px-2 flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold text-sm whitespace-nowrap ${
                      isExpanded ? 'bg-[#FF5623]' : 'bg-gray-500'
                    }`}>
                      {formatQuestionNumber(q, index)}
                    </div>
                    
                    <div className="flex-1 text-[14px] sm:text-[15px] text-gray-800 leading-snug pt-1">
                      {q.text}
                      {needsReview && (
                        <div className="inline-flex items-center gap-1 ml-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          <AlertTriangle size={12} />
                          Review required
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                        item.status === 'unanswered' ? 'bg-gray-100 text-gray-500' :
                        isPerfectScore ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.status === 'unanswered' ? `0 / ${q.maxScore}` : `${currentScore} / ${q.maxScore}`}
                      </div>
                      <button className="text-gray-400 hover:text-gray-700">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-[52px] sm:pl-[64px] pr-4 pb-4 pt-0">
                       
                       {/* Grading Widget */}
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         
                         {/* AI Suggestion */}
                         <div className="flex flex-col">
                           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Suggested Score</span>
                           <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-bold text-gray-800">{item.aiSuggestedMarks ?? 0}</span>
                             <span className="text-sm font-medium text-gray-500">/ {q.maxScore}</span>
                           </div>
                           {item.status === 'unanswered' && <span className="text-xs text-red-500 mt-1 font-medium">Unanswered (AI default 0)</span>}
                         </div>

                         {/* Teacher Override */}
                         <div className="flex flex-col bg-white p-3 rounded-lg border border-gray-200 shadow-sm min-w-[180px]">
                            <span className="text-xs font-semibold text-gray-800 mb-2 flex items-center justify-between">
                              Teacher's Score 
                              {item.teacherEdited && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Edited</span>}
                            </span>
                            <div className="flex items-center justify-between gap-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newVal = Math.max(0, currentScore - 1);
                                  useMappingStore.getState().updateMappedItem(q.id, { finalMarks: newVal, teacherEdited: true });
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition-colors"
                              >
                                −
                              </button>
                              <div className="text-lg font-bold text-gray-900 w-8 text-center">{currentScore}</div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newVal = Math.min(q.maxScore, currentScore + 1);
                                  useMappingStore.getState().updateMappedItem(q.id, { finalMarks: newVal, teacherEdited: true });
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition-colors"
                              >
                                +
                              </button>
                            </div>
                         </div>
                       </div>

                       <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100 mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Student's Extracted Answer</h4>
                          <p className="text-gray-600 text-[13px] sm:text-sm leading-relaxed">{item.answer?.text || 'No answer found.'}</p>
                       </div>
                       
                       {item.aiFeedback && (
                         <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                            <h4 className="font-semibold text-orange-800 text-sm mb-1">AI Feedback</h4>
                            <p className="text-orange-700 text-[13px] sm:text-sm leading-relaxed">{item.aiFeedback}</p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {mappedData.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <AlertTriangle size={48} className="mb-4 text-gray-300" />
                <p>No mapping data available.</p>
                <p className="text-sm mt-2">Please upload documents first.</p>
              </div>
            )}
          </div>
        </div>

        {/* Drag Handle (Visual only for now - hidden on mobile) */}
        <div className="hidden lg:block w-1.5 h-16 bg-gray-300 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-col-resize z-10 hover:bg-[#FF5623] transition-colors shadow-sm" />

        {/* Right Pane: Answer Sheet */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-[#4A4A4A] rounded-[20px] lg:rounded-l-none shadow-sm border border-gray-200 overflow-hidden h-full ${mobileTab === 'answers' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between p-3 px-4 bg-[#3A3A3A] text-white">
            <span className="font-medium text-sm hidden sm:block">Answer Sheet</span>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center bg-[#4A4A4A] rounded-lg border border-[#5A5A5A] overflow-hidden">
                <button onClick={handleZoomOut} className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ZoomOut size={14} /></button>
                <span className="px-2 text-xs font-medium min-w-[40px] text-center">{scale}%</span>
                <button onClick={handleZoomIn} className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ZoomIn size={14} /></button>
              </div>
              
              <div className="flex items-center bg-[#4A4A4A] rounded-lg border border-[#5A5A5A] overflow-hidden">
                <button onClick={() => toast("Previous page coming soon")} className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ChevronLeft size={14} /></button>
                <span className="px-2 text-xs font-medium whitespace-nowrap">Page 1 of {pdfPages.length || 1}</span>
                <button onClick={() => toast("Next page coming soon")} className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-[#E0E0E0] relative flex justify-center items-start overflow-x-auto">
             <div className="w-full max-w-[800px] bg-white shadow-md relative transition-transform origin-top" style={{
                transform: `scale(${scale / 100})`,
                marginBottom: `${(scale > 100 ? (scale - 100) * 6 : 0)}px`
             }}>
                {answerSheetBase64 ? (
                  answerSheetBase64.mimeType.includes('pdf') ? (
                    <div className="w-full flex flex-col relative z-20">
                      {isRenderingPdf ? (
                        <div className="w-full min-h-[800px] flex items-center justify-center text-gray-400 bg-[#F5F2EA]">
                          Rendering PDF Pages...
                        </div>
                      ) : (
                        pdfPages.map((pageDataUrl, pageIdx) => (
                          <div key={`pdf-page-${pageIdx}`} className="relative w-full mb-4 shadow-sm border border-gray-200">
                            <img src={pageDataUrl} alt={`PDF Page ${pageIdx + 1}`} className="w-full h-auto block" />
                            {/* Dynamic Highlight Boxes for this Page */}
                            {mappedData.map((item) => {
                              if (item.question.id === expandedId && item.answer?.regions) {
                                return item.answer.regions.map((region, idx) => {
                                  // region.page is 1-indexed
                                  if (region.page !== pageIdx + 1) return null;
                                  return (
                                    <div 
                                      key={`${item.question.id}-region-${idx}`}
                                      className="absolute border-[3px] border-green-500 bg-green-500/10 rounded-sm"
                                      style={{
                                        top: `${region.y * 100}%`,
                                        left: `${region.x * 100}%`,
                                        width: `${region.width * 100}%`,
                                        height: `${region.height * 100}%`,
                                      }}
                                    >
                                       <div className="absolute -top-3 -left-3 bg-green-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                         Q{formatQuestionNumber(item.question)}
                                       </div>
                                    </div>
                                  );
                                });
                              }
                              return null;
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="w-full relative">
                      <img src={`data:${answerSheetBase64.mimeType};base64,${answerSheetBase64.base64}`} alt="Answer Sheet" className="w-full h-auto block" />
                      {/* Dynamic Highlight Boxes for Single Image */}
                      {mappedData.map((item) => {
                        if (item.question.id === expandedId && item.answer?.regions) {
                          return item.answer.regions.map((region, idx) => (
                            <div 
                              key={`${item.question.id}-region-${idx}`}
                              className="absolute border-[3px] border-green-500 bg-green-500/10 rounded-sm"
                              style={{
                                top: `${region.y * 100}%`,
                                left: `${region.x * 100}%`,
                                width: `${region.width * 100}%`,
                                height: `${region.height * 100}%`,
                              }}
                            >
                               <div className="absolute -top-3 -left-3 bg-green-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                 Q{formatQuestionNumber(item.question)}
                               </div>
                            </div>
                          ));
                        }
                        return null;
                      })}
                    </div>
                  )
                ) : (
                  <div className="w-full min-h-[1200px] bg-[#F5F2EA] flex items-center justify-center text-gray-400">
                    No answer sheet available.
                  </div>
                )}
                

             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
