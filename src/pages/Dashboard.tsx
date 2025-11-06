import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../services/api';
import { Topic, QuizDto, UserRole, QuizAttemptSummaryDto } from '../types';
import { 
  BookOpen, ClipboardList, Plus, Users, TrendingUp, Trophy,
  Clock, Calendar, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [latestTopics, setLatestTopics] = useState<Topic[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<QuizDto[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttemptSummaryDto[]>([]);
  const [stats, setStats] = useState({
    totalTopics: 0,
    availableQuizzes: 0,
    completedQuizzes: 0,
    passedQuizzes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load topics and quizzes
      const [topics, quizzes] = await Promise.all([
        api.topics.getAll(true), // Get active topics only
        api.quizzes.getAll(true) // Get active quizzes only
      ]);

      // Get topics from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTopics = topics.filter((t: Topic) => new Date(t.createdAt) > sevenDaysAgo);
      setLatestTopics(recentTopics);

      // Get upcoming and active quizzes (not expired)
      const relevantQuizzes = quizzes.filter((q: QuizDto) => {
        if (!q.endTime) return true; // No end time means always available
        const endTime = new Date(q.endTime);
        return !isPast(endTime);
      }).sort((a: QuizDto, b: QuizDto) => {
        const aStart = a.startTime ? new Date(a.startTime).getTime() : Date.now();
        const bStart = b.startTime ? new Date(b.startTime).getTime() : Date.now();
        return aStart - bStart;
      });
      setUpcomingQuizzes(relevantQuizzes);
      
      // Load user-specific stats if user exists
      if (user) {
        try {
          const attempts = await api.quizAttempts.getSummaryByUserId(user.id);
          const completedAttempts = attempts.filter((a: QuizAttemptSummaryDto) => a.status === 'COMPLETED');
          const passedAttempts = completedAttempts.filter((a: QuizAttemptSummaryDto) => a.passed);
          
          // Get recent attempts (last 5)
          const recent = completedAttempts
            .sort((a: QuizAttemptSummaryDto, b: QuizAttemptSummaryDto) => {
              const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
              const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
              return bTime - aTime;
            })
            .slice(0, 5);
          
          setRecentAttempts(recent);
          setStats({
            totalTopics: topics.length,
            availableQuizzes: relevantQuizzes.length,
            completedQuizzes: completedAttempts.length,
            passedQuizzes: passedAttempts.length
          });
        } catch (error) {
          console.log('Failed to load user stats:', error);
          // Set basic stats even if user stats fail
          setStats({
            totalTopics: topics.length,
            availableQuizzes: relevantQuizzes.length,
            completedQuizzes: 0,
            passedQuizzes: 0
          });
        }
      } else {
        setStats({
          totalTopics: topics.length,
          availableQuizzes: relevantQuizzes.length,
          completedQuizzes: 0,
          passedQuizzes: 0
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatusInfo = (quiz: QuizDto) => {
    const now = new Date();
    
    if (!quiz.active) {
      return {
        status: 'inactive',
        label: 'Inactive',
        color: 'bg-gray-100 text-gray-700',
        icon: AlertCircle
      };
    }
    
    if (quiz.startTime) {
      const startTime = new Date(quiz.startTime);
      if (isFuture(startTime)) {
        return {
          status: 'upcoming',
          label: 'Upcoming',
          color: 'bg-blue-100 text-blue-700',
          icon: Clock
        };
      }
    }
    
    if (quiz.endTime) {
      const endTime = new Date(quiz.endTime);
      if (isPast(endTime)) {
        return {
          status: 'expired',
          label: 'Expired',
          color: 'bg-gray-100 text-gray-700',
          icon: AlertCircle
        };
      }
    }
    
    return {
      status: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle2
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Role: <Badge variant="outline">{user?.role}</Badge>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/topics')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Topics</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalTopics}</p>
                  <p className="text-xs text-gray-500 mt-1">{latestTopics.length} new this week</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/quizzes')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Quizzes</p>
                  <p className="text-2xl font-bold mt-1">{stats.availableQuizzes}</p>
                  <p className="text-xs text-gray-500 mt-1">Active now</p>
                </div>
                <ClipboardList className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          {user && (
            <>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/quizzes')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed Quizzes</p>
                      <p className="text-2xl font-bold mt-1">{stats.completedQuizzes}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.passedQuizzes} passed</p>
                    </div>
                    <Trophy className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/quizzes')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats.completedQuizzes > 0 
                          ? Math.round((stats.passedQuizzes / stats.completedQuizzes) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Success rate</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {hasRole([UserRole.MODERATOR, UserRole.ADMIN]) && (
            <>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/moderator/topics')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Manage Topics</p>
                      <p className="text-2xl mt-1"><Plus className="w-6 h-6" /></p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/moderator/quizzes')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Create Quiz</p>
                      <p className="text-2xl mt-1"><Plus className="w-6 h-6" /></p>
                    </div>
                    <ClipboardList className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {hasRole([UserRole.ADMIN]) && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Manage Users</p>
                    <p className="text-2xl mt-1"><Users className="w-6 h-6" /></p>
                  </div>
                  <Users className="w-10 h-10 text-red-600" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Latest Updates Section */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Latest Updates</h2>
          
          {/* Recent Quiz Attempts */}
          {user && recentAttempts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recent Quiz Results
                </CardTitle>
                <CardDescription>Your latest quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttempts.map(attempt => (
                    <div 
                      key={attempt.id} 
                      className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                        attempt.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                      onClick={() => navigate(`/quiz/${attempt.quizId}/result/${attempt.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{attempt.quizTitle}</h3>
                          <Badge className={attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {attempt.passed ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1" /> Passed</>
                            ) : (
                              <><AlertCircle className="w-3 h-3 mr-1" /> Not Passed</>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Score: {attempt.score !== undefined ? Math.round(attempt.score) : 0}%
                          </span>
                          {attempt.completedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/quizzes')}
                >
                  View All Results
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* New Topics */}
          {latestTopics.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  New Topics Added
                </CardTitle>
                <CardDescription>Topics added in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestTopics.map(topic => (
                    <div 
                      key={topic.id} 
                      className="flex items-start justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => navigate(`/topics/${topic.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="text-sm">{topic.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {topic.resourceCount || 0} resources
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            {topic.quizCount || 0} quizzes
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Quizzes */}
          {upcomingQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Upcoming & Active Quizzes
                </CardTitle>
                <CardDescription>Quizzes available for you to take</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingQuizzes.map(quiz => {
                    const statusInfo = getQuizStatusInfo(quiz);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div 
                        key={quiz.id} 
                        className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm">{quiz.title}</h3>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{quiz.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quiz.durationMinutes} min
                            </span>
                            {(quiz.startTime || quiz.endTime) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {statusInfo.status === 'upcoming' && quiz.startTime && (
                                  <>Starts: {format(new Date(quiz.startTime), 'MMM dd, HH:mm')}</>
                                )}
                                {statusInfo.status !== 'upcoming' && quiz.endTime && (
                                  <>Ends: {format(new Date(quiz.endTime), 'MMM dd, HH:mm')}</>
                                )}
                              </span>
                            )}
                            <span>{quiz.questionCount || 0} questions</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {latestTopics.length === 0 && upcomingQuizzes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent updates</p>
                <p className="text-sm text-gray-500 mt-1">Check back later for new topics and quizzes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
