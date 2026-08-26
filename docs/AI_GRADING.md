# AI Grading Engine (Gemini 3.1 Pro Preview)

## Overview
VedaAI utilizes Google's Gemini 3.1 Pro Preview model via the `@google/genai` SDK to perform automated layout analysis, handwriting recognition, question-answer mapping, and strict grading.

## Model Configuration

### Determinism (`temperature: 0.0`)
To ensure that the grading is perfectly consistent across identical submissions, the model's `temperature` is strictly locked to `0.0`. This prevents the LLM from hallucinating edge-case scores or behaving creatively.

### System Prompt & Grading Rules
The extraction is governed by a strict system prompt containing absolute operational rules:
1. **Consistency:** Grade strictly based on literal student text.
2. **No Hallucination:** Do not assume or grant marks for knowledge that is not explicitly written.
3. **Accuracy:** The assigned `aiSuggestedMarks` must never exceed the question's `maxScore`.
4. **Formatting Constraints:** The model is explicitly barred from generating string literals like `"null"` for missing sub-parts to prevent UI rendering bugs.

## Output Schema
The AI is forced to output structured JSON matching our `extractionSchema` (defined in `route.ts`). This schema returns a mapped array of:
- `question`: Extracted details (`id`, `number`, `subPart`, `text`, `maxScore`).
- `answer`: Extracted handwritten text and normalized spatial `regions` (`page`, `x`, `y`, `width`, `height`).
- `aiSuggestedMarks`: The deterministic score.
- `aiFeedback`: Brief, constructive feedback on why the score was assigned.

## Error Handling
Because LLM APIs frequently encounter `503 Service Unavailable` or `429 Too Many Requests` during high demand, the integration is wrapped in an exponential backoff retry mechanism that transparently recovers from temporary failures without user intervention.
