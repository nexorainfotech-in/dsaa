import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { questionsByDay, getCurrentWeekInfo } from '@/data/questions';
import { UserProgress } from '@/lib/supabase';

interface WeeklyOverviewProps {
  currentWeek: number;
  userProgress: UserProgress[];
  currentDay: number;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ 
  currentWeek, 
  userProgress, 
  currentDay 
}) => {
  const weekInfo = getCurrentWeekInfo(currentDay);
  const weekStartDay = (currentWeek - 1) * 5 + 1;
  const weekEndDay = Math.min(currentWeek * 5, 30);
  
  const weekDays = [];
  for (let day = weekStartDay; day <= weekEndDay; day++) {
    const dayQuestions = questionsByDay(day);
    const completedQuestions = userProgress.filter(p => 
      p.completed && dayQuestions.some(q => q.id === p.question_id)
    ).length;
    
    weekDays.push({
      day,
      questions: dayQuestions,
      completed: completedQuestions,
      progress: (completedQuestions / dayQuestions.length) * 100,
      isCurrentDay: day === currentDay,
      isPastDay: day < currentDay,
      isFutureDay: day > currentDay
    });
  }

  const totalWeekQuestions = weekDays.reduce((sum, day) => sum + day.questions.length, 0);
  const totalWeekCompleted = weekDays.reduce((sum, day) => sum + day.completed, 0);
  const weekProgress = (totalWeekCompleted / totalWeekQuestions) * 100;

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Week {currentWeek} Overview
            {weekInfo.isNewCycle && (
              <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                Cycle {weekInfo.cycle}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="bg-white border-purple-300 text-purple-700 text-lg px-4 py-2">
            {totalWeekCompleted}/{totalWeekQuestions} Complete
          </Badge>
        </div>
        <Progress value={weekProgress} className="h-4 mt-4" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weekDays.map((dayData) => (
            <Card 
              key={dayData.day}
              className={`border-2 transition-all duration-300 ${
                dayData.isCurrentDay
                  ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                  : dayData.progress === 100 
                    ? 'border-green-300 bg-green-50' 
                    : dayData.progress > 0 
                      ? 'border-orange-300 bg-orange-50'
                      : dayData.isPastDay
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {dayData.progress === 100 ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : dayData.isCurrentDay ? (
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <h3 className={`font-semibold text-lg mb-1 ${
                  dayData.isCurrentDay ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Day {dayData.day}
                  {dayData.isCurrentDay && (
                    <div className="text-xs text-blue-600 font-normal">Current</div>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {dayData.completed}/{dayData.questions.length} questions
                </p>
                <Progress value={dayData.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(dayData.progress)}%
                </p>
                {dayData.isPastDay && dayData.progress < 100 && (
                  <div className="text-xs text-red-500 mt-1 font-medium">
                    Incomplete
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};