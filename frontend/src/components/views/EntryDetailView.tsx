import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getWordCount, formatDate, formatConfidence } from '@/utils/helpers';
import type { Entry } from '@/types';

interface EntryDetailViewProps {
  entry: Entry;
  onBack: () => void;
  onDelete: (entryId: string) => Promise<void>;
}

export default function EntryDetailView({ entry, onBack, onDelete }: EntryDetailViewProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      await onDelete(entry.id);
      onBack();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Entries
          </Button>
        </div>
        <CardTitle className="text-lg sm:text-xl">{formatDate(entry.createdAt)}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span>{getWordCount(entry.content)} words</span>
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
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">
            {entry.content}
          </p>
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Delete Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

