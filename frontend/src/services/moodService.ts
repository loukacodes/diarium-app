import API_URL from '@/config/api';
import type { MoodResult } from '@/types';

export async function analyzeMood(text: string): Promise<{
  mood: string;
  moods: MoodResult[];
  temporal?: { past: number; present: number; future: number };
  category?: Record<string, number>;
}> {
  try {
    const response = await fetch(`${API_URL}/api/analyze-mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Mood analysis failed');
    }

    const data = await response.json();
    return {
      mood: data.mood,
      moods: data.moods || [{ mood: data.mood, confidence: data.confidence }],
      temporal: data.temporal,
      category: data.category,
    };
  } catch (error) {
    console.error('Mood analysis error:', error);
    // Fallback to random mood if API fails
    const moods = ['happy', 'sad', 'excited', 'calm', 'anxious', 'grateful'];
    const fallbackMood = moods[Math.floor(Math.random() * moods.length)];
    return {
      mood: fallbackMood,
      moods: [{ mood: fallbackMood, confidence: 0.5 }],
    };
  }
}

