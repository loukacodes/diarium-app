import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { analyzeMood } from '@/services/moodService';
import { getWordCount, formatDate, formatConfidence, calculateStreak } from '@/utils/helpers';
import { FlameIcon } from '@/components/ui/nav-icons';
import API_URL from '@/config/api';
import type { Entry } from '@/types';

interface HomeViewProps {
  token: string;
  entries: Entry[];
  onEntrySaved: (entryId: string) => void;
  onViewChange: (view: 'home' | 'entries' | 'mood' | 'profile') => void;
  onEntryClick: (entryId: string) => void;
  hasEntry: (date: Date) => boolean;
}

export default function HomeView({
  token,
  entries,
  onEntrySaved,
  onViewChange,
  onEntryClick,
  hasEntry,
}: HomeViewProps) {
  const [diaryEntry, setDiaryEntry] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  // Calculate current streak
  const currentStreak = useMemo(() => calculateStreak(entries), [entries]);

  // Filter entries for the selected date
  const entriesForDate = useMemo(() => {
    if (!date) return [];

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
  }, [date, entries]);

  const saveEntry = async () => {
    if (!diaryEntry.trim()) {
      return;
    }

    try {
      // Analyze mood first
      const moodAnalysis = await analyzeMood(diaryEntry);
      const moodScore = moodAnalysis.moods[0]?.confidence || 0.5;

      // Save entry with analyzed moods, temporal, and category
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
          temporal: moodAnalysis.temporal, // Temporal analysis
          category: moodAnalysis.category, // Category analysis
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
      {/* Streak Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{currentStreak}</p>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <span>{currentStreak === 1 ? 'day' : 'days'} streak</span>
                <FlameIcon size={16} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            className="min-h-[250px] w-full"
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
          {date && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Entries for {formatDate(date.toISOString())}
              </h3>
              {entriesForDate.length > 0 ? (
                <div className="space-y-3">
                  {entriesForDate.map((entry) => {
                    const preview =
                      entry.content.length > 150
                        ? entry.content.substring(0, 150) + '...'
                        : entry.content;

                    return (
                      <Card
                        key={entry.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          onEntryClick(entry.id);
                          onViewChange('entries');
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                              {getWordCount(entry.content)} words
                            </div>
                            {entry.moods && entry.moods.length > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                {entry.moods.slice(0, 3).map((m, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize"
                                  >
                                    {m.mood} ({formatConfidence(m.confidence)}%)
                                  </span>
                                ))}
                              </div>
                            ) : entry.mood ? (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize">
                                {entry.mood}
                              </span>
                            ) : null}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words text-left">
                            {preview}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No entries for this date</p>
                  <p className="text-xs mt-1">Start writing to create your first entry!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
