import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Star, Clock } from 'lucide-react';
import { Question } from '@/data/questions';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface ReflectionModalProps {
  question: Question;
  onClose: () => void;
  onSubmit: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({ 
  question, 
  onClose, 
  onSubmit 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(30);
  const [reflection, setReflection] = useState({
    learning: '',
    discoveries: ''
  });

  const updateStreakData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Check if there's already a streak entry for today
      const { data: todayStreak, error: todayError } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (todayError && todayError.code !== 'PGRST116') {
        throw todayError;
      }

      if (todayStreak) {
        // Update existing streak for today
        await supabase
          .from('daily_streaks')
          .update({
            questions_completed: todayStreak.questions_completed + 1
          })
          .eq('id', todayStreak.id);
      } else {
        // Get the most recent streak to calculate new streak count
        const { data: latestStreak, error: latestError } = await supabase
          .from('daily_streaks')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestError && latestError.code !== 'PGRST116') {
          throw latestError;
        }

        // Calculate streak count
        let streakCount = 1;
        if (latestStreak) {
          if (latestStreak.date === yesterday) {
            // Continuing streak
            streakCount = latestStreak.streak_count + 1;
          } else if (latestStreak.date === today) {
            // Same day (shouldn't happen but handle it)
            streakCount = latestStreak.streak_count;
          }
          // If gap > 1 day, streak resets to 1
        }

        // Create new streak entry for today
        await supabase
          .from('daily_streaks')
          .insert({
            user_id: user.id,
            date: today,
            questions_completed: 1,
            streak_count: streakCount
          });

        // Show streak milestone messages
        if (streakCount === 1 && latestStreak && latestStreak.date !== yesterday) {
          toast({
            title: "Streak Reset 🔄",
            description: "Starting fresh! Let's build a new streak together.",
            variant: "destructive",
          });
        } else if (streakCount > 1) {
          const milestones = [7, 14, 21, 30, 50, 100];
          if (milestones.includes(streakCount)) {
            toast({
              title: `🔥 ${streakCount} Day Streak! 🔥`,
              description: `Incredible dedication! You're on fire!`,
            });
          } else if (streakCount % 10 === 0) {
            toast({
              title: `${streakCount} Day Streak! 🎯`,
              description: "Keep the momentum going!",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Mark question as completed
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          question_id: question.id,
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent: timeSpent
        });

      if (progressError) throw progressError;

      // Save reflection if provided
      if (reflection.learning || reflection.discoveries) {
        const { error: reflectionError } = await supabase
          .from('question_reflections')
          .upsert({
            user_id: user.id,
            question_id: question.id,
            learning: reflection.learning,
            discoveries: reflection.discoveries
          });

        if (reflectionError) throw reflectionError;
      }

      // Update streak data
      await updateStreakData();

      toast({
        title: "Excellent work! 🎉",
        description: "Question completed and reflection saved. Keep building that streak!",
      });

      onSubmit();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSkip = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Mark question as completed without reflection
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          question_id: question.id,
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent: timeSpent
        });

      if (progressError) throw progressError;

      // Update streak data
      await updateStreakData();

      toast({
        title: "Question completed! 🎉",
        description: "Progress saved. Consider adding reflections next time for better learning!",
      });

      onSubmit();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 mx-4">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-2xl pr-8">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="line-clamp-2">Reflect on Your Learning</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 text-lg line-clamp-2">{question.title}</h3>
            <p className="text-blue-700">{question.topic} • {question.difficulty}</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="time-spent" className="text-lg font-medium flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-gray-600" />
                How much time did you spend? (minutes)
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  id="time-spent"
                  min="1"
                  max="180"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(Number(e.target.value))}
                  className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200"
                />
                <span className="text-gray-600 font-medium">minutes</span>
              </div>
            </div>

            <div>
              <Label htmlFor="learning" className="text-lg font-medium flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                What did you learn from this question?
              </Label>
              <Textarea
                id="learning"
                placeholder="Describe the key concepts, algorithms, or techniques you learned..."
                value={reflection.learning}
                onChange={(e) => setReflection({ ...reflection, learning: e.target.value })}
                className="min-h-[120px] border-2 border-gray-300 focus:border-blue-500 text-base resize-none transition-all duration-200"
              />
            </div>

            <div>
              <Label htmlFor="discoveries" className="text-lg font-medium flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-purple-500" />
                What new things did you discover?
              </Label>
              <Textarea
                id="discoveries"
                placeholder="Share any insights, optimizations, or alternative approaches you discovered..."
                value={reflection.discoveries}
                onChange={(e) => setReflection({ ...reflection, discoveries: e.target.value })}
                className="min-h-[120px] border-2 border-gray-300 focus:border-blue-500 text-base resize-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200 sticky bottom-0 bg-white">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-2 hover:bg-gray-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Skip Reflection'}
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : 'Complete & Save Reflection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};