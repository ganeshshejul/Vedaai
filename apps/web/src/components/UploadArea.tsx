"use client";

import Image from "next/image";
import { Upload, X, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMappingStore } from "../store/mappingStore";

export function UploadArea() {
  const router = useRouter();
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const { setQuestionPaperBase64, setAnswerSheetBase64 } = useMappingStore();

  const qpInputRef = useRef<HTMLInputElement>(null);
  const asInputRef = useRef<HTMLInputElement>(null);

  const handleUploadQPClick = () => {
    qpInputRef.current?.click();
  };

  const handleUploadASClick = () => {
    asInputRef.current?.click();
  };

  const onQpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionPaper(e.target.files[0]);
    }
  };

  const onAsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerSheet(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' && file.size > 2 * 1024 * 1024) {
      console.log(`Compressing ${file.name}...`);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { compressPdf } = await import('@caijinglong/pdf-compress/browser');
        const result = await compressPdf(new Uint8Array(arrayBuffer));
        console.log(`Compression saved ${result.summary.savedBytes} bytes`);
        
        let binary = '';
        const bytes = new Uint8Array(result.data);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch (err) {
        console.error("Compression failed, using original", err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleStartMapping = async () => {
    if (!questionPaper || !answerSheet) return;
    setIsLoading(true);
    
    try {
      const qpBase64 = await processFile(questionPaper);
      const asBase64 = await processFile(answerSheet);
      
      setQuestionPaperBase64({ base64: qpBase64, mimeType: questionPaper.type });
      setAnswerSheetBase64({ base64: asBase64, mimeType: answerSheet.type });
      
      router.push('/process');
    } catch (e) {
      console.error("Failed to read files", e);
      setIsLoading(false);
    }
  };

  const isReady = questionPaper !== null && answerSheet !== null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full relative">
      <input type="file" ref={qpInputRef} className="hidden" accept=".pdf,image/*" onChange={onQpFileChange} />
      <input type="file" ref={asInputRef} className="hidden" accept=".pdf,image/*" onChange={onAsFileChange} />

      {/* Background Radial Blurs (as seen in CSS) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-black/5 blur-[120px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gray-500/10 blur-[100px] rounded-[100%] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[900px] flex flex-col items-center justify-center gap-2 sm:gap-4 p-4 sm:p-6 md:p-8">

        {/* Title Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#2B2B2B] leading-tight tracking-tight">Upload</h1>
            <div className="bg-[#FF5623]/15 px-4 py-1 rounded-xl">
              <h1 className="text-[24px] md:text-[40px] font-bold text-[#FF5623] leading-tight tracking-tight">Question Paper & Answer Sheets</h1>
            </div>
          </div>
          <p className="text-[16px] md:text-[20px] text-[#303030] mt-1 md:mt-2">Upload both files to get started</p>
        </div>

        {/* Central Illustration */}
        <div className="w-[120px] h-[120px] relative flex items-center justify-center my-0 pointer-events-none">
          <img src="/Girl_Reading_Book.png" alt="Upload Illustration" className="w-full h-full object-contain" />
        </div>

        {/* Upload Cards */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full justify-center max-w-[800px] mt-2">
          {/* Question Paper Upload Card */}
          <div
            onClick={!questionPaper ? handleUploadQPClick : undefined}
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
                  <span className="text-[8px] font-bold mt-0.5">{questionPaper.type.includes('pdf') ? 'PDF' : 'IMG'}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-[#303030] truncate" title={questionPaper.name}>{questionPaper.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{formatFileSize(questionPaper.size)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Answer Sheet Upload Card */}
          <div
            onClick={!answerSheet ? handleUploadASClick : undefined}
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
                  <span className="text-[8px] font-bold mt-0.5">{answerSheet.type.includes('pdf') ? 'PDF' : 'IMG'}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-[#303030] truncate" title={answerSheet.name}>{answerSheet.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{formatFileSize(answerSheet.size)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Mapping Button */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <button
            onClick={handleStartMapping}
            disabled={!isReady || isLoading}
            className={`font-medium py-3 px-8 rounded-full flex items-center gap-2 transition-all ${isReady && !isLoading
              ? 'bg-[#303030] text-white hover:bg-black cursor-pointer shadow-md'
              : 'bg-black/20 text-white opacity-70 cursor-not-allowed'
              }`}
          >
            {isLoading ? 'Processing Files...' : 'Start Mapping'} {isLoading ? '' : <span className="text-xl leading-none">→</span>}
          </button>
          <p className="text-sm text-gray-500">Once both files are uploaded, you'll able to map answers with questions</p>
        </div>
      </div>
    </div>
  );
}
