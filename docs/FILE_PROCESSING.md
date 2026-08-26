# File Processing & API Architecture

## Overview
The VedaAI extraction pipeline is orchestrated through a singular Next.js API route (`/api/process/route.ts`). This route is responsible for receiving base64-encoded files, validating their sizes, compressing massive PDFs, and dispatching the payload to the Gemini API.

## API Endpoint (`POST /api/process`)
- **Request Payload:** `{ questionPaper: { base64, mimeType }, answerSheet: { base64, mimeType } }`
- **Response Payload:** `{ mappedData: MappedItem[] }`

### 1. Document Compression Strategy
Google Gemini's vision models can comfortably handle multi-page PDFs, but payload size limits and network bandwidth are major concerns for users on slow connections.
- The route estimates the file size using the base64 string length (`(length * 3) / 4`).
- **5MB Threshold:** If a PDF exceeds 5MB, the route intercepts the payload and passes it through `@caijinglong/pdf-compress`.
- The compression happens on the backend using Ghostscript heuristics to significantly shrink file size without destroying the legibility of handwritten answers.

### 2. Multi-Modal Vision Processing
Instead of relying on fragile OCR solutions (like Tesseract), VedaAI passes the actual PDF images (as inlineData) directly into the Gemini 3.1 Pro Preview multimodal engine. This completely eliminates a layer of failure and allows the model to "see" the exact spatial layout of the student's exam paper natively.

### 3. Resilience & Backoff
LLM APIs are notoriously prone to high-demand spikes (`503 Service Unavailable` or `429 Too Many Requests`).
- The `generateContent` call is wrapped in a `withRetry` utility.
- If a 503 is detected, the API intentionally sleeps on an exponential curve (`2s`, `4s`, etc.) and automatically attempts the request again, entirely hiding transient infrastructure failures from the end user.
