import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle2, BookOpen, Star } from 'lucide-react';
import { Question, getDifficultyColor } from '@/data/questions';

interface QuestionModalProps {
  question: Question;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, 
  isCompleted, 
  onClose, 
  onComplete 
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 mx-4">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-2xl pr-8">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="line-clamp-2">{question.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Question Details */}
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-sm ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {question.topic}
              </Badge>
              <Badge variant="outline" className="text-sm border-gray-300">
                Day {question.day}
              </Badge>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Problem Description</h3>
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                {question.description}
              </p>
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Practice Links:</h3>
            <div className="flex gap-4 flex-wrap">
              {question.leetcodeUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(question.leetcodeUrl, '_blank')}
                  className="flex items-center gap-2 border-2 border-orange-200 hover:border-orange-400 text-orange-700 hover:bg-orange-50 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  Solve on LeetCode
                </Button>
              )}
              {question.gfgUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(question.gfgUrl, '_blank')}
                  className="flex items-center gap-2 border-2 border-green-200 hover:border-green-400 text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  Solve on GeeksforGeeks
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200 sticky bottom-0 bg-white">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="px-6 py-2 hover:bg-gray-50 transition-colors"
            >
              Close
            </Button>
            
            {!isCompleted ? (
              <Button 
                onClick={onComplete} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Star className="h-4 w-4" />
                Mark as Completed
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};