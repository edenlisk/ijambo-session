import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api.ts';
import type {QuizDto, QuestionDto, TopicDto, QuizUpdateDto} from '@/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Clock, Calendar, Trophy, Save, X, Plus, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const QuizEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form data
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [active, setActive] = useState(true);
  const [topicId, setTopicId] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionDto[]>([]);

  // Available questions
  const [availableQuestions, setAvailableQuestions] = useState<QuestionDto[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<TopicDto[]>([]);

  // Dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteQuestionDialog, setShowDeleteQuestionDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionDto | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    filterQuestions();
  }, [searchQuery, availableQuestions]);

  useEffect(() => {
    // Check for unsaved changes
    if (quiz) {
      const changed = 
        title !== quiz.title ||
        description !== quiz.description ||
        durationMinutes !== quiz.durationMinutes ||
        passingScore !== quiz.passingScore ||
        startTime !== (quiz.startTime ? format(new Date(quiz.startTime), "yyyy-MM-dd'T'HH:mm") : '') ||
        endTime !== (quiz.endTime ? format(new Date(quiz.endTime), "yyyy-MM-dd'T'HH:mm") : '') ||
        shuffleQuestions !== quiz.shuffleQuestions ||
        showResultsImmediately !== quiz.showResultsImmediately ||
        active !== quiz.active;
      setHasChanges(changed);
    }
  }, [title, description, durationMinutes, passingScore, startTime, endTime, shuffleQuestions, showResultsImmediately, active, quiz]);

  const loadData = async () => {
    try {
      setLoading(true);
      const quizId = parseInt(id!);
      
      // Load quiz and topics
      const [quizData, topicsData] = await Promise.all([
        api.quizzes.getById(quizId),
        api.topics.getAll(true)
      ]);

      setQuiz(quizData);
      setTitle(quizData.title);
      setDescription(quizData.description);
      setDurationMinutes(quizData.durationMinutes);
      setPassingScore(quizData.passingScore);
      setTopicId(quizData.topicId);
      setStartTime(quizData.startTime ? format(new Date(quizData.startTime), "yyyy-MM-dd'T'HH:mm") : '');
      setEndTime(quizData.endTime ? format(new Date(quizData.endTime), "yyyy-MM-dd'T'HH:mm") : '');
      setShuffleQuestions(quizData.shuffleQuestions);
      setShowResultsImmediately(quizData.showResultsImmediately);
      setActive(quizData.active);
      
      // Load questions for this quiz
      const questionsData = await api.questions.getByQuizId(quizId);
      setSelectedQuestions(questionsData);
      setAvailableQuestions([]);

      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast.error('Failed to load quiz');
      navigate('/moderator/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = availableQuestions.filter(
      q => !selectedQuestions.find(sq => sq.id === q.id)
    );

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    // Note: Questions are now managed separately, no validation here

    if (durationMinutes <= 0) {
      toast.error('Duration must be a positive number');
      return;
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: QuizUpdateDto = {
        title,
        description,
        durationMinutes,
        passingScore,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        shuffleQuestions,
        showResultsImmediately,
        active
      };
      
      await api.quizzes.update(parseInt(id!), updateData);

      toast.success('Quiz updated successfully');
      setHasChanges(false);
      navigate('/moderator/quizzes');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      toast.error('Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/moderator/quizzes');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/moderator/quizzes');
  };

  const addQuestion = (question: QuestionDto) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const removeQuestion = (question: QuestionDto) => {
    setQuestionToDelete(question);
    setShowDeleteQuestionDialog(true);
  };

  const confirmDeleteQuestion = () => {
    if (questionToDelete) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionToDelete.id));
      setQuestionToDelete(null);
    }
    setShowDeleteQuestionDialog(false);
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...selectedQuestions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    setSelectedQuestions(newQuestions);
  };

  const moveQuestionDown = (index: number) => {
    if (index === selectedQuestions.length - 1) return;
    const newQuestions = [...selectedQuestions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setSelectedQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Edit Quiz</h1>
        <p className="text-gray-600">Modify quiz settings and questions</p>
      </div>

      <div className="space-y-6">
        {/* Quiz Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Basic information about the quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Passing Score (%) *
                </Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Set when the quiz is available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure quiz behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
              />
              <Label htmlFor="shuffle" className="cursor-pointer">
                Shuffle questions for each attempt
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showResults"
                checked={showResultsImmediately}
                onCheckedChange={(checked) => setShowResultsImmediately(checked as boolean)}
              />
              <Label htmlFor="showResults" className="cursor-pointer">
                Show results immediately after submission
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(checked) => setActive(checked as boolean)}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Quiz is active
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({selectedQuestions.length})</CardTitle>
            <CardDescription>
              Questions are managed separately. Go to Quiz Management and click "Manage Questions" button.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Questions - Read Only */}
            {selectedQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-medium">No questions added yet</p>
                <p className="text-sm mt-2">Questions for this quiz are managed separately</p>
                <Button
                  onClick={() => navigate(`/moderator/quiz/${id}/questions`)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Questions
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {selectedQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-start gap-2 p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Q{index + 1}</Badge>
                          <p className="text-sm flex-1">{question.questionText}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{question.points} point(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate(`/moderator/quiz/${id}/questions`)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Questions
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 md:-mx-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Question Confirmation Dialog */}
      <AlertDialog open={showDeleteQuestionDialog} onOpenChange={setShowDeleteQuestionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this question from the quiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQuestion} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
