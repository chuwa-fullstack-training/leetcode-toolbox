/**
 * Represents a topic tag for a LeetCode problem
 */
interface TopicTag {
  name: string;
  nameTranslated: string;
  slug: string;
}

/**
 * Enum for user roles in the system
 */
export enum UserRole {
  STAFF = 'STAFF',
  TRAINER = 'TRAINER',
  TRAINEE = 'TRAINEE'
}

/**
 * Represents a notification recipient group
 */
export enum NotificationGroup {
  ALL = 'ALL', // All users
  ALL_STAFF = 'ALL_STAFF', // All staff members
  ALL_TRAINERS = 'ALL_TRAINERS', // All trainers
  ALL_TRAINEES = 'ALL_TRAINEES', // All trainees
  BATCH = 'BATCH', // Specific batch
  CUSTOM = 'CUSTOM' // Custom selection of users
}

/**
 * Represents a notification in the system
 */
export interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  sentBy: string; // User ID of the sender
  groupType: NotificationGroup;
  batchId?: string; // Only relevant if groupType is BATCH
  recipientIds?: string[]; // Array of user IDs for CUSTOM group
}

/**
 * Represents batch information/messages for a specific batch
 */
export interface BatchInfo {
  id: string;
  batchId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID of the creator
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
