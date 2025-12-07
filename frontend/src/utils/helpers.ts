export function getWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatConfidence(confidence: number): string {
  const percentage = confidence * 100;
  const rounded = Math.round(percentage * 10) / 10;
  
  // If it's an integer, return without decimal
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  // Otherwise, return with one decimal place
  return rounded.toFixed(1);
}

