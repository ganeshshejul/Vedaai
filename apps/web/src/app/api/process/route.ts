import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

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



export async function POST(req: Request) {
  try {
    const { questionPaper, answerSheet } = await req.json();

    if (!questionPaper || !answerSheet) {
      return NextResponse.json({ error: "Missing required files (questionPaper and answerSheet)" }, { status: 400 });
    }



    const requestOptions = {
        contents: [
            {
                role: 'user',
                parts: [
                    { text: `You are an expert, deterministic document grader. 
Strict Extraction & Formatting Rules:
1. The 'number' field must ONLY contain the main integer (e.g., "1"). 
2. The 'subPart' field must ONLY contain the sub-part letter (e.g., "a", "b"). If a question has NO subpart, you must completely OMIT the subPart field. Do NOT write "null", "undefined", or "none".
3. Provide bounding box regions for the answers [y_min, x_min, y_max, x_max] converted to standard [x, y, width, height] normalized coordinates (0 to 1).

Strict Grading Rules:
1. Consistency: Grade strictly and consistently based on the literal text in the student's answer.
2. No Hallucination: Do not assume or grant marks for knowledge that is not explicitly written.
3. Accuracy: Ensure the assigned 'aiSuggestedMarks' is a valid number between 0 and the question's 'maxScore'.
4. Exact Matching: Your goal is to map the student's answers to the exact questions from the question paper.

Here is the Question Paper. Extract all the questions, their numbers, and their maximum marks.` },
                    { inlineData: { data: questionPaper.base64, mimeType: questionPaper.mimeType } },
                    { text: 'Here is the Student Answer Sheet. Extract all the answers written by the student and grade them strictly according to the rules.' },
                    { inlineData: { data: answerSheet.base64, mimeType: answerSheet.mimeType } },
                    { text: 'Output as JSON.' }
                ]
            }
        ],
        config: {
            temperature: 0.0,
            responseMimeType: 'application/json',
            responseSchema: extractionSchema
        }
    };

    console.log("Calling Gemini 3.1 Pro Preview...");
    const response = await ai.models.generateContent({ model: 'gemini-3.1-pro-preview', ...requestOptions });

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
