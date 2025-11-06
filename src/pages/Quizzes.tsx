import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { QuizDto, QuizAttemptSummaryDto } from '@/types';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ClipboardList, Search, Clock, Calendar, Award, ChevronRight, CheckCircle2, AlertCircle, Trophy, Eye } from 'lucide-react';
import { format, isFuture } from 'date-fns';
import { toast } from 'sonner';

export const Quizzes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<QuizAttemptSummaryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      // Get all active quizzes
      const data = await api.quizzes.getAll(true);
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCompletedAttempts = async () => {
    if (!user) return;
    
    try {
      setLoadingAttempts(true);
      const attempts = await api.quizAttempts.getSummaryByUserId(user.id);
      // Filter only completed attempts
      const completed = attempts.filter((a: QuizAttemptSummaryDto) => a.status === 'COMPLETED');
      setCompletedAttempts(completed);
    } catch (error) {
      console.error('Failed to load completed attempts:', error);
      // Don't show error toast, just log it
    } finally {
      setLoadingAttempts(false);
    }
  };

  const getQuizStatus = (quiz: QuizDto) => {
    const now = new Date();
    
    // Check if quiz is active
    if (!quiz.active) {
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: AlertCircle };
    }
    
    // Check timing if provided
    if (quiz.startTime) {
      const startTime = new Date(quiz.startTime);
      
      if (isFuture(startTime)) {
        return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: Clock };
      }
    }
    
    if (quiz.endTime) {
      const endTime = new Date(quiz.endTime);
      
      if (now > endTime) {
        return { status: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
      }
    }
    
    // Quiz is active and within time window (or no time restrictions)
    return { status: 'active', label: 'Active Now', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
  };

  const filterQuizzes = (quizzes: QuizDto[], query: string, filterStatus?: string) => {
    let filtered = quizzes;
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(lowerQuery) ||
        (quiz.description && quiz.description.toLowerCase().includes(lowerQuery)) ||
        (quiz.topicTitle && quiz.topicTitle.toLowerCase().includes(lowerQuery))
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(quiz => {
        const status = getQuizStatus(quiz).status;
        return status === filterStatus;
      });
    }

    return filtered;
  };

  const renderCompletedAttemptCard = (attempt: QuizAttemptSummaryDto) => {
    const passed = attempt.passed || false;
    const score = attempt.score !== undefined ? Math.round(attempt.score) : 0;

    return (
      <Card 
        key={attempt.id}
        className="hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
              passed ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${
                passed ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap mb-1">
                <h3 className="text-base sm:text-lg font-semibold">{attempt.quizTitle}</h3>
                <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {passed ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Passed</>
                  ) : (
                    <><AlertCircle className="w-3 h-3 mr-1" /> Not Passed</>
                  )}
                </Badge>
              </div>
              {attempt.completedAt && (
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Completed {format(new Date(attempt.completedAt), 'MMM dd, yyyy \u2022 HH:mm')}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  Score: {score}%
                </span>
                {attempt.totalPoints && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    {attempt.totalPoints} points
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/quiz/${attempt.quizId}/result/${attempt.id}`)}
                className="min-h-[36px]"
              >
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Results</span>
                <span className="sm:hidden">View</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuizCard = (quiz: QuizDto) => {
    const statusInfo = getQuizStatus(quiz);
    const StatusIcon = statusInfo.icon;

    return (
      <Card 
        key={quiz.id}
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/quiz/${quiz.id}`)}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap mb-1">
                <h3 className="text-base sm:text-lg font-semibold">{quiz.title}</h3>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
              {quiz.topicTitle && (
                <p className="text-xs sm:text-sm text-blue-600 mb-1">
                  {quiz.topicTitle}
                </p>
              )}
              {quiz.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {quiz.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {quiz.durationMinutes} min
                </span>
                {quiz.startTime && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {format(new Date(quiz.startTime), 'MMM dd, HH:mm')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
                  {quiz.questionCount || 0} questions
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  Pass: {quiz.passingScore}%
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 hidden sm:block" />
          </div>
        </CardContent>
      </Card>
    );
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Quizzes</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
          if (value === 'results' && completedAttempts.length === 0) {
            loadCompletedAttempts();
          }
        }}>
          <TabsList className="w-full sm:w-auto grid grid-cols-5 mb-2">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="expired" className="text-xs sm:text-sm">Past</TabsTrigger>
            <TabsTrigger value="results" className="text-xs sm:text-sm">My Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filterQuizzes(quizzes, searchQuery).map(quiz => renderQuizCard(quiz))}
              {filterQuizzes(quizzes, searchQuery).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quizzes found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <div className="space-y-4">
              {filterQuizzes(quizzes, searchQuery, 'active').map(quiz => renderQuizCard(quiz))}
              {filterQuizzes(quizzes, searchQuery, 'active').length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active quizzes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            <div className="space-y-4">
              {filterQuizzes(quizzes, searchQuery, 'upcoming').map(quiz => renderQuizCard(quiz))}
              {filterQuizzes(quizzes, searchQuery, 'upcoming').length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming quizzes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="expired" className="mt-6">
            <div className="space-y-4">
              {filterQuizzes(quizzes, searchQuery, 'expired').map(quiz => renderQuizCard(quiz))}
              {filterQuizzes(quizzes, searchQuery, 'expired').length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No past quizzes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            {loadingAttempts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {completedAttempts.length > 0 ? (
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      Showing {completedAttempts.length} completed quiz{completedAttempts.length > 1 ? 'zes' : ''}
                    </div>
                    {completedAttempts.map(attempt => renderCompletedAttemptCard(attempt))}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No completed quizzes yet</p>
                      <p className="text-sm text-gray-500 mt-1">Complete a quiz to see your results here</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
