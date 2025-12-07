export interface MoodResult {
  mood: string;
  confidence: number;
}

export interface Entry {
  id: string;
  content: string;
  mood: string | null;
  moods: MoodResult[] | null; // Top 3 moods with confidence
  moodScore: number | null;
  temporal: { past: number; present: number; future: number } | null; // Temporal analysis
  category: Record<string, number> | null; // Category analysis (work, life, school, etc.)
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

