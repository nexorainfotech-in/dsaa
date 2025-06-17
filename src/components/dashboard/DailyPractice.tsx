import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ExternalLink, Play, Clock, Star, Lock, AlertTriangle } from 'lucide-react';
import { questionsByDay, getDifficultyColor, Question, studyPlan } from '@/data/questions';
import { UserProgress } from '@/lib/supabase';
import { QuestionModal } from './QuestionModal';
import { ReflectionModal } from './ReflectionModal';

interface DailyPracticeProps {
  day: number;
  userProgress: UserProgress[];
  onProgressUpdate: () => void;
  allUserProgress: UserProgress[]; // All user progress to check prerequisites
}

export const DailyPractice: React.FC<DailyPracticeProps> = ({ 
  day, 
  userProgress, 
  onProgressUpdate,
  allUserProgress 
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showReflection, setShowReflection] = useState<Question | null>(null);

  const todaysQuestions = questionsByDay(day);
  const completedToday = userProgress.filter(p => 
    p.completed && todaysQuestions.some(q => q.id === p.question_id)
  ).length;

  const progress = (completedToday / todaysQuestions.length) * 100;

  // Check if all previous days are completed
  const checkPreviousDaysCompleted = () => {
    for (let prevDay = 1; prevDay < day; prevDay++) {
      const prevDayQuestions = questionsByDay(prevDay);
      const prevDayCompleted = allUserProgress.filter(p => 
        p.completed && prevDayQuestions.some(q => q.id === p.question_id)
      ).length;
      
      if (prevDayCompleted < studyPlan.questionsPerDay) {
        return { isCompleted: false, incompleteDay: prevDay, missing: studyPlan.questionsPerDay - prevDayCompleted };
      }
    }
    return { isCompleted: true, incompleteDay: null, missing: 0 };
  };

  const prerequisiteCheck = checkPreviousDaysCompleted();
  const isDayUnlocked = day === 1 || prerequisiteCheck.isCompleted;

  const isQuestionCompleted = (questionId: number) => {
    return userProgress.some(p => p.question_id === questionId && p.completed);
  };

  const handleQuestionComplete = (question: Question) => {
    if (!isDayUnlocked) return;
    setShowReflection(question);
  };

  const handleReflectionSubmit = () => {
    onProgressUpdate();
    setShowReflection(null);
  };

  return (
    <>
      <Card className={`border-2 ${isDayUnlocked ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className={`p-2 rounded-lg ${isDayUnlocked ? 'bg-green-600' : 'bg-red-600'}`}>
                {isDayUnlocked ? (
                  <Play className="h-6 w-6 text-white" />
                ) : (
                  <Lock className="h-6 w-6 text-white" />
                )}
              </div>
              Day {day} - Daily Practice
              {!isDayUnlocked && (
                <Badge variant="destructive" className="ml-2">
                  Locked
                </Badge>
              )}
            </CardTitle>
            <div className="text-right">
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${
                  isDayUnlocked 
                    ? 'bg-white border-green-300 text-green-700' 
                    : 'bg-white border-red-300 text-red-700'
                }`}
              >
                {completedToday}/{todaysQuestions.length} Complete
              </Badge>
              <div className={`text-sm mt-1 ${isDayUnlocked ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(progress)}% Progress
              </div>
            </div>
          </div>
          
          {!isDayUnlocked && prerequisiteCheck.incompleteDay && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                <AlertTriangle className="h-5 w-5" />
                Day Locked - Complete Previous Days First
              </div>
              <p className="text-red-600">
                You need to complete <strong>{prerequisiteCheck.missing} more questions</strong> from 
                <strong> Day {prerequisiteCheck.incompleteDay}</strong> before accessing this day.
              </p>
            </div>
          )}
          
          <Progress value={progress} className="h-4 mt-4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todaysQuestions.map((question, index) => {
              const isCompleted = isQuestionCompleted(question.id);
              const userProgressData = userProgress.find(p => p.question_id === question.id);

              return (
                <Card 
                  key={question.id} 
                  className={`transition-all duration-300 border-2 ${
                    !isDayUnlocked
                      ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                      : isCompleted 
                        ? 'bg-green-50 border-green-300 shadow-md hover:shadow-lg cursor-pointer' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer'
                  }`}
                  onClick={() => isDayUnlocked && setSelectedQuestion(question)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                          {index + 1}
                        </div>
                        {!isDayUnlocked ? (
                          <Lock className="h-6 w-6 text-gray-400 flex-shrink-0" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      {userProgressData?.time_spent && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {userProgressData.time_spent}m
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.topic}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {question.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {question.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        {question.leetcodeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isDayUnlocked) {
                                window.open(question.leetcodeUrl, '_blank');
                              }
                            }}
                            disabled={!isDayUnlocked}
                            className="h-8 px-3 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            LeetCode
                          </Button>
                        )}
                        
                        {question.gfgUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isDayUnlocked) {
                                window.open(question.gfgUrl, '_blank');
                              }
                            }}
                            disabled={!isDayUnlocked}
                            className="h-8 px-3 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            GFG
                          </Button>
                        )}
                      </div>
                      
                      {!isDayUnlocked ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Lock className="h-4 w-4" />
                          Locked
                        </div>
                      ) : !isCompleted ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionComplete(question);
                          }}
                          className="h-8 px-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Mark Done
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedQuestion && isDayUnlocked && (
        <QuestionModal 
          question={selectedQuestion}
          isCompleted={isQuestionCompleted(selectedQuestion.id)}
          onClose={() => setSelectedQuestion(null)}
          onComplete={() => handleQuestionComplete(selectedQuestion)}
        />
      )}

      {showReflection && (
        <ReflectionModal 
          question={showReflection}
          onClose={() => setShowReflection(null)}
          onSubmit={handleReflectionSubmit}
        />
      )}
    </>
  );
};