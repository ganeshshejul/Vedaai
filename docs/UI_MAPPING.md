# UI Mapping & Bounding Boxes

## Overview
The VedaAI Mapping interface (`MappingArea.tsx`) is the core operational screen of the application. It provides a split-pane layout for teachers to review the AI's grading logic, adjust scores, and verify spatial bounding boxes over the student's original handwritten answer sheet.

## Left Pane: Question Grading List
- **Interactive List:** Renders an accordion list of all extracted questions.
- **Smart Badges:** Question numbers are formatted dynamically (e.g., `1(a)`) using CSS flexible width constraints (`min-w-[32px] px-2 whitespace-nowrap`) to maintain a circular badge for single digits and an oval pill for multi-character subparts without CSS line-break duplication.
- **Human-in-the-Loop Override:** Displays the `aiSuggestedMarks` alongside a plus/minus widget that allows the teacher to override the score manually. This immediately updates the global state via `zustand`.

## Right Pane: Answer Sheet Viewer
### PDF-to-Image Rendering Engine
To accurately draw DOM-based `div` bounding boxes over uploaded PDF answer sheets, the UI must render the PDF natively.
1. The component detects if the `answerSheetBase64` is a PDF.
2. An asynchronous React `useEffect` loops over `window.pdfjsLib` (polling with a 2-second timeout to handle script load race conditions).
3. Every page of the PDF is mapped to a temporary HTML5 `<canvas>`.
4. The canvas is converted to a JPEG Data URL (`toDataURL`).
5. The Data URLs are stored in state (`pdfPages: string[]`) and rendered seamlessly as vertical images.

### Spatial Bounding Boxes
When a question is clicked in the Left Pane (`expandedId === q.id`), the system reads the corresponding AI extraction `regions`.
- The green highlighter is an absolutely positioned `div` layered on top of the image container.
- Coordinates (`x`, `y`, `width`, `height`) are normalized (0.0 to 1.0) by the AI, which mathematically translates directly to CSS `%` placement (e.g., `top: 45.2%`).
- For PDFs, bounding boxes respect the `region.page` property, guaranteeing that evidence on Page 3 does not erroneously highlight Page 1.
