import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Entry } from '@/types';
import type { DateRange } from 'react-day-picker';

// Helper function to calculate days difference
function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

interface MoodViewProps {
  entries: Entry[];
}

export default function MoodView({ entries }: MoodViewProps) {
  const [activePreset, setActivePreset] = useState<'all' | 7 | 30 | 90 | 'custom'>(30);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { from: start, to: end };
  });

  // Filter entries based on date range
  const filteredEntries = useMemo(() => {
    if (!dateRange?.from) return entries;

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const fromDate = new Date(dateRange.from!);
      fromDate.setHours(0, 0, 0, 0);

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        return entryDate >= fromDate && entryDate <= toDate;
      }

      return entryDate >= fromDate;
    });
  }, [entries, dateRange]);

  // Preset date range handlers
  const setPresetRange = (days: number | null) => {
    if (days === null) {
      // All time
      setDateRange(undefined);
      setActivePreset('all');
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      setDateRange({ from: start, to: end });
      setActivePreset(days as 7 | 30 | 90);
    }
  };

  // Handle custom date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // Check if the custom range matches any preset
    if (!range?.from || !range?.to) {
      setActivePreset('all');
      return;
    }
    const daysDiff = getDaysDifference(range.from, range.to);
    if (daysDiff === 6) {
      setActivePreset(7);
    } else if (daysDiff === 29) {
      setActivePreset(30);
    } else if (daysDiff === 89) {
      setActivePreset(90);
    } else {
      setActivePreset('custom');
    }
  };
  // Process entries for charts (using filtered entries)
  const moodCounts = filteredEntries.reduce((acc, entry) => {
    const mood = entry.mood || 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Time series data (using filtered entries)
  const timeSeriesData = filteredEntries
    .slice()
    .reverse()
    .map((entry) => {
      const date = new Date(entry.createdAt);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry.mood || 'Unknown',
        moodScore: entry.moodScore || 0,
        fullDate: date,
      };
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Mood distribution over time (weekly) - using filtered entries
  const weeklyData = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    const mood = entry.mood || 'Unknown';
    acc[weekKey][mood] = (acc[weekKey][mood] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const weeklyChartData = Object.entries(weeklyData)
    .map(([week, moods]) => ({
      week,
      ...moods,
    }))
    .slice(-8); // Last 8 weeks

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Mood Analytics</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Track your emotional journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Range Selector */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activePreset === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPresetRange(null)}
              >
                All Time
              </Button>
              <Button
                variant={activePreset === 7 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPresetRange(7)}
              >
                Last 7 Days
              </Button>
              <Button
                variant={activePreset === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPresetRange(30)}
              >
                Last 30 Days
              </Button>
              <Button
                variant={activePreset === 90 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPresetRange(90)}
              >
                Last 90 Days
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No entries yet. Start writing to see your mood trends!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{filteredEntries.length}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Unique Moods</p>
                  <p className="text-2xl font-bold">{Object.keys(moodCounts).length}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-lg font-semibold">
                    {Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Words</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      filteredEntries.reduce(
                        (sum, e) => sum + e.content.split(/\s+/).filter((w) => w.length > 0).length,
                        0,
                      ) / filteredEntries.length || 0,
                    )}
                  </p>
                </div>
              </div>

              {/* Mood Distribution Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minHeight={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value} (${((value / filteredEntries.length) * 100).toFixed(0)}%)`,
                          name,
                        ]}
                        contentStyle={{ fontSize: '12px', padding: '8px' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        iconSize={12}
                        iconType="circle"
                        formatter={(value, entry) => {
                          const entryValue = entry?.payload?.value ?? 0;
                          const percent = ((entryValue / filteredEntries.length) * 100).toFixed(0);
                          return `${value} (${percent}%)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Mood Over Time Line Chart */}
              {timeSeriesData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mood Over Time</h3>
                  <div className="w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height={250} minHeight={200}>
                      <LineChart
                        data={timeSeriesData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          width={40}
                          label={{
                            value: 'Score',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 11,
                          }}
                        />
                        <Tooltip contentStyle={{ fontSize: '12px', padding: '8px' }} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                          iconSize={12}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="moodScore"
                          stroke="#3b82f6"
                          name="Mood Score"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Weekly Mood Distribution */}
              {weeklyChartData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Weekly Mood Distribution</h3>
                  <div className="w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height={250} minHeight={200}>
                      <BarChart
                        data={weeklyChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          width={40}
                          label={{
                            value: 'Count',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 11,
                          }}
                        />
                        <Tooltip contentStyle={{ fontSize: '12px', padding: '8px' }} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                          iconSize={12}
                          iconType="circle"
                        />
                        {Object.keys(moodCounts).map((mood, index) => (
                          <Bar
                            key={mood}
                            dataKey={mood}
                            stackId="a"
                            fill={COLORS[index % COLORS.length]}
                            radius={[0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
