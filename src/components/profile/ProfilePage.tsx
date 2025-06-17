import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Calendar, 
  Trophy, 
  Target, 
  BookOpen, 
  Flame, 
  Clock, 
  TrendingUp, 
  Edit3, 
  Save, 
  X,
  Award,
  Star,
  Zap,
  Brain,
  Code,
  ChevronRight,
  Download,
  Share2,
  BarChart3,
  Activity,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, UserProgress, DailyStreak, QuestionReflection } from '@/lib/supabase';
import { allQuestions, questionsByDay, studyPlan, getDifficultyColor } from '@/data/questions';
import { useToast } from '@/hooks/use-toast';

interface ProfileStats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  topicsProgress: { [key: string]: { completed: number; total: number; percentage: number } };
  weeklyActivity: number[];
  reflectionsCount: number;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [streakData, setStreakData] = useState<DailyStreak[]>([]);
  const [reflections, setReflections] = useState<QuestionReflection[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    goals: '',
    preferred_topics: [] as string[],
    target_completion_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchUserProgress();
      fetchStreakData();
      fetchReflections();
    }
  }, [user]);

  useEffect(() => {
    if (userProgress.length >= 0 && streakData.length >= 0) {
      calculateStats();
    }
  }, [userProgress, streakData, reflections]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          goals: data.goals || '',
          preferred_topics: data.preferred_topics || [],
          target_completion_date: data.target_completion_date || ''
        });
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        setUserProgress(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
    }
  };

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching streaks:', error);
      } else {
        setStreakData(data || []);
      }
    } catch (error) {
      console.error('Error in fetchStreakData:', error);
    }
    
    setLoading(false);
  };

  const fetchReflections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('question_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reflections:', error);
      } else {
        setReflections(data || []);
      }
    } catch (error) {
      console.error('Error in fetchReflections:', error);
    }
  };

  const calculateStats = () => {
    const completed = userProgress.filter(p => p.completed);
    const totalCompleted = completed.length;
    const totalTimeSpent = completed.reduce((sum, p) => sum + (p.time_spent || 0), 0);
    
    // Difficulty breakdown
    const easyQuestions = allQuestions.filter(q => q.difficulty === 'Easy');
    const mediumQuestions = allQuestions.filter(q => q.difficulty === 'Medium');
    const hardQuestions = allQuestions.filter(q => q.difficulty === 'Hard');
    
    const easyCompleted = completed.filter(p => {
      const question = allQuestions.find(q => q.id === p.question_id);
      return question?.difficulty === 'Easy';
    }).length;
    
    const mediumCompleted = completed.filter(p => {
      const question = allQuestions.find(q => q.id === p.question_id);
      return question?.difficulty === 'Medium';
    }).length;
    
    const hardCompleted = completed.filter(p => {
      const question = allQuestions.find(q => q.id === p.question_id);
      return question?.difficulty === 'Hard';
    }).length;

    // Topics progress
    const topicsProgress: { [key: string]: { completed: number; total: number; percentage: number } } = {};
    
    // Initialize topics
    allQuestions.forEach(q => {
      if (!topicsProgress[q.topic]) {
        topicsProgress[q.topic] = { completed: 0, total: 0, percentage: 0 };
      }
      topicsProgress[q.topic].total++;
    });

    // Count completed questions per topic
    completed.forEach(p => {
      const question = allQuestions.find(q => q.id === p.question_id);
      if (question && topicsProgress[question.topic]) {
        topicsProgress[question.topic].completed++;
      }
    });

    // Calculate percentages
    Object.keys(topicsProgress).forEach(topic => {
      const { completed: topicCompleted, total } = topicsProgress[topic];
      topicsProgress[topic].percentage = total > 0 ? (topicCompleted / total) * 100 : 0;
    });

    // Weekly activity (last 7 days)
    const weeklyActivity = Array(7).fill(0);
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStreak = streakData.find(s => s.date === dateStr);
      weeklyActivity[6 - i] = dayStreak?.questions_completed || 0;
    }

    // Current and longest streak
    const currentStreak = streakData.length > 0 ? streakData[0]?.streak_count || 0 : 0;
    const longestStreak = streakData.length > 0 ? Math.max(...streakData.map(s => s.streak_count), 0) : 0;

    setStats({
      totalCompleted,
      currentStreak,
      longestStreak,
      totalTimeSpent,
      averageTimePerQuestion: totalCompleted > 0 ? Math.round(totalTimeSpent / totalCompleted) : 0,
      easyCompleted,
      mediumCompleted,
      hardCompleted,
      topicsProgress,
      weeklyActivity,
      reflectionsCount: reflections.length
    });
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          goals: profileData.goals,
          preferred_topics: profileData.preferred_topics,
          target_completion_date: profileData.target_completion_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated! ✨",
          description: "Your profile has been saved successfully.",
        });
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const exportProgress = () => {
    if (!stats) return;

    const exportData = {
      profile: {
        name: profileData.full_name,
        email: user?.email,
        joinDate: user?.created_at
      },
      stats: {
        totalCompleted: stats.totalCompleted,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalTimeSpent: stats.totalTimeSpent,
        averageTimePerQuestion: stats.averageTimePerQuestion
      },
      progress: userProgress.filter(p => p.completed).map(p => {
        const question = allQuestions.find(q => q.id === p.question_id);
        return {
          questionTitle: question?.title,
          difficulty: question?.difficulty,
          topic: question?.topic,
          completedAt: p.completed_at,
          timeSpent: p.time_spent
        };
      }),
      reflections: reflections.map(r => {
        const question = allQuestions.find(q => q.id === r.question_id);
        return {
          questionTitle: question?.title,
          learning: r.learning,
          discoveries: r.discoveries,
          createdAt: r.created_at
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Progress Exported! 📊",
      description: "Your progress data has been downloaded.",
    });
  };

  const shareProgress = async () => {
    if (!stats) return;

    const shareText = `🚀 My DSA Journey Progress:
📚 ${stats.totalCompleted}/${allQuestions.length} questions completed
🔥 ${stats.currentStreak} day current streak
⏱️ ${Math.round(stats.totalTimeSpent / 60)} hours of practice
💪 ${stats.reflectionsCount} learning reflections

Join me on this coding journey! #DSA #CodingJourney #Programming`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My DSA Progress',
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard! 📋",
        description: "Share your progress on social media!",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    // Show empty state with default values
    const defaultStats: ProfileStats = {
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalTimeSpent: 0,
      averageTimePerQuestion: 0,
      easyCompleted: 0,
      mediumCompleted: 0,
      hardCompleted: 0,
      topicsProgress: {},
      weeklyActivity: Array(7).fill(0),
      reflectionsCount: 0
    };
    
    // Initialize topics progress with zeros
    const uniqueTopics = [...new Set(allQuestions.map(q => q.topic))];
    uniqueTopics.forEach(topic => {
      const topicQuestions = allQuestions.filter(q => q.topic === topic);
      defaultStats.topicsProgress[topic] = {
        completed: 0,
        total: topicQuestions.length,
        percentage: 0
      };
    });
    
    setStats(defaultStats);
    return null;
  }

  const achievements = [
    { 
      title: "First Steps", 
      description: "Complete your first question", 
      achieved: stats.totalCompleted >= 1,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300"
    },
    { 
      title: "Week Warrior", 
      description: "Maintain a 7-day streak", 
      achieved: stats.longestStreak >= 7,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300"
    },
    { 
      title: "Century Club", 
      description: "Complete 100 questions", 
      achieved: stats.totalCompleted >= 100,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300"
    },
    { 
      title: "Reflection Master", 
      description: "Write 50 reflections", 
      achieved: stats.reflectionsCount >= 50,
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300"
    },
    { 
      title: "Speed Demon", 
      description: "Average under 20 minutes per question", 
      achieved: stats.averageTimePerQuestion <= 20 && stats.totalCompleted > 0,
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    },
    { 
      title: "Marathon Runner", 
      description: "Maintain a 30-day streak", 
      achieved: stats.longestStreak >= 30,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300"
    }
  ];

  const easyQuestions = allQuestions.filter(q => q.difficulty === 'Easy');
  const mediumQuestions = allQuestions.filter(q => q.difficulty === 'Medium');
  const hardQuestions = allQuestions.filter(q => q.difficulty === 'Hard');

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Profile Header */}
      <Card className="border border-blue-300 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-bold">
                  {profileData.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                {editing ? (
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="text-xl font-bold border border-blue-300 bg-white"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profileData.full_name || 'DSA Learner'}
                  </h1>
                )}
                
                <p className="text-gray-600 text-base font-medium">{user?.email}</p>
                
                {editing ? (
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="border border-blue-300 bg-white"
                  />
                ) : (
                  <p className="text-gray-700 max-w-md text-base">
                    {profileData.bio || "Passionate about mastering Data Structures and Algorithms! 🚀"}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={shareProgress} variant="outline" size="sm" className="border border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button onClick={exportProgress} variant="outline" size="sm" className="border border-green-300 hover:bg-green-50 transition-all duration-200">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              {editing ? (
                <div className="flex gap-1">
                  <Button onClick={saveProfile} size="sm" className="bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="border border-red-300 hover:bg-red-50">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="border border-purple-300 hover:bg-purple-50 transition-all duration-200">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Completed", value: stats.totalCompleted, icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300" },
          { label: "Current Streak", value: stats.currentStreak, icon: Flame, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-300" },
          { label: "Longest Streak", value: stats.longestStreak, icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-300" },
          { label: "Hours Practiced", value: Math.round(stats.totalTimeSpent / 60), icon: Clock, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-300" },
          { label: "Avg Time/Q", value: `${stats.averageTimePerQuestion}m`, icon: Target, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-300" },
          { label: "Reflections", value: stats.reflectionsCount, icon: Brain, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-300" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`border ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-3 text-center">
                <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold">Progress</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold">Achievements</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Difficulty Breakdown */}
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Easy", completed: stats.easyCompleted, total: easyQuestions.length, color: "bg-green-500", bgColor: "bg-green-50", borderColor: "border-green-300" },
                  { label: "Medium", completed: stats.mediumCompleted, total: mediumQuestions.length, color: "bg-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-300" },
                  { label: "Hard", completed: stats.hardCompleted, total: hardQuestions.length, color: "bg-red-500", bgColor: "bg-red-50", borderColor: "border-red-300" }
                ].map((diff, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${diff.borderColor} ${diff.bgColor}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base">{diff.label}</span>
                      <span className="text-sm text-gray-600 font-semibold">{diff.completed}/{diff.total}</span>
                    </div>
                    <Progress value={(diff.completed / diff.total) * 100} className="h-3 mb-1" />
                    <div className="text-sm text-gray-600 font-medium">
                      {Math.round((diff.completed / diff.total) * 100)}% complete
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-green-600" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-end gap-2 h-32">
                {stats.weeklyActivity.map((count, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  const maxCount = Math.max(...stats.weeklyActivity, 1);
                  const height = count > 0 ? Math.max((count / maxCount) * 100, 15) : 8;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-300 shadow-md ${
                          count > 0 ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gray-200'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${count} questions on ${date.toLocaleDateString()}`}
                      />
                      <div className="text-xs text-gray-600 font-medium">
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {/* Topics Progress */}
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Topics Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {Object.entries(stats.topicsProgress)
                  .sort(([,a], [,b]) => b.percentage - a.percentage)
                  .map(([topic, data]) => (
                    <div key={topic} className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-base">{topic}</span>
                        <span className="text-sm text-gray-600 font-semibold">
                          {data.completed}/{data.total} ({Math.round(data.percentage)}%)
                        </span>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reflections */}
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-indigo-600" />
                Recent Reflections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {reflections.length === 0 ? (
                <div className="text-center py-6">
                  <Brain className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-base">No reflections yet. Start solving questions and add your insights!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reflections.slice(0, 5).map((reflection) => {
                    const question = allQuestions.find(q => q.id === reflection.question_id);
                    return (
                      <div key={reflection.id} className="p-3 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-base">{question?.title}</h4>
                          <Badge variant="outline" className={`${getDifficultyColor(question?.difficulty || 'Easy')} font-semibold`}>
                            {question?.difficulty}
                          </Badge>
                        </div>
                        {reflection.learning && (
                          <p className="text-sm text-gray-700 mb-1 leading-relaxed">
                            <strong className="text-blue-600">Learning:</strong> {reflection.learning.slice(0, 120)}
                            {reflection.learning.length > 120 && '...'}
                          </p>
                        )}
                        {reflection.discoveries && (
                          <p className="text-sm text-gray-700 mb-1 leading-relaxed">
                            <strong className="text-purple-600">Discoveries:</strong> {reflection.discoveries.slice(0, 120)}
                            {reflection.discoveries.length > 120 && '...'}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 font-medium">
                          {new Date(reflection.created_at).toLocaleDateString('en', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                Achievements ({achievements.filter(a => a.achieved).length}/{achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={index}
                      className={`p-4 border rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        achievement.achieved 
                          ? `${achievement.borderColor} ${achievement.bgColor} shadow-lg` 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${achievement.achieved ? achievement.bgColor : 'bg-gray-200'}`}>
                          <Icon className={`h-6 w-6 ${achievement.achieved ? achievement.color : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-base ${achievement.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{achievement.description}</p>
                        </div>
                        {achievement.achieved ? (
                          <Badge className="bg-green-600 text-white font-semibold px-2 py-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Unlocked!
                          </Badge>
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border border-gray-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-orange-600" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-base font-semibold">Learning Goals</Label>
                  <Textarea
                    id="goals"
                    value={profileData.goals}
                    onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                    placeholder="What are your DSA learning goals?"
                    className="border border-gray-300 focus:border-orange-500 min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-date" className="text-base font-semibold">Target Completion Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={profileData.target_completion_date}
                    onChange={(e) => setProfileData({ ...profileData, target_completion_date: e.target.value })}
                    className="border border-gray-300 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <Button onClick={saveProfile} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 shadow-lg transition-all duration-200">
                <Save className="h-3 w-3 mr-1" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};