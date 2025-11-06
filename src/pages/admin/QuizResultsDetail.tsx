import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api.ts';
import type {QuizWithDetails, QuizAttempt} from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Trophy, Clock, CheckCircle2, XCircle, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const QuizResultsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizWithDetails | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadQuizResults();
  }, [id]);

  useEffect(() => {
    sortAttempts();
  }, [sortBy, sortOrder]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const [quizData, attemptsData] = await Promise.all([
        api.quizzes.getById(parseInt(id!)),
        api.quizAttempts.getSummaryByQuizId(parseInt(id!))
      ]);

      // Filter completed attempts only
      const completedAttempts = attemptsData.filter(a => a.status === 'COMPLETED');

      setQuiz(quizData);
      setAttempts(completedAttempts);
    } catch (error) {
      console.error('Failed to load quiz results:', error);
      toast.error('Failed to load quiz results');
      navigate('/admin/quiz-results');
    } finally {
      setLoading(false);
    }
  };

  const sortAttempts = () => {
    const sorted = [...attempts].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'score') {
        comparison = (a.score || 0) - (b.score || 0);
      } else if (sortBy === 'time') {
        const timeA = a.startedAt && a.completedAt
          ? new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()
          : 0;
        const timeB = b.startedAt && b.completedAt
          ? new Date(b.completedAt).getTime() - new Date(b.startedAt).getTime()
          : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'date') {
        comparison = new Date(a.completedAt || a.startedAt).getTime() - 
                     new Date(b.completedAt || b.startedAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setAttempts(sorted);
  };

  const getStatistics = () => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        averageTime: 0
      };
    }

    const scores = attempts.map(a => a.score || 0);
    const totalAttempts = attempts.length;
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / totalAttempts);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passedCount = attempts.filter(a => a.passed).length;
    const passRate = Math.round((passedCount / totalAttempts) * 100);

    const attemptsWithTime = attempts.filter(a => a.startedAt && a.completedAt);
    let averageTime = 0;
    if (attemptsWithTime.length > 0) {
      const totalTime = attemptsWithTime.reduce((sum, a) => {
        const start = new Date(a.startedAt).getTime();
        const end = new Date(a.completedAt!).getTime();
        return sum + (end - start);
      }, 0);
      averageTime = Math.round(totalTime / attemptsWithTime.length / 1000 / 60);
    }

    return { totalAttempts, averageScore, highestScore, lowestScore, passRate, averageTime };
  };

  const formatTime = (startedAt: string, completedAt?: string) => {
    if (!completedAt) return 'N/A';
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor((duration / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  const exportToCSV = () => {
    if (attempts.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Score (%)', 'Points', 'Pass/Fail', 'Time Taken', 'Submitted At'];
    const rows = attempts.map(attempt => [
      `${attempt.user?.firstName || ''} ${attempt.user?.lastName || ''}`,
      attempt.user?.email || '',
      attempt.score || 0,
      `${attempt.correctAnswers || 0}/${attempt.totalQuestions || quiz?.questionCount || 0}`,
      attempt.passed ? 'Pass' : 'Fail',
      formatTime(attempt.startedAt, attempt.completedAt),
      attempt.completedAt ? format(new Date(attempt.completedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz?.title.replace(/\s+/g, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Results exported successfully');
  };

  const viewUserResult = (attemptId: number) => {
    navigate(`/admin/quiz/${id}/result/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) return null;

  const stats = getStatistics();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/quiz-results')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl mb-1">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>
        <Button onClick={exportToCSV} disabled={attempts.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Topic</p>
              <p className="font-medium">{quiz.topicTitle || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{quiz.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="font-medium">{quiz.questionCount || quiz.totalQuestions || quiz.questions?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="font-medium">{quiz.passingScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl">{stats.totalAttempts}</p>
            <p className="text-sm text-gray-600">Total Attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl">{stats.averageScore}%</p>
            <p className="text-sm text-gray-600">Average Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl">{stats.highestScore}%</p>
            <p className="text-sm text-gray-600">Highest Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl">{stats.lowestScore}%</p>
            <p className="text-sm text-gray-600">Lowest Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl">{stats.passRate}%</p>
            <p className="text-sm text-gray-600">Pass Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl">{stats.averageTime}m</p>
            <p className="text-sm text-gray-600">Avg Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Participant Results</CardTitle>
              <CardDescription>Detailed results for each participant</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'time' | 'date')}
              >
                <option value="score">Sort by Score</option>
                <option value="time">Sort by Time</option>
                <option value="date">Sort by Date</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attempts yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => {
                      const firstName = attempt.user?.firstName || attempt.userFullName?.split(' ')[0] || '';
                      const lastName = attempt.user?.lastName || attempt.userFullName?.split(' ').slice(1).join(' ') || '';
                      const email = attempt.user?.email || '';

                      return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {firstName} {lastName}
                            </p>
                            {email && <p className="text-sm text-gray-600">{email}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              (attempt.score || 0) >= quiz.passingScore
                                ? 'bg-green-600'
                                : 'bg-red-600'
                            }
                          >
                            {attempt.score || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {attempt.correctAnswers || 0} / {attempt.totalQuestions || quiz.questionCount || 0}
                        </TableCell>
                        <TableCell>{formatTime(attempt.startedAt, attempt.completedAt)}</TableCell>
                        <TableCell>
                          {attempt.completedAt
                            ? format(new Date(attempt.completedAt), 'MMM dd, yyyy HH:mm')
                            : 'Not completed'}
                        </TableCell>
                        <TableCell>
                          {attempt.passed ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => viewUserResult(attempt.id)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {attempts.map((attempt) => {
                  const firstName = attempt.user?.firstName || attempt.userFullName?.split(' ')[0] || '';
                  const lastName = attempt.user?.lastName || attempt.userFullName?.split(' ').slice(1).join(' ') || '';
                  const email = attempt.user?.email || '';

                  return (
                  <Card key={attempt.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {firstName} {lastName}
                            </p>
                            {email && <p className="text-sm text-gray-600">{email}</p>}
                          </div>
                          <Badge
                            className={
                              (attempt.score || 0) >= quiz.passingScore
                                ? 'bg-green-600'
                                : 'bg-red-600'
                            }
                          >
                            {attempt.score || 0}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Points</p>
                            <p className="font-medium">
                              {attempt.correctAnswers || 0} / {attempt.totalQuestions || quiz.questionCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Time</p>
                            <p className="font-medium">{formatTime(attempt.startedAt, attempt.completedAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          {attempt.passed ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                          <Button size="sm" onClick={() => viewUserResult(attempt.id)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
