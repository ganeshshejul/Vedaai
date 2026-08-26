"use client";

import { Upload, X, FileText } from "lucide-react";
import { useState } from "react";

export function UploadArea() {
  const [questionPaper, setQuestionPaper] = useState<{name: string, size: string, pages: string} | null>(null);
  const [answerSheet, setAnswerSheet] = useState<{name: string, size: string, pages: string} | null>(null);

  const handleUploadQP = () => {
    setQuestionPaper({ name: "Class_10_maths_unit_test.pdf", size: "2MB", pages: "2 Pages" });
  };

  const handleUploadAS = () => {
    setAnswerSheet({ name: "student_1_answer_sheet.pdf", size: "8MB", pages: "6 Pages" });
  };

  const isReady = questionPaper !== null && answerSheet !== null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full relative">
      {/* Background Radial Blurs (as seen in CSS) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-black/5 blur-[120px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gray-500/10 blur-[100px] rounded-[100%] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 bg-white/40 backdrop-blur-3xl border border-white/50 w-full max-w-[900px] h-[650px] rounded-[40px] shadow-sm flex flex-col items-center justify-center gap-10 p-10">
        
        {/* Title Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <h1 className="text-[40px] font-bold text-[#2B2B2B] leading-tight tracking-tight">Upload</h1>
            <div className="bg-[#FF5623]/15 px-4 py-1 rounded-xl">
              <h1 className="text-[40px] font-bold text-[#FF5623] leading-tight tracking-tight">Question Paper & Answer Sheets</h1>
            </div>
          </div>
          <p className="text-[20px] text-[#303030] mt-2">Upload both files to get started</p>
        </div>

        {/* Central Illustration Area (Placeholder for the illustration) */}
        <div className="w-[140px] h-[140px] relative flex items-center justify-center my-2">
          {/* Decorative rings/background for avatar */}
          <div className="absolute w-[140px] h-[140px] bg-[#FF5623]/10 rounded-full" />
          <div className="absolute w-[110px] h-[110px] bg-[#FF5623]/20 rounded-full" />
          <div className="w-[80px] h-[80px] bg-white rounded-full z-10 border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
             {/* Character avatar placeholder */}
             <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                <span className="text-3xl">👩‍🏫</span>
             </div>
          </div>
          {/* Small decorative floating icons */}
          <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-[#FB975D] to-[#FC5E24] rounded-full text-white flex items-center justify-center text-[8px]">⏱️</div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-gradient-to-br from-[#FB975D] to-[#FC5E24] rounded-full text-white flex items-center justify-center text-[8px]">⚙️</div>
          <div className="absolute top-[40%] -left-2 w-4 h-4 bg-gradient-to-br from-[#FB975D] to-[#FC5E24] rounded-full text-white flex items-center justify-center text-[8px]">📝</div>
        </div>

        {/* Upload Cards */}
        <div className="flex gap-6 w-full justify-center max-w-[800px]">
          {/* Question Paper Upload Card */}
          <div 
            onClick={!questionPaper ? handleUploadQP : undefined}
            className={`flex-1 h-[200px] bg-white border-2 border-dashed border-[#CECECE] rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors relative ${!questionPaper ? 'cursor-pointer hover:bg-gray-50 group' : ''}`}
          >
            {!questionPaper ? (
              <>
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Upload className="text-[#303030]" size={24} />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[20px] font-semibold text-[#303030]">
                    Upload <span className="text-[#FF5623]">Question Paper</span>
                  </div>
                  <span className="text-sm text-gray-400 mt-1">Max 10MB</span>
                </div>
              </>
            ) : (
              <div className="bg-[#F9F9F9] w-[80%] py-4 px-6 rounded-xl flex items-center gap-4 relative shadow-sm border border-gray-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); setQuestionPaper(null); }}
                  className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-700 text-white rounded-full p-1 transition-colors shadow-sm"
                >
                  <X size={14} />
                </button>
                <div className="w-10 h-12 bg-red-100 text-red-500 rounded flex flex-col items-center justify-center border border-red-200 shrink-0">
                  <FileText size={20} />
                  <span className="text-[8px] font-bold mt-0.5">PDF</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-[#303030] truncate" title={questionPaper.name}>{questionPaper.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{questionPaper.size} • {questionPaper.pages}</span>
                </div>
              </div>
            )}
          </div>

          {/* Answer Sheet Upload Card */}
          <div 
            onClick={!answerSheet ? handleUploadAS : undefined}
            className={`flex-1 h-[200px] bg-white border-2 border-dashed border-[#CECECE] rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors relative ${!answerSheet ? 'cursor-pointer hover:bg-gray-50 group' : ''}`}
          >
            {!answerSheet ? (
              <>
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Upload className="text-[#303030]" size={24} />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[20px] font-semibold text-[#303030]">
                    Upload <span className="text-[#FF5623]">Answer Sheet</span>
                  </div>
                  <span className="text-sm text-gray-400 mt-1">Max 10MB</span>
                </div>
              </>
            ) : (
              <div className="bg-[#F9F9F9] w-[80%] py-4 px-6 rounded-xl flex items-center gap-4 relative shadow-sm border border-gray-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); setAnswerSheet(null); }}
                  className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-700 text-white rounded-full p-1 transition-colors shadow-sm"
                >
                  <X size={14} />
                </button>
                <div className="w-10 h-12 bg-red-100 text-red-500 rounded flex flex-col items-center justify-center border border-red-200 shrink-0">
                  <FileText size={20} />
                  <span className="text-[8px] font-bold mt-0.5">PDF</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-[#303030] truncate" title={answerSheet.name}>{answerSheet.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{answerSheet.size} • {answerSheet.pages}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Mapping Button */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <button 
            disabled={!isReady} 
            className={`font-medium py-3 px-8 rounded-full flex items-center gap-2 transition-all ${
              isReady 
                ? 'bg-[#303030] text-white hover:bg-black cursor-pointer shadow-md' 
                : 'bg-black/20 text-white opacity-70 cursor-not-allowed'
            }`}
          >
            Start Mapping <span className="text-xl leading-none">→</span>
          </button>
          <p className="text-sm text-gray-500">Once both files are uploaded, you'll able to map answers with questions</p>
        </div>
      </div>
    </div>
  );
}
