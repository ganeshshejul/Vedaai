import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { compressPdf } from '@caijinglong/pdf-compress';

// Initialize Gemini Client
// Requires GEMINI_API_KEY environment variable to be set
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || ''
}); 

// Define our target schema for the output
const extractionSchema = {
    type: 'ARRAY',
    description: 'A list of mapped items containing the extracted question and its corresponding matched answer.',
    items: {
        type: 'OBJECT',
        properties: {
            question: {
                type: 'OBJECT',
                description: 'The extracted question from the question paper',
                properties: {
                    id: { type: 'STRING' },
                    number: { type: 'STRING' },
                    text: { type: 'STRING' },
                    parentNumber: { type: 'STRING' },
                    subPart: { type: 'STRING' },
                    order: { type: 'INTEGER' },
                    maxScore: { type: 'INTEGER' }
                },
                required: ['id', 'number', 'text', 'order', 'maxScore']
            },
            answer: {
                type: 'OBJECT',
                description: 'The corresponding matched answer from the answer sheet, if found',
                properties: {
                    id: { type: 'STRING' },
                    text: { type: 'STRING' },
                    detectedQuestionNumber: { type: 'STRING' },
                    regions: {
                        type: 'ARRAY',
                        description: 'The spatial bounding box of the answer on the image, normalized between 0 and 1.',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                page: { type: 'INTEGER' },
                                x: { type: 'NUMBER' },
                                y: { type: 'NUMBER' },
                                width: { type: 'NUMBER' },
                                height: { type: 'NUMBER' }
                            },
                            required: ['page', 'x', 'y', 'width', 'height']
                        }
                    }
                },
                required: ['id', 'text', 'regions']
            },
            aiConfidence: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 on how well this matches.' },
            status: { type: 'STRING', description: 'Must be one of: matched, unanswered, ambiguous, unmatched' },
            aiSuggestedMarks: { type: 'NUMBER', description: 'The graded score e.g., 2' },
            aiFeedback: { type: 'STRING', description: 'Brief AI feedback on the answer quality.' }
        },
        required: ['question', 'aiConfidence', 'status', 'aiSuggestedMarks']
    }
};

async function processDocument(doc: { base64: string; mimeType: string }, label: string) {
    if (!doc.mimeType.includes('pdf')) return doc;
    
    // approx size in bytes
    const sizeInBytes = (doc.base64.length * 3) / 4;
    
    if (sizeInBytes > 5 * 1024 * 1024) {
        console.log(`[${label}] PDF exceeds 5MB (${(sizeInBytes/1024/1024).toFixed(2)}MB). Compressing...`);
        try {
            const buffer = Buffer.from(doc.base64, 'base64');
            const result = await compressPdf(buffer);
            console.log(`[${label}] Compression complete. Saved: ${(result.summary.savedBytes/1024/1024).toFixed(2)}MB. Ratio: ${result.summary.ratio.toFixed(2)}`);
            
            return {
                base64: Buffer.from(result.data).toString('base64'),
                mimeType: doc.mimeType
            };
        } catch (err) {
            console.error(`[${label}] Compression failed. Using original document.`, err);
            return doc;
        }
    }
    return doc;
}

export async function POST(req: Request) {
  try {
    const { questionPaper, answerSheet } = await req.json();

    if (!questionPaper || !answerSheet) {
      return NextResponse.json({ error: "Missing required files (questionPaper and answerSheet)" }, { status: 400 });
    }

    // Compress large PDFs if needed
    const processedQP = await processDocument(questionPaper, 'QuestionPaper');
    const processedAS = await processDocument(answerSheet, 'AnswerSheet');

    // Call Gemini to extract and map
    console.log("Calling Gemini 3.1 Pro Preview...");
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: 'Here is the Question Paper. Extract all the questions, their numbers, and their maximum marks.' },
                    { inlineData: { data: processedQP.base64, mimeType: processedQP.mimeType } },
                    { text: 'Here is the Student Answer Sheet. Extract all the answers written by the student. Your goal is to map the student\'s answers to the exact questions from the question paper.' },
                    { inlineData: { data: processedAS.base64, mimeType: processedAS.mimeType } },
                    { text: 'Extract and map the questions to answers. Grade the answers according to the question\'s maximum score. Provide bounding box regions for the answers [y_min, x_min, y_max, x_max] converted to standard [x, y, width, height] normalized coordinates (0 to 1). Output as JSON.' }
                ]
            }
        ],
        config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: extractionSchema
        }
    });

    const outputText = response.text;
    console.log("Received Gemini Response.");
    
    if (!outputText) {
        throw new Error("No text returned from Gemini");
    }

    const mappedData = JSON.parse(outputText);
    return NextResponse.json({ mappedData });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process files" }, { status: 500 });
  }
}
