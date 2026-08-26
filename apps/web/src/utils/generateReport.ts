import { jsPDF } from 'jspdf';
import { MappedItem } from '@/store/mappingStore';
import { formatQuestionNumber } from "./formatQuestion";

// We'll rely on the global window.pdfjsLib loaded via Next.js Script tag
// to avoid Next.js Turbopack server/browser bundling errors with 'canvas'.

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const renderPdfPageToCanvas = async (base64Pdf: string, pageNumber: number): Promise<HTMLCanvasElement> => {
  const binaryString = window.atob(base64Pdf);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error("pdfjsLib is not loaded");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  // Render at a high scale for good resolution
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error("Could not create canvas context");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  return canvas;
};

export const generatePdfReport = async (
  mappedData: MappedItem[], 
  answerSheet: { base64: string, mimeType: string } | null
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN = 20;

  // 1. Calculate Totals
  const totalSuggested = mappedData.reduce((acc, curr) => acc + (curr.finalMarks ?? curr.aiSuggestedMarks ?? 0), 0);
  const totalMax = mappedData.reduce((acc, curr) => acc + (curr.question.maxScore || 0), 0);

  // 2. Pre-process Answer Sheet to Canvas (if needed)
  let asCanvases: Record<number, HTMLCanvasElement> = {};
  let asImage: HTMLImageElement | null = null;

  if (answerSheet) {
    if (answerSheet.mimeType.includes('pdf')) {
      // Find all unique pages referenced
      const uniquePages = new Set<number>();
      mappedData.forEach(item => {
        if (item.answer?.regions) {
          item.answer.regions.forEach(r => uniquePages.add(r.page));
        }
      });
      // For fallback or page 1 if none found
      if (uniquePages.size === 0) uniquePages.add(1);

      for (const pageNum of uniquePages) {
        asCanvases[pageNum] = await renderPdfPageToCanvas(answerSheet.base64, pageNum);
      }
    } else {
      asImage = await loadImage(`data:${answerSheet.mimeType};base64,${answerSheet.base64}`);
    }
  }

  // Pre-load Logo
  let logoImg: HTMLImageElement | null = null;
  try {
    // Attempt to load logo from public directory
    logoImg = await loadImage('/logo.png');
  } catch (e) {
    console.warn("Could not load logo image for PDF", e);
  }

  let yCursor = MARGIN;

  const addNewPage = () => {
    doc.addPage();
    yCursor = MARGIN;
    drawHeader();
  };

  const drawHeader = () => {
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', MARGIN, yCursor, 15, 15);
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(43, 43, 43);
    doc.text("Vedaai Assessment Report", logoImg ? MARGIN + 20 : MARGIN, yCursor + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, PAGE_WIDTH - MARGIN, yCursor + 10, { align: 'right' });
    
    yCursor += 25;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, yCursor, PAGE_WIDTH - MARGIN, yCursor);
    yCursor += 15;
  };

  drawHeader();

  // Top Summary
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Score: ${totalSuggested} / ${totalMax}`, MARGIN, yCursor);
  yCursor += 20;

  // Iterate Questions
  for (let i = 0; i < mappedData.length; i++) {
    const item = mappedData[i];
    const q = item.question;
    const currentScore = item.finalMarks ?? item.aiSuggestedMarks ?? 0;

    // Check pagination
    if (yCursor > PAGE_HEIGHT - 60) addNewPage();

    // Question Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 86, 35); // Vedaai orange
    const qLabel = `Q${formatQuestionNumber(q)}`;
    doc.text(qLabel, MARGIN, yCursor);

    doc.setTextColor(0, 0, 0);
    doc.text(`Score: ${currentScore} / ${q.maxScore}`, PAGE_WIDTH - MARGIN - 30, yCursor);
    
    yCursor += 7;

    // Question Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const textMaxWidth = PAGE_WIDTH - (MARGIN * 2);
    doc.text(q.text, MARGIN, yCursor, { maxWidth: textMaxWidth });
    const textDims = doc.getTextDimensions(q.text, { maxWidth: textMaxWidth });
    yCursor += textDims.h + 5;

    // Answer Image Region
    if (item.answer?.regions && item.answer.regions.length > 0 && answerSheet) {
      for (const region of item.answer.regions) {
        if (yCursor > PAGE_HEIGHT - 60) addNewPage();
        
        try {
          const cropCanvas = document.createElement('canvas');
          const ctx = cropCanvas.getContext('2d');
          if (!ctx) continue;

          let sourceWidth = 0;
          let sourceHeight = 0;
          let sourceImage: CanvasImageSource | null = null;

          if (answerSheet.mimeType.includes('pdf')) {
            const pageCanvas = asCanvases[region.page];
            if (pageCanvas) {
              sourceWidth = pageCanvas.width;
              sourceHeight = pageCanvas.height;
              sourceImage = pageCanvas;
            }
          } else if (asImage) {
            sourceWidth = asImage.width;
            sourceHeight = asImage.height;
            sourceImage = asImage;
          }

          if (sourceImage) {
            // Add some padding around the bounding box
            const paddingX = region.width * 0.05;
            const paddingY = region.height * 0.05;
            
            const rx = Math.max(0, region.x - paddingX);
            const ry = Math.max(0, region.y - paddingY);
            const rw = Math.min(1 - rx, region.width + (paddingX * 2));
            const rh = Math.min(1 - ry, region.height + (paddingY * 2));

            const sX = rx * sourceWidth;
            const sY = ry * sourceHeight;
            const sWidth = rw * sourceWidth;
            const sHeight = rh * sourceHeight;

            cropCanvas.width = sWidth;
            cropCanvas.height = sHeight;

            ctx.drawImage(sourceImage, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);
            
            const croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.9);
            
            // Calculate PDF dimensions keeping aspect ratio
            const maxWidth = PAGE_WIDTH - (MARGIN * 2);
            const maxHeight = 80;
            
            let drawWidth = maxWidth;
            let drawHeight = (sHeight * drawWidth) / sWidth;

            if (drawHeight > maxHeight) {
              drawHeight = maxHeight;
              drawWidth = (sWidth * drawHeight) / sHeight;
            }

            // Draw bounding box container in PDF
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(250, 250, 250);
            doc.rect(MARGIN, yCursor, drawWidth, drawHeight, 'FD');
            
            doc.addImage(croppedDataUrl, 'JPEG', MARGIN, yCursor, drawWidth, drawHeight);
            
            yCursor += drawHeight + 10;
          }
        } catch (e) {
          console.error("Failed to crop/draw answer region", e);
          doc.text("[Failed to load answer image fragment]", MARGIN, yCursor);
          yCursor += 10;
        }
      }
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("No answer region mapped.", MARGIN, yCursor);
      yCursor += 10;
    }

    // AI Feedback
    if (item.aiFeedback) {
      if (yCursor > PAGE_HEIGHT - 30) addNewPage();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const feedbackText = `Feedback: ${item.aiFeedback}`;
      const fbMaxWidth = PAGE_WIDTH - (MARGIN * 2);
      doc.text(feedbackText, MARGIN, yCursor, { maxWidth: fbMaxWidth });
      const fbDims = doc.getTextDimensions(feedbackText, { maxWidth: fbMaxWidth });
      yCursor += fbDims.h + 10;
    }

    // Divider
    doc.setDrawColor(240, 240, 240);
    doc.line(MARGIN, yCursor, PAGE_WIDTH - MARGIN, yCursor);
    yCursor += 10;
  }

  // Save the PDF
  doc.save('vedaai-assessment-report.pdf');
};
