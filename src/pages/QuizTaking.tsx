import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type {QuizDto, QuestionDto, QuizAttemptDto} from '@/types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Clock, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isFuture, isPast } from 'date-fns';

type QuizState = 'loading' | 'pre-quiz' | 'taking' | 'submitting' | 'completed';

// Track user answer IDs to enable updates
interface UserAnswerRecord {
    userAnswerId: number;
    selectedAnswerId: number;
}

export const QuizTaking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [state, setState] = useState<QuizState>('loading');
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [attempt, setAttempt] = useState<QuizAttemptDto | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Changed to track both answer ID and user answer record ID
    const [answers, setAnswers] = useState<Map<number, UserAnswerRecord>>(new Map());
    const [submittingAnswers, setSubmittingAnswers] = useState<Set<number>>(new Set());

    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [hasCompletedAttempt, setHasCompletedAttempt] = useState(false);
    const [completedAttemptId, setCompletedAttemptId] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            loadQuiz(parseInt(id));
        }
    }, [id]);

    useEffect(() => {
        if (state === 'taking' && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [state, timeRemaining]);

    const loadQuiz = async (quizId: number) => {
        try {
            setState('loading');

            // Check if user has any attempt for this quiz
            if (user) {
                try {
                    // First check for in-progress attempt
                    const inProgress = await api.quizAttempts.getInProgress(user.id, quizId);
                    if (inProgress) {
                        // Resume existing attempt
                        const quizWithQuestions = await api.quizzes.getByIdWithQuestions(quizId);
                        setQuiz(quizWithQuestions);
                        setQuestions(quizWithQuestions.questions || []);
                        setAttempt(inProgress);
                        setTimeRemaining(inProgress.remainingSeconds || 0);

                        // Load existing answers with user answer IDs
                        const userAnswers = await api.userAnswers.getByQuizAttempt(inProgress.id);
                        const answerMap = new Map<number, UserAnswerRecord>();
                        userAnswers.forEach((ua: any) => {
                            if (ua.questionId && ua.selectedAnswerId && ua.id) {
                                answerMap.set(ua.questionId, {
                                    userAnswerId: ua.id,
                                    selectedAnswerId: ua.selectedAnswerId
                                });
                            }
                        });
                        setAnswers(answerMap);

                        setState('taking');
                        toast.info('Resuming your quiz attempt...');
                        return;
                    }
                } catch (error) {
                    console.log('No in-progress attempt found:', error);
                }

                // Check if user has already completed this quiz
                try {
                    const userAttempts = await api.quizAttempts.getByUserAndQuiz(user.id, quizId);
                    const completedAttempt = userAttempts.find((a: any) => a.status === 'COMPLETED');

                    if (completedAttempt) {
                        setHasCompletedAttempt(true);
                        setCompletedAttemptId(completedAttempt.id);
                        const quizData = await api.quizzes.getById(quizId);
                        setQuiz(quizData);
                        setState('pre-quiz');
                        return;
                    }
                } catch (error) {
                    console.log('Error checking for completed attempts:', error);
                }
            }

            // Load quiz for preview
            const quizData = await api.quizzes.getById(quizId);
            setQuiz(quizData);
            setState('pre-quiz');
        } catch (error) {
            console.error('Failed to load quiz:', error);
            toast.error('Failed to load quiz');
            navigate('/quizzes');
        }
    };

    const handleStartQuiz = async () => {
        if (!quiz || !user) return;

        try {
            // Create quiz attempt
            const attemptData = await api.quizAttempts.create({
                quizId: quiz.id,
                userId: user.id
            });

            // Load quiz with questions
            const quizWithQuestions = await api.quizzes.getByIdWithQuestions(quiz.id);

            setQuiz(quizWithQuestions);
            setQuestions(quizWithQuestions.questions || []);
            setAttempt(attemptData);
            setTimeRemaining(attemptData.remainingSeconds || quiz.durationMinutes * 60);
            setState('taking');
            toast.success('Quiz started! Good luck!');
        } catch (error) {
            console.error('Failed to start quiz:', error);
            toast.error('Failed to start quiz');
        }
    };

    const handleAnswerSelect = async (questionId: number, answerId: number) => {
        if (!attempt) return;

        // Prevent multiple simultaneous submissions for the same question
        if (submittingAnswers.has(questionId)) {
            return;
        }

        // Check if user already answered this question
        const existingAnswer = answers.get(questionId);

        // Update local state immediately for better UX
        if (existingAnswer) {
            setAnswers(prev => new Map(prev).set(questionId, {
                userAnswerId: existingAnswer.userAnswerId,
                selectedAnswerId: answerId
            }));
        } else {
            // Temporarily set with placeholder ID
            setAnswers(prev => new Map(prev).set(questionId, {
                userAnswerId: -1, // Placeholder
                selectedAnswerId: answerId
            }));
        }

        // Mark as submitting
        setSubmittingAnswers(prev => new Set(prev).add(questionId));

        try {
            if (existingAnswer) {
                // UPDATE existing answer
                await api.userAnswers.update(existingAnswer.userAnswerId, {
                    selectedAnswerId: answerId
                });

                // Update local state with confirmed data
                setAnswers(prev => new Map(prev).set(questionId, {
                    userAnswerId: existingAnswer.userAnswerId,
                    selectedAnswerId: answerId
                }));
            } else {
                // SUBMIT new answer
                const response = await api.userAnswers.submit({
                    quizAttemptId: attempt.id,
                    questionId,
                    selectedAnswerId: answerId
                });

                // Update local state with the returned user answer ID
                setAnswers(prev => new Map(prev).set(questionId, {
                    userAnswerId: response.id,
                    selectedAnswerId: answerId
                }));
            }
        } catch (error: any) {
            console.error('Failed to save answer:', error);

            // Revert on error
            if (existingAnswer) {
                setAnswers(prev => new Map(prev).set(questionId, existingAnswer));
            } else {
                setAnswers(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(questionId);
                    return newMap;
                });
            }

            // Show error only for unexpected errors, not for duplicate submission errors
            if (!error.response?.data?.message?.includes('already submitted')) {
                toast.error('Failed to save answer. Please try again.');
            }
        } finally {
            // Remove from submitting set
            setSubmittingAnswers(prev => {
                const newSet = new Set(prev);
                newSet.delete(questionId);
                return newSet;
            });
        }
    };

    const handleNext = () => {
        if (questions && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const getUnansweredCount = () => {
        if (!questions) return 0;
        return questions.filter(q => !answers.has(q.id)).length;
    };

    const handleSubmitClick = () => {
        const unanswered = getUnansweredCount();
        if (unanswered > 0) {
            setShowSubmitDialog(true);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!quiz || !attempt) return;

        try {
            setState('submitting');
            setShowSubmitDialog(false);

            await api.quizAttempts.submit(attempt.id);

            setState('completed');
            toast.success('Quiz submitted successfully!');
            navigate(`/quiz/${quiz.id}/result/${attempt.id}`);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            toast.error('Failed to submit quiz');
            setState('taking');
        }
    };

    const handleAutoSubmit = async () => {
        toast.info('Time is up! Submitting quiz automatically...');
        await handleSubmit();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (!quiz) return 'text-green-600';
        const percentage = (timeRemaining / (quiz.durationMinutes * 60)) * 100;
        if (percentage > 50) return 'text-green-600';
        if (percentage > 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="py-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Quiz not found</p>
                        <Button onClick={() => navigate('/quizzes')} className="mt-4">
                            Back to Quizzes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Pre-Quiz Screen
    if (state === 'pre-quiz') {
        // If user has already completed this quiz
        if (hasCompletedAttempt) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl sm:text-2xl">{quiz.title}</CardTitle>
                            {quiz.description && (
                                <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center">
                                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
                                    Quiz Already Completed
                                </h3>
                                <p className="text-sm sm:text-base text-blue-800 mb-4">
                                    You have already completed this quiz. Only one attempt is allowed per quiz.
                                </p>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    You can view your results below.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                                    <p className="text-lg sm:text-xl font-semibold">{quiz.durationMinutes} min</p>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                                    <p className="text-lg sm:text-xl font-semibold">{quiz.questionCount || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm text-gray-600">Passing Score</p>
                                    <p className="text-lg sm:text-xl font-semibold">{quiz.passingScore}%</p>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm text-gray-600">Status</p>
                                    <p className="text-sm sm:text-base font-semibold text-green-600">Completed</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/quizzes')}
                                    className="flex-1 min-h-[44px]"
                                >
                                    Back to Quizzes
                                </Button>
                                <Button
                                    onClick={() => navigate(`/quiz/${quiz.id}/result/${completedAttemptId}`)}
                                    className="flex-1 min-h-[44px]"
                                >
                                    View Results
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        const isUpcoming = quiz.startTime && isFuture(new Date(quiz.startTime));
        const isExpired = quiz.endTime && isPast(new Date(quiz.endTime));
        const canStart = quiz.active && !isUpcoming && !isExpired;

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl sm:text-2xl">{quiz.title}</CardTitle>
                        {quiz.description && (
                            <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                                <p className="text-lg sm:text-xl font-semibold">{quiz.durationMinutes} min</p>
                            </div>
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                                <p className="text-lg sm:text-xl font-semibold">{quiz.questionCount || 0}</p>
                            </div>
                            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Passing Score</p>
                                <p className="text-lg sm:text-xl font-semibold">{quiz.passingScore}%</p>
                            </div>
                            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Available Until</p>
                                <p className="text-xs sm:text-sm font-semibold">{quiz.endTime ? format(new Date(quiz.endTime), 'MMM dd, HH:mm') : 'No limit'}</p>
                            </div>
                        </div>

                        {isUpcoming && quiz.startTime && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-yellow-800">Quiz starts {formatDistanceToNow(new Date(quiz.startTime), { addSuffix: true })}</p>
                            </div>
                        )}

                        {isExpired && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-red-800">This quiz has expired</p>
                            </div>
                        )}

                        {canStart && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                <p className="text-xs sm:text-sm font-semibold mb-2">
                                    ⚠️ Important:
                                </p>
                                <ul className="text-xs sm:text-sm space-y-1 ml-4 list-disc">
                                    <li>Once started, the timer begins immediately</li>
                                    <li>You cannot pause the quiz</li>
                                    <li>The quiz will auto-submit when time runs out</li>
                                    <li>Make sure you have a stable internet connection</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/quizzes')}
                                className="flex-1 min-h-[44px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStartQuiz}
                                disabled={!canStart}
                                className="flex-1 min-h-[44px]"
                            >
                                {canStart ? 'Start Quiz' : isUpcoming ? 'Not Started' : 'Not Available'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Quiz Taking Screen
    if (state === 'taking' || state === 'submitting') {
        if (!questions || questions.length === 0) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardContent className="py-12 text-center">
                            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No questions available for this quiz</p>
                            <Button onClick={() => navigate('/quizzes')} className="mt-4 min-h-[44px]">
                                Back to Quizzes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        const selectedAnswerRecord = answers.get(currentQuestion.id);
        const selectedAnswer = selectedAnswerRecord?.selectedAnswerId;

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Fixed Top Bar */}
                <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${getTimerColor()}`} />
                                <span className={`text-base sm:text-xl font-semibold ${getTimerColor()}`}>
                  {formatTime(timeRemaining)}
                </span>
                            </div>
                            <div className="text-xs sm:text-sm">
                                Question <strong>{currentQuestionIndex + 1}</strong> / {questions.length}
                            </div>
                            <Button
                                onClick={handleSubmitClick}
                                size="sm"
                                variant="default"
                                disabled={state === 'submitting'}
                                className="min-h-[36px] text-xs sm:text-sm"
                            >
                                <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Submit
                            </Button>
                        </div>
                        <Progress value={progress} className="h-1.5 sm:h-2" />
                    </div>
                </div>

                {/* Question Content */}
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <Card className="mb-4 sm:mb-6">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg leading-relaxed">
                                {currentQuestion.questionText}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedAnswer?.toString()}
                                onValueChange={(value: string) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                            >
                                <div className="space-y-2 sm:space-y-3">
                                    {currentQuestion.answers?.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-colors cursor-pointer min-h-[52px] ${
                                                selectedAnswer === answer.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 active:border-blue-300'
                                            }`}
                                            onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                                        >
                                            <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} className="flex-shrink-0" />
                                            <Label
                                                htmlFor={`answer-${answer.id}`}
                                                className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed"
                                            >
                                                {answer.answerText}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="flex-1 min-h-[44px] text-sm sm:text-base"
                        >
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Previous
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="flex-1 min-h-[44px] text-sm sm:text-base"
                        >
                            Next
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                    </div>

                    {/* Question Navigator */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs sm:text-sm">Question Navigator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                                {questions.map((q, index) => {
                                    const isAnswered = answers.has(q.id);
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleJumpToQuestion(index)}
                                            className={`aspect-square rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 ${
                                                isCurrent
                                                    ? 'bg-blue-600 text-white'
                                                    : isAnswered
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-100"></div>
                                    <span>Not Answered</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-600"></div>
                                    <span>Current</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Confirmation Dialog */}
                <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {getUnansweredCount() > 0 ? (
                                    <>
                                        You have <strong>{getUnansweredCount()} unanswered question(s)</strong>.
                                        Are you sure you want to submit?
                                    </>
                                ) : (
                                    'Are you sure you want to submit your quiz?'
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit}>
                                Submit Quiz
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return null;
};