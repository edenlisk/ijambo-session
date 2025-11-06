import React, { useEffect, useState } from 'react';
import { api } from '@/services/api.ts';
import type {QuizWithDetails, QuizRanking, QuizAttempt} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Trophy, TrendingUp, Users, Target, Clock, CheckCircle2, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const QuizAnalytics: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [rankings, setRankings] = useState<QuizRanking[]>([]);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      loadQuizData(selectedQuizId);
    }
  }, [selectedQuizId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await api.quizzes.getAll(false);
      setQuizzes(data);
      if (data.length > 0) {
        setSelectedQuizId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizData = async (quizId: number) => {
    try {
      setLoading(true);
      // Get attempts summary for the quiz
      const attemptsData = await api.quizAttempts.getSummaryByQuizId(quizId);
      
      // Filter completed attempts only
      const completedAttempts = attemptsData.filter(a => a.status === 'COMPLETED');
      
      // Create rankings from completed attempts (sorted by score desc)
      const sortedAttempts = [...completedAttempts].sort((a, b) => (b.score || 0) - (a.score || 0));
      const rankingsData: QuizRanking[] = sortedAttempts.map((attempt, index) => {
        // Create user object from attempt data if not present
        const user = attempt.user || {
          id: attempt.userId,
          firstName: attempt.userFullName?.split(' ')[0] || '',
          lastName: attempt.userFullName?.split(' ').slice(1).join(' ') || '',
          username: attempt.username,
          email: '',
          phoneNumber: '',
          role: 'USER' as any,
          active: true,
          softDeleted: false,
          verified: true,
          loginAttempts: 0,
          createdAt: '',
          updatedAt: ''
        };

        return {
          rank: index + 1,
          attempt: attempt as any,
          user: user,
          score: attempt.score || 0,
          correctAnswers: attempt.correctAnswers || 0,
          totalQuestions: attempt.totalQuestions || 0,
          passed: attempt.passed || false
        };
      });
      
      setRankings(rankingsData);
      setAllAttempts(completedAttempts as any);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      toast.error('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  const getStatistics = () => {
    if (!allAttempts.length) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        averageTime: 0
      };
    }

    const totalAttempts = allAttempts.length;
    const totalScore = allAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    const passedCount = allAttempts.filter(a => a.passed).length;
    const passRate = Math.round((passedCount / totalAttempts) * 100);
    
    // Calculate average time (if available)
    const attemptsWithTime = allAttempts.filter(a => a.startedAt && a.completedAt);
    let averageTime = 0;
    if (attemptsWithTime.length > 0) {
      const totalTime = attemptsWithTime.reduce((sum, a) => {
        const start = new Date(a.startedAt).getTime();
        const end = new Date(a.completedAt!).getTime();
        return sum + (end - start);
      }, 0);
      averageTime = Math.round(totalTime / attemptsWithTime.length / 1000 / 60); // in minutes
    }

    return { totalAttempts, averageScore, passRate, averageTime };
  };

  const stats = getStatistics();

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500"><Trophy className="w-3 h-3 mr-1" /> 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400"><Award className="w-3 h-3 mr-1" /> 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600"><Award className="w-3 h-3 mr-1" /> 3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  const getScoreBadge = (score: number, passed: boolean) => {
    if (passed) {
      return <Badge className="bg-green-600">{score}%</Badge>;
    }
    return <Badge variant="destructive">{score}%</Badge>;
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Quiz Analytics</h1>
          <p className="text-gray-600">View quiz results, rankings, and performance metrics</p>
        </div>
      </div>

      {/* Quiz Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Quiz</CardTitle>
          <CardDescription>Choose a quiz to view its analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedQuizId?.toString()}
            onValueChange={(value) => setSelectedQuizId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id.toString()}>
                  {quiz.title} - {quiz.topicTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedQuiz && (
        <>
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedQuiz.title}</CardTitle>
              <CardDescription>{selectedQuiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{selectedQuiz.durationMinutes} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="font-semibold">{selectedQuiz.questionCount || selectedQuiz.totalQuestions || selectedQuiz.questions?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passing Score</p>
                    <p className="font-semibold">{selectedQuiz.passingScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Attempts</p>
                    <p className="font-semibold">{stats.totalAttempts}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{stats.totalAttempts}</div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{stats.averageScore}%</div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{stats.passRate}%</div>
                  <CheckCircle2 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg. Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{stats.averageTime} min</div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Rankings and All Attempts */}
          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="attempts">All Attempts</TabsTrigger>
            </TabsList>

            {/* Rankings Tab */}
            <TabsContent value="rankings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Leaderboard for {selectedQuiz.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  {rankings.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No attempts yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Rank</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Correct/Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankings.map((ranking) => (
                          <TableRow key={ranking.attempt.id}>
                            <TableCell>{getRankBadge(ranking.rank)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {ranking.user.firstName[0]}{ranking.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {ranking.user.firstName} {ranking.user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">@{ranking.user.username}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getScoreBadge(ranking.score, ranking.attempt.passed || false)}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{ranking.correctAnswers}</span> / {ranking.totalQuestions}
                            </TableCell>
                            <TableCell>
                              {ranking.attempt.passed ? (
                                <Badge className="bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" /> Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {ranking.attempt.completedAt
                                ? format(new Date(ranking.attempt.completedAt), 'MMM dd, yyyy HH:mm')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Attempts Tab */}
            <TabsContent value="attempts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Attempts</CardTitle>
                  <CardDescription>Complete history of quiz attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  {allAttempts.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No attempts yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started At</TableHead>
                          <TableHead>Completed At</TableHead>
                          <TableHead>Time Taken</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allAttempts.map((attempt) => {
                          const timeTaken = attempt.startedAt && attempt.completedAt
                            ? Math.round((new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000 / 60)
                            : null;

                          // Get user name parts
                          const firstName = attempt.user?.firstName || attempt.userFullName?.split(' ')[0] || '';
                          const lastName = attempt.user?.lastName || attempt.userFullName?.split(' ').slice(1).join(' ') || '';
                          const username = attempt.user?.username || '';

                          return (
                            <TableRow key={attempt.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {firstName[0]}{lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {firstName} {lastName}
                                    </p>
                                    {username && <p className="text-sm text-gray-600">@{username}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {attempt.score !== undefined
                                  ? getScoreBadge(attempt.score, attempt.passed || false)
                                  : <Badge variant="outline">N/A</Badge>}
                              </TableCell>
                              <TableCell>
                                {attempt.status === 'COMPLETED' ? (
                                  attempt.passed ? (
                                    <Badge className="bg-green-600">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      <XCircle className="w-3 h-3 mr-1" /> Failed
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary">{attempt.status}</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(attempt.startedAt), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                {attempt.completedAt
                                  ? format(new Date(attempt.completedAt), 'MMM dd, yyyy HH:mm')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {timeTaken ? `${timeTaken} min` : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
