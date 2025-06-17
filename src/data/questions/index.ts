import { arrayQuestions } from './arrays';
import { prefixQuestions } from './prefix';
import { mathQuestions } from './math';
import { hashingQuestions } from './hashing';
import { twoPointerQuestions } from './twoPointer';
import { slidingWindowQuestions } from './slidingWindow';
import { binarySearchQuestions } from './binarySearch';
import { recursionQuestions } from './recursion';
import { backtrackingQuestions } from './backtracking';
import { matrixQuestions } from './matrix';
import { linkedListQuestions } from './linkedList';
import { stackQuestions } from './stack';
import { stringQuestions } from './strings';
import { treeQuestions } from './trees';
import { bstQuestions } from './bst';
import { heapQuestions } from './heap';
import { greedyQuestions } from './greedy';
import { graphQuestions } from './graph';
import { dpQuestions } from './dp';
import { mixedQuestions } from './mixed';

export interface Question {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  day: number;
  description: string;
  leetcodeUrl?: string;
  gfgUrl?: string;
}

export const allQuestions: Question[] = [
  ...arrayQuestions,
  ...prefixQuestions,
  ...mathQuestions,
  ...hashingQuestions,
  ...twoPointerQuestions,
  ...slidingWindowQuestions,
  ...binarySearchQuestions,
  ...recursionQuestions,
  ...backtrackingQuestions,
  ...matrixQuestions,
  ...linkedListQuestions,
  ...stackQuestions,
  ...stringQuestions,
  ...treeQuestions,
  ...bstQuestions,
  ...heapQuestions,
  ...greedyQuestions,
  ...graphQuestions,
  ...dpQuestions,
  ...mixedQuestions
];

export const questionsByDay = (day: number): Question[] => {
  // For days beyond 30, cycle through the questions again
  const cycleDay = ((day - 1) % 30) + 1;
  return allQuestions.filter(q => q.day === cycleDay);
};

export const questionsByTopic = (topic: string): Question[] => {
  return allQuestions.filter(q => q.topic === topic);
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-700 bg-green-100 border-green-300';
    case 'Medium':
      return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'Hard':
      return 'text-red-700 bg-red-100 border-red-300';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300';
  }
};

// DSA Study Plan Overview - Now flexible and repeatable
export const studyPlan = {
  cycleLength: 30, // 30-day cycles
  questionsPerDay: 4,
  questionsPerCycle: 120,
  topics: [
    { week: 1, focus: "Arrays + Basic Math + Prefix", days: [1, 2, 3, 4, 5] },
    { week: 2, focus: "Hashing + Sliding Window + 2 Pointers", days: [6, 7, 8, 9, 10] },
    { week: 3, focus: "Binary Search + Matrix + Recursion", days: [11, 12, 13, 14, 15] },
    { week: 4, focus: "Linked List + Stack/Queue + Strings", days: [16, 17, 18, 19, 20] },
    { week: 5, focus: "Trees + Graphs + Greedy + DP Intro", days: [21, 22, 23, 24, 25] },
    { week: 6, focus: "Dynamic Programming + Mixed Topics", days: [26, 27, 28, 29, 30] }
  ]
};

export const getCurrentWeekInfo = (day: number) => {
  const cycleDay = ((day - 1) % 30) + 1;
  const currentWeek = Math.ceil(cycleDay / 5);
  const weekInfo = studyPlan.topics.find(t => t.week === currentWeek);
  const dayInWeek = ((cycleDay - 1) % 5) + 1;
  const cycle = Math.ceil(day / 30);
  
  return {
    week: currentWeek,
    dayInWeek,
    cycle,
    focus: weekInfo?.focus || "Mixed Practice",
    isNewCycle: day > 30
  };
};