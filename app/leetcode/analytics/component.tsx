// pages/leetcode-analysis.tsx
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

// Helper function to parse date strings
const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Helper function to format dates for display
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to calculate days between two dates
const daysBetween = (date1: Date, date2: Date): number => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    Math.abs((date1.getTime() - date2.getTime()) / millisecondsPerDay)
  );
};

const LeetCodeAnalysis: React.FC<{ progress: LeetCodeProblem[] }> = ({
  progress
}) => {
  const [dateRange, setDateRange] = useState<number>(30); // Default to 30 days
  const [solvedByDifficulty, setSolvedByDifficulty] = useState<any[]>([]);
  const [solvedByTopic, setSolvedByTopic] = useState<any[]>([]);
  const [submissionsByDate, setSubmissionsByDate] = useState<any[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<LeetCodeProblem[]>([]);

  useEffect(() => {
    if (progress.length > 0) {
      analyzeSubmissions();
    }
  }, [dateRange]);

  const analyzeSubmissions = () => {
    const now = new Date();

    // Filter submissions within the date range
    const recentSubmissions = progress.filter(sub => {
      const submissionDate = parseDate(sub.lastSubmittedAt);
      return daysBetween(submissionDate, now) <= dateRange;
    });

    // Store solved problems for display
    const solved = recentSubmissions.filter(
      sub => sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC'
    );
    setSolvedProblems(solved);

    // Count submissions by difficulty
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

    // Count submissions by topic
    const topicCount: Record<string, number> = {};

    recentSubmissions.forEach(sub => {
      if (sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC') {
        sub.topicTags.forEach(tag => {
          topicCount[tag.name] = (topicCount[tag.name] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    const topicArray = Object.entries(topicCount).map(([name, count]) => ({
      name,
      count
    }));
    topicArray.sort((a, b) => b.count - a.count);

    // Take top 10 topics
    setSolvedByTopic(topicArray.slice(0, 10));

    // Group submissions by date
    const dateSubmissions: Record<string, number> = {};

    recentSubmissions.forEach(sub => {
      if (sub.questionStatus === 'SOLVED' && sub.lastResult === 'AC') {
        const dateStr = formatDate(parseDate(sub.lastSubmittedAt));
        dateSubmissions[dateStr] = (dateSubmissions[dateStr] || 0) + 1;
      }
    });

    // Convert to array for chart
    const dateArray = Object.entries(dateSubmissions).map(([date, count]) => ({
      date,
      count
    }));
    dateArray.sort((a, b) => a.date.localeCompare(b.date));

    setSubmissionsByDate(dateArray);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">LeetCode Submission Analysis</h1>

      <div className="mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Problems Solved by Difficulty
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={solvedByDifficulty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Problems Solved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Problems Solved Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={submissionsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Topics</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={solvedByTopic}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" name="Problems Solved" />
          </BarChart>
        </ResponsiveContainer>
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

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Solved Problems</h3>
          <div className="max-h-96 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default LeetCodeAnalysis;
