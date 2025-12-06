import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface MoodViewProps {
  entries: Entry[];
}

export default function MoodView({ entries }: MoodViewProps) {
  // Process entries for charts
  const moodCounts = entries.reduce((acc, entry) => {
    const mood = entry.mood || 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Time series data (last 30 days or all entries)
  const timeSeriesData = entries
    .slice()
    .reverse()
    .slice(0, 30)
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

  // Mood distribution over time (weekly)
  const weeklyData = entries.reduce((acc, entry) => {
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
                  <p className="text-2xl font-bold">{entries.length}</p>
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
                      entries.reduce(
                        (sum, e) => sum + e.content.split(/\s+/).filter((w) => w.length > 0).length,
                        0,
                      ) / entries.length || 0,
                    )}
                  </p>
                </div>
              </div>

              {/* Mood Distribution Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Over Time Line Chart */}
              {timeSeriesData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mood Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="moodScore"
                        stroke="#3b82f6"
                        name="Mood Score"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Mood Distribution */}
              {weeklyChartData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Weekly Mood Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(moodCounts).map((mood, index) => (
                        <Bar
                          key={mood}
                          dataKey={mood}
                          stackId="a"
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

