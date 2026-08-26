# PDF Report Generation

## Overview
VedaAI provides a seamless, one-click PDF report generation feature that aggregates the final grades, AI feedback, and visual bounding-box evidence into a printable `A4` document. This logic lives entirely in `apps/web/src/utils/generateReport.ts`.

## Client-Side Architecture
The PDF generation runs entirely on the client side to avoid massive payload transfers and Vercel Serverless Function timeout limits. It utilizes two core libraries:
1. **`jspdf`**: Generates the actual PDF document, handles pagination, and manages font styling/placement.
2. **`pdfjs-dist`**: Used to render pages from the uploaded PDF answer sheet into flat images that can be embedded into the final report.

*(Note: `pdfjs-dist` is loaded globally via a Next.js `<Script>` tag pointing to a CDN to bypass Turbopack server bundling errors related to the Node.js `canvas` dependency).*

## Core Capabilities

### Bounding Box Cropping
When embedding the student's answer as visual evidence, the engine calculates the intersection of the AI-provided normalized coordinates (`region.x, y, w, h`) and crops the exact rectangular snippet from the high-resolution answer sheet image.

### Dynamic Pagination & Word Wrapping
`jsPDF` relies on strict cursor math (`yCursor`). 
- **Word Wrapping**: Handled natively using the `{ maxWidth: ... }` boundary options. The `doc.getTextDimensions` API precisely calculates the height of wrapped text blocks to dynamically advance the cursor.
- **Pagination**: If `yCursor` exceeds `PAGE_HEIGHT - 30mm`, the system automatically invokes `doc.addPage()` to prevent content from bleeding off the bottom.

### Label Formatting
Question labels (e.g., `Q1(a)`) are scrubbed and deduplicated using the shared `formatQuestionNumber` utility to ensure absolute parity with the web UI.
