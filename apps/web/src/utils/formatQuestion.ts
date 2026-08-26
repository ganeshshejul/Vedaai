export function formatQuestionNumber(q: { number?: string, subPart?: string }, fallbackIndex?: number): string {
    const rawNum = q.number || (fallbackIndex !== undefined ? String(fallbackIndex + 1) : '');
    const rawSub = q.subPart;
    
    // Check if subPart is valid and not a "null" or "undefined" string hallucinated by the LLM
    const hasValidSubPart = rawSub && 
                            typeof rawSub === 'string' && 
                            rawSub.trim() !== '' && 
                            rawSub.toLowerCase() !== 'null' && 
                            rawSub.toLowerCase() !== 'undefined' &&
                            rawSub.toLowerCase() !== 'none';
    
    if (!hasValidSubPart) {
        return rawNum;
    }
    
    // If the number already ends with the subPart (e.g. number: "1(a)", subPart: "a")
    // or number is "1a" and subPart is "a", avoid duplication.
    const sub = rawSub.trim();
    if (rawNum.endsWith(`(${sub})`) || rawNum.endsWith(sub)) {
        return rawNum;
    }
    
    // Otherwise, combine them cleanly
    return `${rawNum}(${sub})`;
}
