import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getWordCount, formatDate, formatConfidence } from '@/utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Entry } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

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
          {entry.moods && entry.moods.length > 0 ? (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Mood Analysis</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={entry.moods.map((m) => ({
                      name: m.mood.charAt(0).toUpperCase() + m.mood.slice(1),
                      value: m.confidence * 100,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatConfidence(value / 100)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {entry.moods.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${formatConfidence(value / 100)}%`,
                      'Confidence',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleDelete} className="w-full sm:w-auto">
              Delete Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

