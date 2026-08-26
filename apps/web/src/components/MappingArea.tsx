"use client";

import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const questions = [
  { id: 1, q: "Which blood vessel carries blood away from the heart?", score: "2/2", maxScore: 2 },
  { id: 2, q: "Which of the following organelles is primarily involved in photosynthesis?", score: "2/2", maxScore: 2, feedback: "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!" },
  { id: 3, q: "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.", score: "2/2", maxScore: 2 },
  { id: 4, q: "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.", score: "0/2", maxScore: 2 },
  { id: 5, q: "Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).", score: "2/2", maxScore: 2 },
  { id: 6, q: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.", score: "4/5", maxScore: 5 },
  { id: 7, q: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).", score: "5/5", maxScore: 5 },
];

export function MappingArea() {
  const [expandedId, setExpandedId] = useState<number>(2);
  const [mobileTab, setMobileTab] = useState<"questions" | "answers">("questions");

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      
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
            <button className="text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors">
              Expand All
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {questions.map((q) => {
              const isExpanded = expandedId === q.id;
              const isPerfectScore = parseInt(q.score.split('/')[0]) === q.maxScore;
              
              return (
                <div 
                  key={q.id} 
                  className={`flex flex-col border rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-[#FF5623] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? 0 : q.id)}
                  >
                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold text-sm ${
                      isExpanded ? 'bg-[#FF5623]' : 'bg-gray-500'
                    }`}>
                      {q.id}
                    </div>
                    
                    <div className="flex-1 text-[14px] sm:text-[15px] text-gray-800 leading-snug pt-1">
                      {q.q}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                        isPerfectScore ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {q.score}
                      </div>
                      <button className="text-gray-400 hover:text-gray-700">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && q.feedback && (
                    <div className="pl-[52px] sm:pl-[64px] pr-4 pb-4 pt-0">
                       <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">AI Feedback</h4>
                          <p className="text-gray-600 text-[13px] sm:text-sm leading-relaxed">{q.feedback}</p>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
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
                <button className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ZoomOut size={14} /></button>
                <span className="px-2 text-xs font-medium min-w-[40px] text-center">100%</span>
                <button className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ZoomIn size={14} /></button>
              </div>
              
              <div className="flex items-center bg-[#4A4A4A] rounded-lg border border-[#5A5A5A] overflow-hidden">
                <button className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ChevronLeft size={14} /></button>
                <span className="px-2 text-xs font-medium whitespace-nowrap">Page 1 of 4</span>
                <button className="px-2 py-1.5 hover:bg-[#5A5A5A] transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-[#E0E0E0] relative flex justify-center">
             {/* Mock Paper Background */}
             <div className="w-full max-w-[600px] bg-[#F5F2EA] shadow-md relative min-h-[1200px]" style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #9E9E9E 31px, #9E9E9E 32px), repeating-linear-gradient(90deg, transparent, transparent 39px, #FFCDD2 39px, #FFCDD2 40px)',
                backgroundSize: '100% 32px, 40px 100%'
             }}>
               {/* Content on paper */}
               <div className="pt-16 pl-12 sm:pl-14 pr-4 sm:pr-8 text-[#2B3A67] font-[cursive] text-lg sm:text-xl leading-[32px]">
                  <div className="mb-4">
                    <span className="absolute left-1 sm:left-2 font-bold font-sans text-gray-700">Q1.</span>
                    Photosynthesis is the process used by green plants and some other organisms to convert light energy into chemical energy.
                  </div>
                  
                  {/* Active Highlight Box for Q2 */}
                  <div className="absolute top-[300px] left-6 sm:left-8 right-2 sm:right-4 border-2 border-green-500 bg-green-500/10 rounded-lg p-3 sm:p-4 min-h-[150px]">
                     <div className="absolute -top-3 -left-3 bg-green-500 text-white font-bold text-xs px-2 py-1 rounded">Q2</div>
                     <div className="absolute -top-4 -left-10 sm:-left-12 font-bold font-sans text-gray-700 text-lg sm:text-xl">Q2.</div>
                     The process mainly occurs in the chloroplast of the plant cell. It has two main stages:
                     <ol className="list-decimal pl-5 sm:pl-6 mt-2">
                        <li>Light reaction - Captures light energy.</li>
                        <li>Dark reaction - Uses energy to make glucose.</li>
                     </ol>
                  </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
