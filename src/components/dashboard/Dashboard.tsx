import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Trophy, Target, BookOpen, Flame, Clock, TrendingUp, Play, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, UserProgress, DailyStreak, UserJourney } from '@/lib/supabase';
import { allQuestions, questionsByDay, studyPlan, getCurrentWeekInfo } from '@/data/questions';
import { DailyPractice } from './DailyPractice';
import { WeeklyOverview } from './WeeklyOverview';
import { useToast } from '@/hooks/use-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakWarning, setStreakWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    if (user) {
      initializeUserJourney();
    }
  }, [user]);

  const checkStreakStatus = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Get today's streak data
      const { data: todayStreak } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Get yesterday's streak data
      const { data: yesterdayStreak } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .maybeSingle();

      // Get latest streak for current count
      const { data: latestStreak } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestStreak) {
        setCurrentStreak(latestStreak.streak_count);
      }

      // Check for streak warnings
      if (yesterdayStreak && yesterdayStreak.streak_count > 0 && !todayStreak) {
        // User had a streak yesterday but hasn't practiced today
        const hoursSinceYesterday = (Date.now() - new Date(yesterday + 'T23:59:59').getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceYesterday > 12) { // Show warning after 12 hours into the new day
          if (yesterdayStreak.streak_count >= 7) {
            setStreakWarning(`🔥 DANGER ZONE! Your ${yesterdayStreak.streak_count}-day streak is about to break! Don't let all that hard work go to waste. Solve at least one question today to keep it alive! 💪`);
          } else if (yesterdayStreak.streak_count >= 3) {
            setStreakWarning(`⚠️ Your ${yesterdayStreak.streak_count}-day streak is at risk! Keep the momentum going - practice today! 🎯`);
          } else {
            setStreakWarning(`📚 You're building a great habit! Don't break your ${yesterdayStreak.streak_count}-day streak now. 🌟`);
          }
        }
      } else if (latestStreak && latestStreak.date !== today && latestStreak.date !== yesterday) {
        // Streak was already broken
        const daysSinceLastPractice = Math.floor((Date.now() - new Date(latestStreak.date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastPractice <= 3) {
          setStreakWarning(`💔 Your streak was broken ${daysSinceLastPractice} day${daysSinceLastPractice > 1 ? 's' : ''} ago. Time to start fresh and build an even stronger one! 🚀`);
        }
      }
    } catch (error) {
      console.error('Error checking streak status:', error);
    }
  };

  const initializeUserJourney = async () => {
    if (!user) return;

    try {
      // Check if user has an active journey
      const { data: existingJourney, error: journeyError } = await supabase
        .from('user_journey')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (journeyError) {
        console.error('Error fetching journey:', journeyError);
        return;
      }

      if (!existingJourney) {
        // Create new journey for first-time user
        const { data: newJourney, error: createError } = await supabase
          .from('user_journey')
          .insert({
            user_id: user.id,
            journey_start_date: new Date().toISOString().split('T')[0],
            current_day: 1,
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          if (createError.code === '23505') {
            const { data: retryJourney, error: retryError } = await supabase
              .from('user_journey')
              .select('*')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .single();

            if (retryError) {
              console.error('Error fetching journey after retry:', retryError);
              return;
            }

            setUserJourney(retryJourney);
            setSelectedDay(retryJourney.current_day);
          } else {
            console.error('Error creating journey:', createError);
            return;
          }
        } else {
          setUserJourney(newJourney);
          setSelectedDay(newJourney.current_day);
          toast({
            title: "Welcome to your DSA Journey! 🚀",
            description: "Your personalized learning path starts today!",
          });
        }
      } else {
        setUserJourney(existingJourney);
        setSelectedDay(existingJourney.current_day);
      }

      await fetchUserProgress();
      await checkStreakStatus();
    } catch (error) {
      console.error('Error initializing journey:', error);
    }

    setLoading(false);
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching progress:', error);
    } else {
      setUserProgress(data || []);
    }
  };

  const advanceToNextDay = async () => {
    if (!user || !userJourney) return;

    const currentDayQuestions = questionsByDay(userJourney.current_day);
    const currentDayProgress = userProgress.filter(p => 
      p.completed && currentDayQuestions.some(q => q.id === p.question_id)
    );

    if (currentDayProgress.length < studyPlan.questionsPerDay) {
      toast({
        title: "Complete Today's Questions First! 📚",
        description: `You need to complete ${studyPlan.questionsPerDay - currentDayProgress.length} more questions before advancing.`,
        variant: "destructive",
      });
      return;
    }

    const nextDay = userJourney.current_day + 1;
    
    const { error } = await supabase
      .from('user_journey')
      .update({ 
        current_day: nextDay,
        updated_at: new Date().toISOString()
      })
      .eq('id', userJourney.id);

    if (error) {
      console.error('Error advancing day:', error);
      toast({
        title: "Error",
        description: "Failed to advance to next day. Please try again.",
        variant: "destructive",
      });
    } else {
      setUserJourney({ ...userJourney, current_day: nextDay });
      setSelectedDay(nextDay);
      
      const weekInfo = getCurrentWeekInfo(nextDay);
      toast({
        title: `Welcome to Day ${nextDay}! 🎉`,
        description: weekInfo.isNewCycle 
          ? `Starting Cycle ${weekInfo.cycle} - ${weekInfo.focus}`
          : `Week ${weekInfo.week}, Day ${weekInfo.dayInWeek} - ${weekInfo.focus}`,
      });
    }
  };

  const startNewCycle = async () => {
    if (!user || !userJourney) return;

    const { error } = await supabase
      .from('user_journey')
      .update({ 
        current_day: 1,
        journey_start_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', userJourney.id);

    if (error) {
      console.error('Error starting new cycle:', error);
      toast({
        title: "Error",
        description: "Failed to start new cycle. Please try again.",
        variant: "destructive",
      });
    } else {
      setUserJourney({ 
        ...userJourney, 
        current_day: 1,
        journey_start_date: new Date().toISOString().split('T')[0]
      });
      setSelectedDay(1);
      
      toast({
        title: "New Cycle Started! 🔄",
        description: "Starting fresh with Day 1. Keep up the great work!",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border">
              <CardContent className="p-3">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userJourney) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <Card className="max-w-md mx-auto border border-red-200">
          <CardContent className="p-4 text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">Journey Not Found</h2>
            <p className="text-gray-600 text-sm">Unable to load your learning journey. Please refresh the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDay = userJourney.current_day;
  const weekInfo = getCurrentWeekInfo(currentDay);
  
  // Get progress for selected day
  const selectedDayQuestions = questionsByDay(selectedDay);
  const selectedDayProgress = userProgress.filter(p => 
    selectedDayQuestions.some(q => q.id === p.question_id)
  );
  const selectedDayCompleted = selectedDayProgress.filter(p => p.completed).length;

  // Get current day progress for advancement check
  const currentDayQuestions = questionsByDay(currentDay);
  const currentDayCompleted = userProgress.filter(p => 
    p.completed && currentDayQuestions.some(q => q.id === p.question_id)
  ).length;

  const completedQuestions = userProgress.filter(p => p.completed).length;
  const totalProgress = (completedQuestions / allQuestions.length) * 100;
  const dailyProgress = (currentDayCompleted / studyPlan.questionsPerDay) * 100;

  // Calculate weekly progress
  const weekStartDay = (weekInfo.week - 1) * 5 + 1;
  const weekEndDay = Math.min(weekInfo.week * 5, 30);
  const weekQuestions = [];
  for (let day = weekStartDay; day <= weekEndDay; day++) {
    weekQuestions.push(...questionsByDay(day));
  }
  const weekCompleted = userProgress.filter(p => 
    p.completed && weekQuestions.some(q => q.id === p.question_id)
  ).length;
  const weeklyProgress = (weekCompleted / weekQuestions.length) * 100;

  const canAdvanceDay = currentDayCompleted >= studyPlan.questionsPerDay;

  const stats = [
    {
      title: "Total Progress",
      value: `${completedQuestions}/${allQuestions.length}`,
      description: "Questions Completed",
      icon: BookOpen,
      progress: totalProgress,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Current Streak",
      value: currentStreak,
      description: "Days in a row",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Current Day Progress",
      value: `${currentDayCompleted}/${studyPlan.questionsPerDay}`,
      description: `Day ${currentDay} completion`,
      icon: Target,
      progress: dailyProgress,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Weekly Progress",
      value: `${weekCompleted}/${weekQuestions.length}`,
      description: `Week ${weekInfo.week} completion`,
      icon: TrendingUp,
      progress: weeklyProgress,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Streak Warning */}
      {streakWarning && (
        <Alert className="border border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 font-medium text-sm">
            {streakWarning}
          </AlertDescription>
          <Button 
            size="sm" 
            className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => setStreakWarning(null)}
          >
            <Zap className="h-3 w-3 mr-1" />
            Let's Practice!
          </Button>
        </Alert>
      )}

      {/* Welcome Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Current Day: {currentDay}
            {weekInfo.isNewCycle && (
              <span className="text-lg text-blue-600 ml-2">(Cycle {weekInfo.cycle})</span>
            )}
          </h1>
          <div className="flex gap-2">
            {canAdvanceDay && (
              <Button 
                onClick={advanceToNextDay}
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play className="h-3 w-3 mr-1" />
                Advance to Day {currentDay + 1}
              </Button>
            )}
            {currentDay > 30 && (
              <Button 
                onClick={startNewCycle}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                New Cycle
              </Button>
            )}
          </div>
        </div>
        <p className="text-base text-gray-600">
          {weekInfo.focus}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-500">
            Week {weekInfo.week} • Day {weekInfo.dayInWeek} of 5
            {weekInfo.isNewCycle && ` • Cycle ${weekInfo.cycle}`}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Journey started: {new Date(userJourney.journey_start_date).toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3 w-3 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                {stat.progress !== undefined && (
                  <div className="mt-2">
                    <Progress 
                      value={stat.progress} 
                      className="h-1.5" 
                    />
                    <p className="text-xs text-gray-400 mt-1">{Math.round(stat.progress)}% complete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Day Navigation and Practice */}
      <Card className="border border-blue-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Practice Any Day</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                disabled={selectedDay === 1}
                className="transition-all duration-200"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              <div className="text-sm font-semibold px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">
                Day {selectedDay}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDay(selectedDay + 1)}
                className="transition-all duration-200"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {selectedDay === currentDay ? (
              <span className="text-green-600 font-medium">This is your current day</span>
            ) : selectedDay < currentDay ? (
              <span className="text-blue-600">Previous day - All questions unlocked</span>
            ) : (
              <span className="text-orange-600">Future day - Complete previous days to unlock</span>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Daily Practice Section */}
      <DailyPractice 
        day={selectedDay}
        userProgress={selectedDayProgress}
        onProgressUpdate={() => {
          fetchUserProgress();
          checkStreakStatus();
        }}
        allUserProgress={userProgress}
      />

      {/* Weekly Overview */}
      <WeeklyOverview 
        currentWeek={weekInfo.week}
        userProgress={userProgress}
        currentDay={currentDay}
      />

      {/* Study Plan Overview */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-4 w-4 text-gray-600" />
            30-Day Study Plan Overview
            {weekInfo.isNewCycle && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">
                Cycle {weekInfo.cycle}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studyPlan.topics.map((topic, index) => {
              const isCurrentWeek = topic.week === weekInfo.week;
              const weekStartDay = (topic.week - 1) * 5 + 1;
              const weekEndDay = Math.min(topic.week * 5, 30);
              const weekQuestions = [];
              for (let day = weekStartDay; day <= weekEndDay; day++) {
                weekQuestions.push(...questionsByDay(day));
              }
              const weekCompleted = userProgress.filter(p => 
                p.completed && weekQuestions.some(q => q.id === p.question_id)
              ).length;
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isCurrentWeek 
                      ? 'border-blue-400 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge 
                      variant={isCurrentWeek ? "default" : "outline"}
                      className={isCurrentWeek ? "bg-blue-600" : ""}
                    >
                      Week {topic.week}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {weekCompleted}/{weekQuestions.length}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mb-2 text-xs">{topic.focus}</p>
                  <Progress 
                    value={(weekCompleted / weekQuestions.length) * 100} 
                    className="h-1.5"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};