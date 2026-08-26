# VedaAI: AI-Powered Answer Sheet Grader

VedaAI is a full-stack, automated exam assessment platform designed for educators. It utilizes the Gemini 3.1 Pro Preview multimodal AI to extract questions from question papers, read handwritten student answers, and autonomously map, grade, and highlight the results.

## Key Features
- **Automated Mapping:** Intelligently maps handwritten student answers to specific questions from a provided question paper.
- **Multimodal AI Grading:** Leverages Google's Gemini 3.1 Pro Preview to read handwriting directly from PDF uploads and provide deterministic, rubric-based scores.
- **Spatial Bounding Boxes:** The web interface renders the student's PDF and overlays interactive bounding boxes exactly over where the answer was found.
- **Human-in-the-Loop Override:** Teachers can review the AI's suggested score and manually override it before finalizing.
- **PDF Report Generation:** One-click generation of a finalized `A4` PDF report containing the graded answers, total scores, AI feedback, and visual bounding-box evidence.
- **Smart Compression:** Automatically compresses large PDF files on the backend to bypass restrictive payload limits without losing legibility.

## Project Architecture
This project is structured as a **Turborepo** monorepo containing:
- `apps/web`: The Next.js App Router teacher-facing interface.
- `packages/types`: Shared TypeScript interfaces across the workspace.

## Documentation
Comprehensive technical documentation for each core feature is available in the `/docs` directory:
- [AI Grading Engine & Prompt Rules](./docs/AI_GRADING.md)
- [UI Mapping & Bounding Box Coordinates](./docs/UI_MAPPING.md)
- [Client-Side PDF Generation](./docs/PDF_GENERATION.md)
- [File Processing & Smart Compression](./docs/FILE_PROCESSING.md)
- [Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)

## Tech Stack
- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS (v4)
- **AI Integration:** `@google/genai` (Gemini 3.1 Pro Preview)
- **PDF Handling:** `jspdf` (Generation) & `pdfjs-dist` (Rendering)
- **State Management:** `zustand`

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Vedaai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create an `.env.local` file in `apps/web/` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key
   ```

4. **Start the development server:**
   Use the Turborepo `dev` command from the root folder:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to access the VedaAI Teacher Portal.
