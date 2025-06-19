import React, { useState, useEffect } from 'react';
import { LeetCodeProblem } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Switch } from '@/components/ui/switch';
import weeklyQuestions from '../leetcode_questions.json';

const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const daysBetween = (date1: Date, date2: Date): number => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    Math.abs((date1.getTime() - date2.getTime()) / millisecondsPerDay)
  );
};

const LeetCodeAnalysis: React.FC<{ progress: LeetCodeProblem[] }> = ({
  progress
}) => {
  const [dateRange, setDateRange] = useState<number>(7); // Default to 7 days
  const [solvedByDifficulty, setSolvedByDifficulty] = useState<any[]>([]);
  const [solvedByTopic, setSolvedByTopic] = useState<any[]>([]);
  const [submissionsByDate, setSubmissionsByDate] = useState<any[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<LeetCodeProblem[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] =
    useState<boolean>(false);

  useEffect(() => {
    if (progress.length > 0) {
      analyzeSubmissions();
      analyzeWeeklyProgress();
    }
  }, [dateRange]);

  const analyzeSubmissions = () => {
    const now = new Date();

    const recentSubmissions = progress.filter(sub => {
      const submissionDate = parseDate(sub.lastSubmittedAt);
      return daysBetween(submissionDate, now) <= dateRange;
    });

    const solved = recentSubmissions.filter(
      sub => sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC'
    );
    setSolvedProblems(solved);

    const difficultyCount = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0
    };

    recentSubmissions.forEach(sub => {
      if (sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC') {
        difficultyCount[sub.difficulty]++;
      }
    });

    setSolvedByDifficulty([
      { name: 'Easy', count: difficultyCount.EASY },
      { name: 'Medium', count: difficultyCount.MEDIUM },
      { name: 'Hard', count: difficultyCount.HARD }
    ]);

    const topicCount: Record<string, number> = {};

    recentSubmissions.forEach(sub => {
      if (sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC') {
        sub.topicTags.forEach(tag => {
          topicCount[tag.name] = (topicCount[tag.name] || 0) + 1;
        });
      }
    });

    const topicArray = Object.entries(topicCount).map(([name, count]) => ({
      name,
      count
    }));
    topicArray.sort((a, b) => b.count - a.count);

    setSolvedByTopic(topicArray.slice(0, 10));

    const dateSubmissions: Record<string, number> = {};

    recentSubmissions.forEach(sub => {
      if (sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC') {
        const dateStr = formatDate(parseDate(sub.lastSubmittedAt));
        dateSubmissions[dateStr] = (dateSubmissions[dateStr] || 0) + 1;
      }
    });

    const dateArray = Object.entries(dateSubmissions).map(([date, count]) => ({
      date,
      count
    }));
    dateArray.sort((a, b) => a.date.localeCompare(b.date));

    setSubmissionsByDate(dateArray);
  };

  const analyzeWeeklyProgress = () => {
    const solvedQuestionIds = new Set(
      progress
        .filter(p => p.questionStatus === 'SOLVED' && p.lastResult === 'AC')
        .map(p => p.frontendId)
    );

    const weeklyProgressData = weeklyQuestions.map((week, index) => {
      const weekNumber = index + 1;
      const totalQuestions = week.length;
      const solvedCount = week.filter(q =>
        solvedQuestionIds.has(q.frontendQuestionId)
      ).length;
      const completionRate =
        totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0;

      return {
        week: `Week ${weekNumber}`,
        weekNumber,
        solved: solvedCount,
        total: totalQuestions,
        completionRate: Math.round(completionRate * 100) / 100,
        isCompleted: solvedCount === totalQuestions
      };
    });

    setWeeklyProgress(weeklyProgressData);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">LeetCode Submission Analysis</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Show Detailed Analysis</span>
            <Switch
              checked={showDetailedAnalysis}
              onCheckedChange={setShowDetailedAnalysis}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="dateRange" className="block mb-2 font-medium">
          Date Range (days):
        </label>
        <input
          id="dateRange"
          type="number"
          min="1"
          max="365"
          value={dateRange}
          onChange={e => setDateRange(parseInt(e.target.value))}
          className="border rounded px-3 py-2 w-full max-w-xs"
        />
      </div>

      <div className="bg-white p-6 rounded shadow text-slate-900">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p className="mb-2">
          <strong>Total problems solved in the last {dateRange} days:</strong>{' '}
          {solvedByDifficulty.reduce((acc, curr) => acc + curr.count, 0)}
        </p>
        <p className="mb-2">
          <strong>Easy problems:</strong>{' '}
          {solvedByDifficulty.find(d => d.name === 'Easy')?.count || 0}
        </p>
        <p className="mb-2">
          <strong>Medium problems:</strong>{' '}
          {solvedByDifficulty.find(d => d.name === 'Medium')?.count || 0}
        </p>
        <p className="mb-2">
          <strong>Hard problems:</strong>{' '}
          {solvedByDifficulty.find(d => d.name === 'Hard')?.count || 0}
        </p>
        <p className="mb-2">
          <strong>Most practiced topic:</strong>{' '}
          {solvedByTopic.length > 0
            ? `${solvedByTopic[0].name} (${solvedByTopic[0].count} problems)`
            : 'None'}
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">
          Weekly Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {weeklyProgress.map(week => (
            <div
              key={week.weekNumber}
              className={`p-4 rounded-lg border-2 ${
                week.isCompleted
                  ? 'border-green-500 bg-green-50'
                  : week.completionRate >= 50
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{week.week}</h3>
                {week.isCompleted && (
                  <span className="text-green-600 text-sm font-medium">
                    ✓ Complete
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-600 mb-2">
                {week.solved} / {week.total} problems solved
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    week.isCompleted
                      ? 'bg-green-500'
                      : week.completionRate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${week.completionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">
                {week.completionRate}% complete
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900">
            Weekly Completion Chart
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                labelClassName="text-slate-800"
                formatter={(value, name) => {
                  if (name === 'completionRate') {
                    return [`${value}%`, 'Completion Rate'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="solved" fill="#8884d8" name="Problems Solved" />
              <Bar dataKey="total" fill="#e0e0e0" name="Total Problems" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showDetailedAnalysis && (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-3">Solved Problems</h3>
            <div className="max-h-96 overflow-y-auto rounded shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solved Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solvedProblems.map(problem => (
                    <tr key={problem.frontendId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {problem.frontendId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(parseDate(problem.lastSubmittedAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              Problems Solved by Difficulty
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={solvedByDifficulty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelClassName="text-slate-800" />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Problems Solved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              Problems Solved Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={submissionsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip labelClassName="text-slate-800" />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Problems Solved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">
              Top Topics
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={solvedByTopic}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip labelClassName="text-slate-800" />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Problems Solved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default LeetCodeAnalysis;
