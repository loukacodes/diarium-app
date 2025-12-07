import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getWordCount, formatDate, formatConfidence } from '@/utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
        <div className="text-sm sm:text-base text-muted-foreground">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">
            {entry.content}
          </p>
          {entry.moods && entry.moods.length > 0 ? (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Mood Analysis</h4>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <BarChart
                    data={entry.moods.map((m) => ({
                      mood: m.mood.charAt(0).toUpperCase() + m.mood.slice(1),
                      confidence: m.confidence * 100,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mood"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      width={40}
                      label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${formatConfidence(value / 100)}%`,
                        'Confidence',
                      ]}
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                    />
                    <Bar dataKey="confidence" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          {entry.temporal ? (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Temporal Focus</h4>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <BarChart
                    data={[
                      { name: 'Past', percentage: entry.temporal.past * 100 },
                      { name: 'Present', percentage: entry.temporal.present * 100 },
                      { name: 'Future', percentage: entry.temporal.future * 100 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      width={40}
                      label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${formatConfidence(value / 100)}%`,
                        'Percentage',
                      ]}
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                    />
                    <Bar dataKey="percentage" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          {entry.category && Object.keys(entry.category).length > 0 ? (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Category Focus</h4>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <BarChart
                    data={Object.entries(entry.category).map(([name, value]) => ({
                      category: name.charAt(0).toUpperCase() + name.slice(1),
                      percentage: (value as number) * 100,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      width={40}
                      label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${formatConfidence(value / 100)}%`,
                        'Percentage',
                      ]}
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                    />
                    <Bar dataKey="percentage" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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

