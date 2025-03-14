/**
 * Represents a topic tag for a LeetCode problem
 */
interface TopicTag {
  name: string;
  nameTranslated: string;
  slug: string;
}

/**
 * Enum for difficulty levels of LeetCode problems
 */
enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

/**
 * Enum for question status values
 */
enum QuestionStatus {
  SOLVED = 'SOLVED',
  ATTEMPTED = 'ATTEMPTED',
  NOT_STARTED = 'NOT_STARTED'
}

/**
 * Enum for last result values
 */
enum LastResult {
  AC = 'AC', // Accepted
  WA = 'WA', // Wrong Answer
  TLE = 'TLE', // Time Limit Exceeded
  MLE = 'MLE', // Memory Limit Exceeded
  RE = 'RE', // Runtime Error
  CE = 'CE' // Compilation Error
}

/**
 * Represents a LeetCode problem
 */
export interface LeetCodeProblem {
  translatedTitle: string | null;
  frontendId: string;
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  lastSubmittedAt: string; // ISO 8601 date string
  numSubmitted: number;
  questionStatus: QuestionStatus;
  lastResult: LastResult;
  topicTags: TopicTag[];
}
