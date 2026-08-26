# VedaAI — AI Assessment Extraction & Answer Mapping

## Product Requirements Document (PRD) + Implementation Documentation

**Version:** 1.0
**Project:** VedaAI Hiring Assignment
**Status:** Implementation Blueprint
**Primary goal:** Build a teacher-facing web application that extracts questions from a question paper, extracts handwritten answers from a student's answer sheet, maps answers to questions, and highlights the exact answer regions.

---

# 1. Product Overview

## 1.1 Problem

Teachers currently need to manually inspect a question paper and a handwritten answer sheet to determine:

* What questions were asked?
* Which questions did the student answer?
* Where is each answer located?
* Did the student answer questions out of order?
* Which questions were left unanswered?
* Are there handwritten answers that cannot be associated with a question?

The product should turn this into a fast visual workflow.

### Core workflow

**Upload → Process → Extract Questions → Extract Answers → Map Answers → Review → Highlight → Optional Grade/Feedback**

The product must prioritize **accuracy of extraction, mapping, and highlighting** over optional grading functionality.

---

# 2. Assignment Requirements → Product Requirements

Every requirement from the supplied assignment must map to an implemented feature.

| Assignment requirement      | Product feature                  | Priority |
| --------------------------- | -------------------------------- | -------- |
| Upload question paper       | Question paper uploader          | P0       |
| PDF or images               | Multi-format upload              | P0       |
| Upload student answer sheet | Answer-sheet uploader            | P0       |
| Show processing progress    | Processing pipeline/progress UI  | P0       |
| Extract every question      | Question extraction engine       | P0       |
| Preserve printed order      | Ordered question list            | P0       |
| Preserve numbering          | Original question-number field   | P0       |
| Split labelled sub-parts    | Sub-question extraction          | P0       |
| Handle out-of-order answers | Answer mapping engine            | P0       |
| Handle unanswered questions | Unanswered state                 | P0       |
| Handle unmatched answers    | Unmatched-answer state           | P0       |
| Exact answer highlighting   | Bounding-region viewer           | P0       |
| Answers spanning pages      | Multi-region answer model        | P0       |
| Side-by-side display        | Question/answer review interface | P0       |
| Optional grading            | Grading module                   | P1       |
| AI insights                 | Feedback module                  | P1       |
| No authentication           | Public application               | P0       |
| No database required        | In-memory/session storage        | P0       |
| Live deployment             | Production deployment            | P0       |
| GitHub repository           | Monorepo                         | P0       |
| Figma design                | Figma-driven UI implementation   | P0       |

---

# 3. Figma Design Strategy

## 3.1 Design source of truth

Use the provided **VedaAI Hiring Assignment Figma file** as the visual source of truth:

[VedaAI Hiring Assignment — Figma](https://www.figma.com/design/GEjt1rt1s7AXvkcr4t8muE/VedaAI-Hiring-Assignment?node-id=0-1&t=Dv2LriEPmTjljAqe-1&utm_source=chatgpt.com)

Do **not** redesign the product independently unless a required state is missing from the reference design.

The implementation process should be:

**Figma frame → identify components → identify states → reproduce component → connect real data → add required edge states**

## 3.2 Assets to reuse

Before development, inspect the Figma file and create an `DESIGN-INVENTORY.md` containing:

* Page/frame names
* Logos
* Icons
* Illustrations
* Background assets
* Typography
* Font sizes
* Font weights
* Border radii
* Shadows
* Spacing
* Colors
* Buttons
* Inputs
* Cards
* Upload components
* Progress indicators
* Question cards
* Answer viewer
* Empty states
* Error states
* Success states

### Rule

If an asset exists in Figma, **reuse it rather than recreating an approximate version**.

If the Figma file contains a logo/icon as an exportable asset, export it and store it under:

`/apps/web/public/assets/`

Do not use screenshots of the Figma UI as production UI.

---

# 4. Required Product Screens

The exact visual styling should come from the Figma file. Functionally, the application requires the following screens/states.

## Screen A — Upload

Teacher can upload:

1. Question paper
2. Student answer sheet

Supported inputs:

* PDF
* JPG/JPEG
* PNG

The UI must clearly distinguish the two documents.

### Required states

* Empty
* File selected
* Uploading
* Invalid file
* Upload complete
* Remove/replace file

### Acceptance criteria

* Teacher cannot start processing without both files.
* Invalid file types are rejected.
* File size limits are communicated.
* Selected files can be replaced.
* Both documents have independent status indicators.

---

# 5. Processing Experience

After both files are uploaded, the teacher starts processing.

The UI must communicate that multiple AI operations are happening.

Recommended progress stages:

1. Reading question paper
2. Detecting questions
3. Reading answer sheet
4. Detecting answer regions
5. Matching answers to questions
6. Preparing review

Progress should not be fake.

The frontend should receive actual pipeline state from the backend.

### Data model

```ts
type ProcessingStage =
  | "uploading"
  | "extracting_questions"
  | "extracting_answers"
  | "mapping_answers"
  | "preparing_review"
  | "completed"
  | "failed";
```

### Acceptance criteria

* User knows what the system is currently doing.
* Processing errors are visible.
* Completion leads automatically to the review screen.
* A failed pipeline can be retried.

---

# 6. Question Extraction

## Objective

Extract **every question from the question paper** in the exact printed order.

Each extracted question should contain:

```ts
type Question = {
  id: string;
  number: string;
  text: string;
  parentNumber?: string;
  subPart?: string;
  order: number;
};
```

Example:

```text
11 (a)
Explain photosynthesis.

11 (b)
Explain cellular respiration.
```

must become two independent records:

```text
Question 11(a)
Question 11(b)
```

## Important rules

The extraction engine must:

* Preserve original numbering.
* Preserve order.
* Preserve labelled sub-parts.
* Avoid merging separate questions.
* Avoid creating duplicate questions.
* Support multi-line questions.
* Support questions spanning pages.

## Question extraction documentation

Implementation should record:

* Source page
* Bounding box
* OCR/vision text
* Question number
* Confidence
* Parent/sub-part relationship

This makes extraction debuggable.

---

# 7. Student Answer Extraction

## Objective

Detect the student's handwritten answers and their physical regions on the answer sheet.

The most important output is **not only text**.

It must contain the location of the answer.

```ts
type AnswerRegion = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Answer = {
  id: string;
  text: string;
  detectedQuestionNumber?: string;
  regions: AnswerRegion[];
};
```

Coordinates should be normalized from `0 → 1`.

Example:

```text
x = 0.12
y = 0.31
width = 0.70
height = 0.18
```

This ensures the highlight works at any viewer resolution.

---

# 8. Answer Mapping

This is the core intelligence layer.

The system should determine:

**Question → Student Answer → Physical Region**

Mapping should use multiple signals.

### Signal 1 — Explicit question number

If the student writes:

`Q. 11(b)`

the system should strongly associate that answer with `11(b)`.

### Signal 2 — Semantic similarity

If the student does not clearly write the question number, compare:

* Question text
* Extracted answer text
* Question context

### Signal 3 — Structural/spatial clues

Use:

* Page order
* Answer sequence
* Headings
* Number markers
* Nearby handwritten text

### Mapping output

```ts
type AnswerMapping = {
  questionId: string;
  answerId?: string;
  confidence: number;
  status:
    | "matched"
    | "unanswered"
    | "ambiguous"
    | "unmatched";
};
```

---

# 9. Out-of-Order Answers

The system must **not assume answer order equals question order**.

Example:

```text
Question paper:
1
2
3
4

Student:
1
4
2
3
```

The final UI must still display:

```text
1 → Answer found
2 → Answer found
3 → Answer found
4 → Answer found
```

The physical answer regions remain associated with their actual page locations.

---

# 10. Unanswered Questions

If no answer can be mapped to a question, the question should remain visible.

Example:

```text
11(a)    Answer found
11(b)    Answer found
12(a)    Unanswered
12(b)    Answer found
```

The unanswered state must be visually distinct.

The teacher should never have to infer missing questions from the answer sheet.

---

# 11. Unmatched Answers

Some handwriting may not correspond to any extracted question.

Example:

```text
Detected answer:
"Q. 18"

Question paper:
Only questions 1–17
```

This must not be silently discarded.

Create an **Unmatched Answers** section/state.

The teacher should be able to inspect its page and highlighted region.

---

# 12. Exact Answer Highlighting

This is a P0 feature and one of the most important evaluation criteria.

When the teacher clicks a question:

```text
Question 11(b)
        ↓
Mapped Answer
        ↓
Answer Sheet Page 4
        ↓
Highlight exact handwritten region
```

The answer viewer should:

1. Navigate to the relevant page.
2. Render the original answer-sheet page.
3. Draw the answer-region overlay.
4. Scroll/zoom to the relevant region where appropriate.
5. Support multiple regions.

### Multi-page answer

If an answer starts on page 3 and continues on page 4:

```ts
regions: [
  { page: 3, ... },
  { page: 4, ... }
]
```

Clicking the question should show both regions.

---

# 13. Main Review Interface

The review screen should follow the supplied Figma layout as closely as possible.

Functionally it should contain:

### Left/Question panel

* Question number
* Question text
* Answer status
* Optional score
* Selection state

### Right/Answer panel

* Student answer sheet
* Page navigation
* Zoom controls if present in Figma
* Exact highlight
* Multiple highlighted regions where applicable

### Suggested visual hierarchy

```text
┌────────────────────────────────────────────────────┐
│ Header                                             │
├───────────────────┬────────────────────────────────┤
│ Question List     │ Answer Sheet                   │
│                   │                                │
│ 01  ✓             │        Page 3                  │
│ 02  ✓             │     ┌──────────────┐           │
│ 03  —             │     │ highlighted  │           │
│ 04  ✓             │     │ answer       │           │
│                   │     └──────────────┘           │
│                   │                                │
└───────────────────┴────────────────────────────────┘
```

The exact layout, spacing, typography, colors and component styling must be taken from Figma rather than this conceptual diagram.

---

# 14. Grading & AI Feedback — P1

Grading is optional according to the assignment, so it should be implemented after extraction/mapping is reliable.

Possible features:

* Marks per question
* Correct/incorrect
* Partial marks
* AI feedback
* Overall score
* Strengths
* Areas for improvement

Example:

```ts
type Grade = {
  questionId: string;
  marksAwarded?: number;
  maximumMarks?: number;
  correctness?: "correct" | "partial" | "incorrect";
  feedback?: string;
};
```

### Important product rule

Do not allow grading to hide extraction/mapping uncertainty.

If mapping confidence is low, show:

**"Review mapping"**

rather than presenting a misleading grade.

---

# 15. Technical Architecture

Recommended stack:

**Frontend**

* Next.js
* TypeScript
* React
* Tailwind/CSS based on Figma tokens

**Backend**

* Next.js API routes/server actions or dedicated API layer

**AI**

* Vision-capable AI model for document/question/handwriting analysis

**Document processing**

* PDF page rendering
* OCR/vision extraction
* Image processing

**Storage**

* In-memory/session storage is sufficient for the assignment.

No authentication is required.

No permanent database is required.

### Architecture

```text
Browser
   │
   ├── Question Paper
   └── Answer Sheet
          │
          ▼
     Upload API
          │
          ▼
    Document Processor
          │
    ┌─────┴──────┐
    ▼            ▼
Question       Answer
Extraction    Extraction
    │            │
    └─────┬──────┘
          ▼
     Mapping Engine
          │
          ▼
      Review JSON
          │
          ▼
      Review UI
```

---

# 16. Recommended Monorepo

The assignment specifically requests that the GitHub repository be a monorepo.

Use:

```text
vedaai-assignment/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── extraction/
│   ├── mapping/
│   ├── document-processing/
│   └── types/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── EXTRACTION.md
│   ├── ANSWER-MAPPING.md
│   ├── HIGHLIGHTING.md
│   ├── TESTING.md
│   └── ASSUMPTIONS.md
│
├── public/
│
├── package.json
├── README.md
└── turbo.json
```

---

# 17. Documentation Required for Every Feature

Every implemented feature should receive a corresponding document.

## `docs/PRD.md`

Product requirements and scope.

## `docs/DESIGN-SYSTEM.md`

Document:

* Figma source
* Colors
* Typography
* Spacing
* Components
* Icons
* States
* Responsive behavior

## `docs/EXTRACTION.md`

Document:

* Question extraction
* Sub-question splitting
* OCR/vision model
* Prompt/schema
* Confidence
* Failure cases

## `docs/ANSWER-MAPPING.md`

Document:

* Number matching
* Semantic matching
* Confidence scoring
* Ambiguous mappings
* Out-of-order handling
* Unmatched answers

## `docs/HIGHLIGHTING.md`

Document:

* Coordinate system
* Page mapping
* Normalized bounding boxes
* Multi-page answers
* Zoom behavior
* Highlight rendering

## `docs/TESTING.md`

Document test cases for:

* Normal paper
* Sub-questions
* Out-of-order answers
* Unanswered questions
* Unmatched answers
* Multi-page answers
* Poor handwriting
* Multiple pages
* Invalid files
* Processing failures

## `docs/ASSUMPTIONS.md`

Explicitly document limitations and decisions.

---

# 18. Figma → Code Process

Before coding each UI feature:

### Step 1

Open the relevant Figma frame.

### Step 2

Record:

* Frame dimensions
* Layout
* Component hierarchy
* Typography
* Colors
* Spacing
* Borders
* Shadows
* Icons
* Assets

### Step 3

Create the React component.

Example:

```text
Figma:
Upload Card

Code:
UploadCard.tsx
```

### Step 4

Implement all states.

```text
UploadCard
├── empty
├── selected
├── uploading
├── success
└── error
```

### Step 5

Compare implementation against Figma.

### Step 6

Only then connect real functionality.

This prevents the common mistake of building functionality first and attempting to "make it look like Figma" afterward.

---

# 19. Acceptance Test Matrix

Before submission, all of the following must pass.

| Test                        | Expected result          |
| --------------------------- | ------------------------ |
| Upload PDF question paper   | Accepted                 |
| Upload image question paper | Accepted                 |
| Upload PDF answer sheet     | Accepted                 |
| Upload image answer sheet   | Accepted                 |
| Missing question paper      | Processing blocked       |
| Missing answer sheet        | Processing blocked       |
| Extract numbered questions  | Correct order            |
| Extract `11(a)`             | Separate question        |
| Extract `11(b)`             | Separate question        |
| Answer in correct order     | Correct mapping          |
| Answer out of order         | Correct mapping          |
| Question unanswered         | Marked unanswered        |
| Unknown answer              | Marked unmatched         |
| Answer spans pages          | All regions mapped       |
| Click question              | Correct answer displayed |
| Click question              | Exact region highlighted |
| Change question             | Highlight changes        |
| Processing failure          | Error shown              |
| Retry                       | Processing restarts      |
| AI ambiguity                | Review/uncertain state   |
| Deployment                  | Public URL works         |

---

# 20. Definition of Done

The assignment is complete only when:

* [ ] Question paper upload works.
* [ ] Answer-sheet upload works.
* [ ] PDF input works.
* [ ] Image input works.
* [ ] Processing progress is displayed.
* [ ] Every question is extracted.
* [ ] Original question order is preserved.
* [ ] Original numbering is preserved.
* [ ] Sub-parts are separate questions.
* [ ] Out-of-order answers are mapped.
* [ ] Unanswered questions are identified.
* [ ] Unmatched answers are identified.
* [ ] Multi-page answers are supported.
* [ ] Exact answer regions can be highlighted.
* [ ] Question and answer information can be reviewed side by side.
* [ ] Figma visual design has been implemented.
* [ ] Responsive behavior works.
* [ ] Error states work.
* [ ] Processing retry works.
* [ ] Optional grading does not interfere with mapping.
* [ ] Project is a monorepo.
* [ ] README is complete.
* [ ] Architecture is documented.
* [ ] AI model/API is documented.
* [ ] Assumptions/limitations are documented.
* [ ] GitHub repository is public/access-ready.
* [ ] Application is deployed.
* [ ] Live URL works.

---

# 21. Final Submission Documentation

The final submission should contain:

### Live deployed URL

Production URL of the application.

### GitHub repository

Monorepo containing:

* application
* packages
* documentation
* README
* configuration

### Approach

Briefly explain:

> The application uses a document-processing and vision pipeline to extract structured questions and handwritten answers. Questions are preserved in their printed order, while answers are represented as text plus page-level normalized regions. A mapping layer combines explicit question-number detection, semantic similarity and document structure to associate answers with questions. The review interface uses those regions to highlight the exact handwritten answer when a teacher selects a question.

### AI model/API

State the exact model/API used in the final implementation.

### Assumptions and limitations

Examples:

* Handwriting recognition depends on image quality.
* Ambiguous handwriting may require teacher review.
* Very complex layouts may reduce extraction confidence.
* The system exposes uncertainty rather than silently making an incorrect mapping.

---

# 22. Product Success Criteria

The project should ultimately answer three questions immediately for a teacher:

### 1. Which question?

The question list clearly identifies the selected question.

### 2. Did the student answer it?

The system displays:

* Answer found
* Unanswered
* Ambiguous
* Unmatched

### 3. Where is the answer?

The answer sheet automatically navigates to and highlights the exact handwritten region.

**If these three interactions work reliably, the core assignment is successfully solved.**

---

# 23. Implementation Priority

## P0 — Must Have

1. Figma-based interface
2. Question paper upload
3. Answer sheet upload
4. PDF/image support
5. Processing progress
6. Question extraction
7. Sub-question extraction
8. Answer extraction
9. Answer mapping
10. Out-of-order handling
11. Unanswered handling
12. Unmatched-answer handling
13. Exact-region highlighting
14. Multi-page answers
15. Side-by-side review
16. Error/retry states
17. Deployment
18. Monorepo
19. Documentation

## P1 — Nice to Have

1. Automatic grading
2. Per-question marks
3. Correct/incorrect classification
4. AI feedback
5. Overall grading summary
6. Confidence explanations

## P2 — Avoid for this assignment

Do not spend significant time on:

* Authentication
* User accounts
* Database architecture
* Teacher management
* Student management
* Long-term document storage
* Complex analytics
* Notifications

These do not materially improve the core evaluation criteria.

---

# 24. Build Philosophy

The project should be built around one principle:

> **Accuracy and explainability first; AI complexity second.**

The AI should extract and suggest.

The product should make the result **visually verifiable**.

A teacher should be able to click:

**11(b)**

and immediately see:

**the student's actual handwritten answer, on the correct page, with the exact region highlighted.**

That interaction is the central demonstration of the product and should receive the highest engineering and testing priority.
