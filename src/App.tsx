import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { Toaster } from '@/components/ui/toaster';
import { Code, BookOpen, Target, Zap, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = ({ onAuthClick }: { onAuthClick: () => void }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                DSA Practice Tracker
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Master Data Structures & Algorithms with our structured 30-day program. 
              Track your progress, reflect on learnings, and build consistent practice habits.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 max-w-4xl mx-auto">
            <Card className="border border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">120</h3>
                <p className="text-sm text-gray-600">Curated Questions</p>
              </CardContent>
            </Card>
            
            <Card className="border border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">30</h3>
                <p className="text-sm text-gray-600">Days Program</p>
              </CardContent>
            </Card>
            
            <Card className="border border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">4</h3>
                <p className="text-sm text-gray-600">Questions Daily</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-8 max-w-6xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Structured Learning</h3>
              <p className="text-xs text-gray-600">
                Carefully selected problems covering all essential DSA topics with optimal difficulty progression.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Daily Practice</h3>
              <p className="text-xs text-gray-600">
                Solve 4 questions daily with streak tracking to build consistent programming habits.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Learning Reflections</h3>
              <p className="text-xs text-gray-600">
                Capture insights and discoveries after each problem to enhance understanding.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <Trophy className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Progress Tracking</h3>
              <p className="text-xs text-gray-600">
                Monitor your daily progress, maintain streaks, and track time spent on each problem.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <Code className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Multiple Platforms</h3>
              <p className="text-xs text-gray-600">
                Direct links to LeetCode and GeeksforGeeks for seamless practice experience.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4 text-pink-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-gray-900">Streak Motivation</h3>
              <p className="text-xs text-gray-600">
                Build and maintain daily streaks to stay motivated throughout your DSA journey.
              </p>
            </div>
          </div>

          {/* Study Plan Overview */}
          <Card className="border border-gray-200 max-w-5xl mx-auto">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">30-Day Study Plan Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { week: 1, focus: "Arrays + Basic Math + Prefix", color: "bg-blue-50 border-blue-200" },
                  { week: 2, focus: "Hashing + Sliding Window + 2 Pointers", color: "bg-green-50 border-green-200" },
                  { week: 3, focus: "Binary Search + Matrix + Recursion", color: "bg-purple-50 border-purple-200" },
                  { week: 4, focus: "Linked List + Stack/Queue + Strings", color: "bg-orange-50 border-orange-200" },
                  { week: 5, focus: "Trees + Graphs + Greedy + DP Intro", color: "bg-indigo-50 border-indigo-200" },
                  { week: 6, focus: "Dynamic Programming + Mixed Topics", color: "bg-pink-50 border-pink-200" }
                ].map((topic, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${topic.color}`}>
                    <div className="font-bold text-sm text-gray-900 mb-1">Week {topic.week}</div>
                    <div className="text-xs text-gray-700">{topic.focus}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              onClick={onAuthClick}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your DSA Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Code className="h-5 w-5 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 text-sm">Loading your DSA journey...</p>
        </div>
      </div>
    );
  }

  const handleNavigation = (page: 'dashboard' | 'profile') => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onAuthClick={() => setShowAuthModal(true)} 
        currentPage={currentPage}
        onNavigate={user ? handleNavigation : undefined}
      />
      
      {user ? (
        <>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'profile' && <ProfilePage />}
        </>
      ) : (
        <LandingPage onAuthClick={() => setShowAuthModal(true)} />
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;