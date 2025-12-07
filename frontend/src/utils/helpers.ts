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

export function calculateStreak(entries: { createdAt: string }[]): number {
  if (entries.length === 0) return 0;

  // Get unique dates that have entries (normalized to start of day)
  const entryDates = new Set<string>();
  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    entryDates.add(dateKey);
  });

  // Calculate streak by checking consecutive days backwards from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check days backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];

    if (entryDates.has(dateKey)) {
      streak++;
    } else {
      // Break streak if we find a day without an entry
      break;
    }
  }

  return streak;
}

