import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {api} from '../services/api';
import type {QuizAttempt, QuizDto, QuestionDto, UserAnswer} from '@/types';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Separator} from '../components/ui/separator';
import {
    Trophy,
    Clock,
    CheckCircle2,
    XCircle,
    Home,
    RotateCcw,
    Award,
    Target,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import {toast} from 'sonner';
import {format} from 'date-fns';

export const QuizResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {id, attemptId} = useParams<{ id: string; attemptId?: string }>();
    const [attempt, setAttempt] = useState<QuizAttempt | null>(location.state?.attempt || null);
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (attemptId) {
            loadAttemptData(parseInt(attemptId));
        } else if (attempt && attempt.quizId) {
            loadQuizData(attempt.quizId, attempt.id);
        } else if (id) {
            // If only quiz ID provided, redirect to quiz page
            navigate(`/quiz/${id}`);
        }
    }, [attemptId, id]);

    const loadAttemptData = async (attemptIdNum: number) => {
        try {
            setLoading(true);

            // Load attempt with answers
            const attemptData = await api.quizAttempts.getByIdWithAnswers(attemptIdNum);
            setAttempt(attemptData);

            // Load quiz with questions
            const quizData = await api.quizzes.getByIdWithQuestions(attemptData.quizId!);
            setQuiz(quizData);
            setQuestions(quizData.questions || []);

            // Load user answers
            // `/api/user-answers/quiz-attempt/${quizAttemptId}`
            const answers = await api.userAnswers.getByQuizAttempt(attemptIdNum);
            setUserAnswers(answers);
        } catch (error) {
            console.error('Failed to load quiz results:', error);
            toast.error('Failed to load quiz results');
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const loadQuizData = async (quizId: number, attemptIdNum: number) => {
        try {
            setLoading(true);

            // Load quiz with questions
            const quizData = await api.quizzes.getByIdWithQuestions(quizId);
            setQuiz(quizData);
            setQuestions(quizData.questions || []);

            // Load user answers
            const answers = await api.userAnswers.getByQuizAttempt(attemptIdNum);
            setUserAnswers(answers);
        } catch (error) {
            console.error('Failed to load quiz data:', error);
            toast.error('Failed to load quiz data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!attempt || !quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600">No quiz results found</p>
                        <Button onClick={() => navigate('/quizzes')} className="mt-4">
                            Back to Quizzes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate statistics
    const correctAnswers = userAnswers.filter(a => a.correct).length;
    const incorrectAnswers = userAnswers.filter(a => !a.correct).length;
    const totalQuestions = questions.length;
    const answeredQuestions = userAnswers.length;
    const unansweredQuestions = totalQuestions - answeredQuestions;

    // Calculate points
    const pointsEarned = userAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const percentage = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    console.log('total points', totalPoints);
    console.log('points earned', pointsEarned);
    console.log('correct answers', correctAnswers);
    console.log('user answers', userAnswers)

    const passed = percentage >= quiz.passingScore;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const timeTaken = attempt.startedAt && attempt.completedAt
        ? Math.floor((new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000)
        : 0;

    // Helper to get user answer for a question
    const getUserAnswerForQuestion = (questionId: number) => {
        return userAnswers.find(ua => ua.questionId === questionId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Quiz Title */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{quiz.title}</h1>
                    {quiz.topicTitle && (
                        <p className="text-sm sm:text-base text-blue-600 mt-1">{quiz.topicTitle}</p>
                    )}
                    {attempt.completedAt && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Completed on {format(new Date(attempt.completedAt), 'PPpp')}
                        </p>
                    )}
                </div>

                {/* Results Header */}
                <Card className="mb-6">
                    <CardContent className="py-8">
                        <div className="text-center">
                            {passed ? (
                                <>
                                    <div
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="w-10 h-10 text-green-600"/>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">Congratulations!</h2>
                                    <p className="text-gray-600">You passed the quiz!</p>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="w-10 h-10 text-red-600"/>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">Not Passed</h2>
                                    <p className="text-gray-600">Keep practicing and try again!</p>
                                </>
                            )}

                            <div className="mt-6">
                                <div className="text-5xl sm:text-6xl font-bold text-gray-900">
                                    {percentage}%
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Your Score</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {pointsEarned} out of {totalPoints} points
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
                            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2"/>
                            <p className="text-xl sm:text-2xl font-semibold">{correctAnswers}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Correct</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
                            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mx-auto mb-2"/>
                            <p className="text-xl sm:text-2xl font-semibold">{incorrectAnswers}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Incorrect</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2"/>
                            <p className="text-xl sm:text-2xl font-semibold">{formatTime(timeTaken)}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Time Taken</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
                            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2"/>
                            <p className="text-xl sm:text-2xl font-semibold">{quiz.passingScore}%</p>
                            <p className="text-xs sm:text-sm text-gray-600">To Pass</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                {unansweredQuestions > 0 && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle className="w-5 h-5"/>
                                <p className="text-sm">
                                    <strong>{unansweredQuestions}</strong> question{unansweredQuestions > 1 ? 's' : ''} left
                                    unanswered
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Answer Review */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Detailed Review</CardTitle>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Review all questions with correct answers and explanations
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {questions.map((question, index) => {
                                const userAnswer = getUserAnswerForQuestion(question.id);
                                const correctAnswer = question.answers?.find(a => a.correct);
                                const selectedAnswer = userAnswer?.selectedAnswerId
                                    ? question.answers?.find(a => a.id === userAnswer.selectedAnswerId)
                                    : null;
                                const isCorrect = userAnswer?.correct || false;
                                const isAnswered = !!userAnswer;

                                return (
                                    <div key={question.id}>
                                        {index > 0 && <Separator className="my-6"/>}

                                        <div className="space-y-3">
                                            {/* Question Header */}
                                            <div className="flex items-start gap-3">
                                                <Badge
                                                    variant={isAnswered ? (isCorrect ? 'default' : 'destructive') : 'secondary'}
                                                    className="mt-1 flex-shrink-0"
                                                >
                                                    Q{index + 1}
                                                </Badge>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-medium">{question.questionText}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {question.points} point{question.points > 1 ? 's' : ''}
                                                        {isAnswered && (
                                                            <span className="ml-2">
                                • Earned: {userAnswer.pointsEarned || 0} point{(userAnswer.pointsEarned || 0) > 1 ? 's' : ''}
                              </span>
                                                        )}
                                                    </p>
                                                </div>
                                                {isAnswered ? (
                                                    isCorrect ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0"/>
                                                    )
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0"/>
                                                )}
                                            </div>

                                            {/* Answers */}
                                            <div className="ml-0 sm:ml-12 space-y-2">
                                                {question.answers?.map((answer) => {
                                                    const isThisCorrect = answer.correct;
                                                    const isThisSelected = selectedAnswer?.id === answer.id;

                                                    return (
                                                        <div
                                                            key={answer.id}
                                                            className={`p-3 rounded-lg border-2 transition-colors ${
                                                                isThisCorrect
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : isThisSelected
                                                                        ? 'border-red-500 bg-red-50'
                                                                        : 'border-gray-200 bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                {isThisCorrect && (
                                                                    <CheckCircle2
                                                                        className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/>
                                                                )}
                                                                {isThisSelected && !isThisCorrect && (
                                                                    <XCircle
                                                                        className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"/>
                                                                )}
                                                                <span
                                                                    className="text-sm flex-1">{answer.answerText}</span>
                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    {isThisCorrect && (
                                                                        <Badge variant="outline"
                                                                               className="text-xs bg-green-100 text-green-700 border-green-300">
                                                                            Correct Answer
                                                                        </Badge>
                                                                    )}
                                                                    {isThisSelected && (
                                                                        <Badge variant="outline"
                                                                               className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                                                            Your Choice
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation */}
                                            {question.explanation && !isCorrect && (
                                                <div
                                                    className="ml-0 sm:ml-12 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-xs sm:text-sm text-blue-900">
                                                        <strong className="font-semibold">💡
                                                            Explanation:</strong> {question.explanation}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Unanswered Message */}
                                            {!isAnswered && (
                                                <div
                                                    className="ml-0 sm:ml-12 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-xs sm:text-sm text-yellow-800">
                                                        ⚠️ This question was not answered
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 min-h-[44px]"
                    >
                        <Home className="w-4 h-4 mr-2"/>
                        Dashboard
                    </Button>
                    <Button
                        onClick={() => navigate('/quizzes')}
                        className="flex-1 min-h-[44px]"
                    >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        More Quizzes
                    </Button>
                </div>
            </div>
        </div>
    );
};
