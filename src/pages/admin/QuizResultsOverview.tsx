import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { QuizWithDetails } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Search, Calendar, Users, TrendingUp, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const QuizResultsOverview: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quizStats, setQuizStats] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchQuery, statusFilter, quizzes]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await api.quizzes.getAll(false);
      setQuizzes(data);
      
      // Load stats for each quiz
      const statsMap = new Map();
      for (const quiz of data) {
        const attempts = await api.quizAttempts.getSummaryByQuizId(quiz.id);
        const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
        const totalAttempts = completedAttempts.length;
        const averageScore = totalAttempts > 0
          ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts)
          : 0;
        const passCount = completedAttempts.filter(a => a.passed).length;
        const passRate = totalAttempts > 0
          ? Math.round((passCount / totalAttempts) * 100)
          : 0;

        statsMap.set(quiz.id, {
          totalAttempts,
          averageScore,
          passRate,
          passCount,
          failCount: totalAttempts - passCount
        });
      }
      setQuizStats(statsMap);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.topicTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quiz => {
        const status = getQuizStatus(quiz);
        return status === statusFilter;
      });
    }

    setFilteredQuizzes(filtered);
  };

  const getQuizStatus = (quiz: QuizWithDetails): string => {
    const now = new Date();
    const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
    const endTime = quiz.endTime ? new Date(quiz.endTime) : null;

    if (!quiz.active) return 'inactive';
    if (startTime && now < startTime) return 'upcoming';
    if (endTime && now > endTime) return 'expired';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-600">Active</Badge>,
      upcoming: <Badge className="bg-blue-600">Upcoming</Badge>,
      expired: <Badge variant="secondary">Expired</Badge>,
      inactive: <Badge variant="outline">Inactive</Badge>
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const viewQuizResults = (quizId: number) => {
    navigate(`/admin/quiz/${quizId}/results`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Quiz Results Overview</h1>
          <p className="text-gray-600">View and analyze quiz performance across all quizzes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quizzes ({filteredQuizzes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No quizzes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-center">Pass Rate</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz) => {
                    const stats = quizStats.get(quiz.id) || {
                      totalAttempts: 0,
                      averageScore: 0,
                      passRate: 0
                    };
                    const status = getQuizStatus(quiz);

                    return (
                      <TableRow key={quiz.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {quiz.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{quiz.topicTitle || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {quiz.startTime && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(quiz.startTime), 'MMM dd, yyyy')}
                              </div>
                            )}
                            {quiz.endTime && (
                              <div className="text-xs text-gray-500">
                                to {format(new Date(quiz.endTime), 'MMM dd, yyyy')}
                              </div>
                            )}
                            {!quiz.startTime && !quiz.endTime && (
                              <span className="text-gray-400">No schedule</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{stats.totalAttempts}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span>{stats.averageScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              stats.passRate >= 75
                                ? 'bg-green-600'
                                : stats.passRate >= 50
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                            }
                          >
                            {stats.passRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => viewQuizResults(quiz.id)}
                            disabled={stats.totalAttempts === 0}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
