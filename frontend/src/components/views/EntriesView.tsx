import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWordCount, formatDate } from '@/utils/helpers';
import type { Entry } from '@/types';

interface EntriesViewProps {
  entries: Entry[];
  isLoadingEntries: boolean;
  onEntryClick: (entryId: string) => void;
}

export default function EntriesView({
  entries,
  isLoadingEntries,
  onEntryClick,
}: EntriesViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Your Diary Entries</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          All your thoughts and memories in one place
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingEntries ? (
          <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No entries yet</p>
            <p className="text-sm">Start writing your first diary entry!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const preview =
                entry.content.length > 200
                  ? entry.content.substring(0, 200) + '...'
                  : entry.content;

              return (
                <Card
                  key={entry.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onEntryClick(entry.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        {formatDate(entry.createdAt)}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>{getWordCount(entry.content)} words</span>
                        {entry.moods && entry.moods.length > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.moods.slice(0, 3).map((m, idx) => (
                              <span
                                key={idx}
                                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize"
                              >
                                {m.mood} ({m.confidence * 100}%)
                              </span>
                            ))}
                          </div>
                        ) : entry.mood ? (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize">
                            {entry.mood}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words mb-4">
                      {preview}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

