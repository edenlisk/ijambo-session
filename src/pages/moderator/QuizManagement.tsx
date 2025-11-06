import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api.ts';
import type { QuizDto, TopicDto, QuizCreateDto } from '@/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
    Plus,
    ClipboardList,
    Calendar,
    Clock,
    Loader2,
    Edit,
    HelpCircle,
    Trash2,
    CheckCircle2,
    XCircle,
    Search,
    Filter
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const QuizManagement: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
    const [topics, setTopics] = useState<TopicDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTopic, setFilterTopic] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [formData, setFormData] = useState<QuizCreateDto>({
        title: '',
        description: '',
        topicId: 0,
        durationMinutes: 30,
        startTime: '',
        endTime: '',
        passingScore: 70,
        shuffleQuestions: false,
        showResultsImmediately: true,
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quizzesData, topicsData] = await Promise.all([
                api.quizzes.getAll(false), // Get all quizzes including inactive
                api.topics.getAll(true) // Get active topics
            ]);
            setQuizzes(quizzesData);
            setTopics(topicsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        setFormData({
            title: '',
            description: '',
            topicId: 0,
            durationMinutes: 30,
            startTime: tomorrow.toISOString().slice(0, 16),
            endTime: nextWeek.toISOString().slice(0, 16),
            passingScore: 70,
            shuffleQuestions: false,
            showResultsImmediately: true,
            active: true
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.topicId) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const createdQuiz = await api.quizzes.create(formData);
            toast.success('Quiz created successfully! Now add questions to it.');
            setIsDialogOpen(false);
            await loadData();
            navigate(`/moderator/quiz/${createdQuiz.id}/questions`);
        } catch (error) {
            console.error('Failed to create quiz:', error);
            toast.error('Failed to create quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteQuizId) return;

        try {
            await api.quizzes.delete(deleteQuizId);
            toast.success('Quiz deleted successfully');
            setDeleteQuizId(null);
            await loadData();
        } catch (error) {
            console.error('Failed to delete quiz:', error);
            toast.error('Failed to delete quiz');
        }
    };

    const handleToggleActive = async (quizId: number, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await api.quizzes.deactivate(quizId);
                toast.success('Quiz deactivated');
            } else {
                await api.quizzes.activate(quizId);
                toast.success('Quiz activated');
            }
            await loadData();
        } catch (error) {
            console.error('Failed to update quiz status:', error);
            toast.error('Failed to update quiz status');
        }
    };

    const filterQuizzes = (quizzesList: QuizDto[]) => {
        let filtered = [...quizzesList];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (quiz) =>
                    quiz.title.toLowerCase().includes(query) ||
                    quiz.description.toLowerCase().includes(query) ||
                    (quiz.topicTitle && quiz.topicTitle.toLowerCase().includes(query))
            );
        }

        // Topic filter
        if (filterTopic !== 'all') {
            filtered = filtered.filter((quiz) => quiz.topicId.toString() === filterTopic);
        }

        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'active') {
                filtered = filtered.filter((quiz) => quiz.active);
            } else if (filterStatus === 'inactive') {
                filtered = filtered.filter((quiz) => !quiz.active);
            }
        }

        return filtered;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const filtered = filterQuizzes(quizzes);

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold">Quiz Management</h1>
                                <p className="text-gray-600 mt-1">Create and manage quizzes</p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <div className="flex gap-3">
                                    <DialogTrigger asChild>
                                        <Button onClick={handleOpenDialog}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Quiz
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Quiz</DialogTitle>
                                            <DialogDescription>Set up a new quiz for students</DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-2">
                                                    <Label htmlFor="title">Quiz Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={formData.title}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                                                        }
                                                        placeholder="Quiz title"
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="col-span-2 space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                                                        }
                                                        placeholder="Describe what this quiz covers..."
                                                        rows={2}
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="col-span-2 space-y-2">
                                                    <Label htmlFor="topic">Topic *</Label>
                                                    <Select
                                                        value={formData.topicId > 0 ? formData.topicId.toString() : ''}
                                                        onValueChange={(value) =>
                                                            setFormData((prev) => ({ ...prev, topicId: parseInt(value) }))
                                                        }
                                                        disabled={submitting}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a topic" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {topics.map((topic) => (
                                                                <SelectItem key={topic.id} value={topic.id.toString()}>
                                                                    {topic.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    {topics.length === 0 && (
                                                        <p className="text-xs text-amber-600">
                                                            No topics available. Create topics first.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                                    <Input
                                                        id="duration"
                                                        type="number"
                                                        value={formData.durationMinutes}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                durationMinutes: parseInt(e.target.value)
                                                            }))
                                                        }
                                                        min={5}
                                                        max={180}
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                                                    <Input
                                                        id="passingScore"
                                                        type="number"
                                                        value={formData.passingScore}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({ ...prev, passingScore: parseInt(e.target.value) }))
                                                        }
                                                        min={0}
                                                        max={100}
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="startTime">Start Date & Time</Label>
                                                    <Input
                                                        id="startTime"
                                                        type="datetime-local"
                                                        value={formData.startTime}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="endTime">End Date & Time</Label>
                                                    <Input
                                                        id="endTime"
                                                        type="datetime-local"
                                                        value={formData.endTime}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                                                        disabled={submitting}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-blue-800">
                                                    ℹ️ After creating the quiz, you'll be redirected to add questions to it.
                                                </p>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsDialogOpen(false)}
                                                    className="flex-1"
                                                    disabled={submitting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="flex-1" disabled={submitting}>
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        'Create Quiz'
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </div>
                            </Dialog>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search quizzes by title, description, or topic..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Topic Filter */}
                            <div className="w-full sm:w-64">
                                <Select value={filterTopic} onValueChange={setFilterTopic}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Topics</SelectItem>
                                        {topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id.toString()}>
                                                {topic.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="w-full sm:w-48">
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filter Summary */}
                        {(searchQuery || filterTopic !== 'all' || filterStatus !== 'all') && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                <Filter className="w-4 h-4" />
                                <span>
                  Showing {filtered.length} of {quizzes.length} quizzes
                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterTopic('all');
                                        setFilterStatus('all');
                                    }}
                                    className="text-blue-600 h-auto p-0"
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {filtered.length > 0 ? (
                        <div className="grid gap-4">
                            {filtered.map((quiz) => (
                                <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
                                                <ClipboardList className="w-6 h-6 text-green-600" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                                                            <Badge variant={quiz.active ? 'default' : 'secondary'}>
                                                                {quiz.active ? (
                                                                    <>
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                                                                    </>
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        {quiz.topicTitle && <p className="text-sm text-blue-600 mt-1">{quiz.topicTitle}</p>}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                              {quiz.durationMinutes} min
                          </span>

                                                    <span className="flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                                                        {quiz.questionCount || 0} questions
                          </span>

                                                    {quiz.startTime && (
                                                        <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                                                            {format(new Date(quiz.startTime), 'MMM dd, yyyy')}
                            </span>
                                                    )}

                                                    <Badge variant="outline" className="text-xs">
                                                        Pass: {quiz.passingScore}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => navigate(`/moderator/quiz/${quiz.id}/questions`)}
                                            >
                                                <HelpCircle className="w-4 h-4 mr-2" />
                                                Manage Questions
                                            </Button>

                                            <Button size="sm" variant="outline" onClick={() => navigate(`/moderator/quiz/${quiz.id}/edit`)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Quiz
                                            </Button>

                                            <Button size="sm" variant="outline" onClick={() => handleToggleActive(quiz.id, quiz.active)}>
                                                {quiz.active ? (
                                                    <>
                                                        <XCircle className="w-4 h-4 mr-2" /> Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Activate
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDeleteQuizId(quiz.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                {quizzes.length === 0 ? (
                                    <>
                                        <p className="text-gray-600 font-medium">No quizzes yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Create your first quiz to get started</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-600 font-medium">No quizzes match your filters</p>
                                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterTopic('all');
                                                setFilterStatus('all');
                                            }}
                                            className="mt-4"
                                        >
                                            Clear filters
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Delete Confirmation */}
                <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This quiz and all its questions will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
};
