import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '@/services/api.ts';
import type {QuizAttempt} from '@/types';
import {Card, CardContent, CardHeader, CardTitle} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Badge} from '../../components/ui/badge';
import {Separator} from '../../components/ui/separator';
import {Avatar, AvatarFallback} from '../../components/ui/avatar';
import {ArrowLeft, Trophy, Clock, CheckCircle2, XCircle, User as UserIcon, Mail, Calendar} from 'lucide-react';
import {toast} from 'sonner';
import {format} from 'date-fns';

export const UserResultDetail: React.FC = () => {
    const {quizId, attemptId} = useParams<{ quizId: string; attemptId: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttempt();
    }, [attemptId]);

    const loadAttempt = async () => {
        try {
            setLoading(true);
            const data = await api.quizAttempts.getById(parseInt(attemptId!));
            console.log('new data', data)
            setAttempt(data);
        } catch (error) {
            console.error('Failed to load attempt:', error);
            toast.error('Failed to load user result');
            navigate(`/admin/quiz/${quizId}/results`);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (startedAt: string, completedAt?: string) => {
        if (!completedAt) return 'N/A';
        const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
        const minutes = Math.floor(duration / 1000 / 60);
        const seconds = Math.floor((duration / 1000) % 60);
        return `${minutes}m ${seconds}s`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!attempt) return null;

    const userAnswers = attempt.userAnswers || [];
    const correctAnswers = userAnswers?.filter(ua => ua.correct).length;
    const totalQuestions = userAnswers?.length;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quiz/${quizId}/results`)}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Results
                </Button>
            </div>

            {/* User Info Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-xl">
                                {attempt.user?.firstName?.[0]}{attempt.user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-2xl mb-1">
                                {attempt.user?.firstName} {attempt.user?.lastName}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4"/>
                                    {attempt.user?.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4"/>
                                    @{attempt.user?.username}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quiz Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{attempt?.quizTitle}</CardTitle>
                    <p className="text-sm text-gray-600">{attempt.quiz?.description}</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Topic</p>
                            <p className="font-medium">{attempt.quiz?.topicTitle || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{attempt.quiz?.durationMinutes} minutes</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Passing Score</p>
                            <p className="font-medium">{attempt.quiz?.passingScore}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Questions</p>
                            <p className="font-medium">{totalQuestions}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Trophy
                            className={`w-10 h-10 mx-auto mb-2 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}/>
                        <p className="text-3xl mb-1">{attempt.score || 0}%</p>
                        <p className="text-sm text-gray-600">Final Score</p>
                        {attempt.passed ? (
                            <Badge className="mt-2 bg-green-600">Passed</Badge>
                        ) : (
                            <Badge className="mt-2 bg-red-600">Failed</Badge>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2"/>
                        <p className="text-3xl mb-1">{correctAnswers}</p>
                        <p className="text-sm text-gray-600">Correct Answers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 text-center">
                        <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2"/>
                        <p className="text-3xl mb-1">{totalQuestions - correctAnswers}</p>
                        <p className="text-sm text-gray-600">Incorrect Answers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 text-center">
                        <Clock className="w-10 h-10 text-blue-600 mx-auto mb-2"/>
                        <p className="text-3xl mb-1">{formatTime(attempt.startedAt, attempt.completedAt)}</p>
                        <p className="text-sm text-gray-600">Time Taken</p>
                    </CardContent>
                </Card>
            </div>

            {/* Submission Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400"/>
                            <span className="text-gray-600">Started:</span>
                            <span className="font-medium">
                {format(new Date(attempt.startedAt), 'MMM dd, yyyy HH:mm:ss')}
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400"/>
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium">
                {attempt.completedAt
                    ? format(new Date(attempt.completedAt), 'MMM dd, yyyy HH:mm:ss')
                    : 'Not completed'}
              </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question-by-Question Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Question-by-Question Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {userAnswers.map((userAnswer, index) => {
                            const question = userAnswer.question;
                            if (!question) return null;
                            const selectedAnswer = userAnswer.selectedAnswerId;



                            return (
                                <div key={userAnswer.id}>
                                    {index > 0 && <Separator className="my-6"/>}

                                    <div className="space-y-4">
                                        {/* Question Header */}
                                        <div className="flex items-start gap-3">
                                            <Badge variant={userAnswer.correct ? 'default' : 'destructive'}
                                                   className="mt-1 shrink-0">
                                                Q{index + 1}
                                            </Badge>
                                            <div className="flex-1">
                                                <p className="text-sm mb-2">{question.questionText}</p>
                                                {question.explanation && (
                                                    <p className="text-xs text-gray-600 italic">
                                                        💡 {question.explanation}
                                                    </p>
                                                )}
                                            </div>
                                            {userAnswer.correct ? (
                                                <div className="flex items-center gap-1 text-green-600 shrink-0">
                                                    <CheckCircle2 className="w-5 h-5"/>
                                                    <span className="text-sm font-medium">Correct</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-red-600 shrink-0">
                                                    <XCircle className="w-5 h-5"/>
                                                    <span className="text-sm font-medium">Incorrect</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Answer Options */}
                                        <div className="ml-12 space-y-2">
                                            {question.answers?.map((answer) => {
                                                const isCorrect = answer.correct;
                                                const isSelected = selectedAnswer === answer.id;

                                                let bgColor = 'bg-white border-gray-200';
                                                let textColor = 'text-gray-700';

                                                if (isCorrect) {
                                                    bgColor = 'bg-green-50 border-green-500';
                                                    textColor = 'text-green-900';
                                                } else if (isSelected && !isCorrect) {
                                                    bgColor = 'bg-red-50 border-red-500';
                                                    textColor = 'text-red-900';
                                                }

                                                return (
                                                    <div
                                                        key={answer.id}
                                                        className={`p-3 rounded-lg border-2 ${bgColor}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isCorrect && (
                                                                <CheckCircle2
                                                                    className="w-4 h-4 text-green-600 shrink-0"/>
                                                            )}
                                                            {isSelected && !isCorrect && (
                                                                <XCircle className="w-4 h-4 text-red-600 shrink-0"/>
                                                            )}
                                                            <span className={`text-sm flex-1 ${textColor}`}>
                                {answer.answerText}
                              </span>
                                                            {isCorrect && (
                                                                <Badge variant="outline"
                                                                       className="text-xs bg-green-100 text-green-700 border-green-300">
                                                                    Correct Answer
                                                                </Badge>
                                                            )}
                                                            {isSelected && !isCorrect && (
                                                                <Badge variant="outline"
                                                                       className="text-xs bg-red-100 text-red-700 border-red-300">
                                                                    User's Answer
                                                                </Badge>
                                                            )}
                                                            {isSelected && isCorrect && (
                                                                <Badge variant="outline"
                                                                       className="text-xs bg-green-100 text-green-700 border-green-300">
                                                                    User's Answer ✓
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Points Info */}
                                        <div className="ml-12 text-sm text-gray-600">
                                            Points earned: <span
                                            className="font-medium">{userAnswer.pointsEarned} / {question.points}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
