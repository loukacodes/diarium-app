import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { analyzeMood } from '@/services/moodService';
import API_URL from '@/config/api';

interface HomeViewProps {
  token: string;
  onEntrySaved: (entryId: string) => void;
  onViewChange: (view: 'home' | 'entries' | 'mood' | 'profile') => void;
  hasEntry: (date: Date) => boolean;
}

export default function HomeView({ token, onEntrySaved, onViewChange, hasEntry }: HomeViewProps) {
  const [diaryEntry, setDiaryEntry] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const saveEntry = async () => {
    if (!diaryEntry.trim()) {
      return;
    }

    try {
      // Analyze mood first
      const moodAnalysis = await analyzeMood(diaryEntry);
      const moodScore = moodAnalysis.moods[0]?.confidence || 0.5;

      // Save entry with analyzed moods
      const response = await fetch(`${API_URL}/api/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          content: diaryEntry,
          mood: moodAnalysis.mood, // Primary mood for backward compatibility
          moods: moodAnalysis.moods, // Top 3 moods
          moodScore: moodScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      const data = await response.json();
      const savedEntryId = data.entry.id;

      // Clear the form
      setDiaryEntry('');

      // Notify parent to refresh entries and switch view
      onEntrySaved(savedEntryId);
      onViewChange('entries');
    } catch (error) {
      console.error('Save entry error:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  return (
    <>
      {/* Diary Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Write Your Diary Entry</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Express your thoughts and feelings. Our AI will analyze your mood.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="How was your day? What are you thinking about?"
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
            className="min-h-[120px] w-full"
          />
          <div className="flex justify-end">
            <Button onClick={saveEntry} disabled={!diaryEntry.trim()} className="w-full sm:w-auto">
              Publish Entry
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border shadow-sm"
            modifiers={{
              hasEntry: (date) => hasEntry(date),
            }}
            modifiersClassNames={{
              hasEntry: 'has-entry',
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

