import React, { useEffect, useState } from 'react';
import { api } from '@/services/api.ts';
import { Question, CreateQuestionDto, CreateAnswerDto, UpdateQuestionDto } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Trash2, HelpCircle, Loader2, CheckCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface FormState {
  questionText: string;
  explanation: string;
  points: number;
  answers: {
    answerText: string;
    correct: boolean;
  }[];
}

export const QuestionManagement: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState<FormState>({
    questionText: '',
    explanation: '',
    points: 1,
    answers: [
      { answerText: '', correct: false },
      { answerText: '', correct: false },
      { answerText: '', correct: false },
      { answerText: '', correct: false }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allQuestions = await api.getQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      explanation: '',
      points: 1,
      answers: [
        { answerText: '', correct: false },
        { answerText: '', correct: false },
        { answerText: '', correct: false },
        { answerText: '', correct: false }
      ]
    });
    setIsDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      explanation: question.explanation || '',
      points: question.points,
      answers: question.answers.map(a => ({
        answerText: a.answerText,
        correct: a.correct
      }))
    });
    setIsDialogOpen(true);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], answerText: value };
    setFormData(prev => ({ ...prev, answers: newAnswers }));
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = formData.answers.map((answer, idx) => ({
      ...answer,
      correct: idx === index
    }));
    setFormData(prev => ({ ...prev, answers: newAnswers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (formData.answers.some(ans => !ans.answerText.trim())) {
      toast.error('Please fill in all answer options');
      return;
    }

    if (!formData.answers.some(ans => ans.correct)) {
      toast.error('Please mark one answer as correct');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingQuestion) {
        // Update existing question
        const updateQuestionDto: UpdateQuestionDto = {
          questionText: formData.questionText,
          explanation: formData.explanation || undefined,
          points: formData.points,
          answers: formData.answers.map((answer, index) => ({
            answerText: answer.answerText,
            correct: answer.correct,
            displayOrder: index
          }))
        };
        
        await api.updateQuestion(editingQuestion.id, updateQuestionDto);
        toast.success('Question updated successfully');
      } else {
        // Create new question
        const createQuestionDto: CreateQuestionDto = {
          questionText: formData.questionText,
          explanation: formData.explanation || undefined,
          points: formData.points,
          answers: formData.answers.map((answer, index) => ({
            answerText: answer.answerText,
            correct: answer.correct,
            displayOrder: index
          }))
        };
        
        await api.createQuestion(createQuestionDto);
        toast.success('Question created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingQuestion(null);
      loadData();
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error('Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteQuestionId) return;

    try {
      await api.deleteQuestion(deleteQuestionId);
      toast.success('Question deleted successfully');
      setDeleteQuestionId(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl">Question Bank</h1>
              <p className="text-gray-600 mt-1">Manage quiz questions</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create New Question'}</DialogTitle>
                  <DialogDescription>
                    {editingQuestion ? 'Update the question details' : 'Add a multiple choice question to the question bank'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question</Label>
                    <Textarea
                      id="questionText"
                      value={formData.questionText}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
                      placeholder="Enter your question..."
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={formData.explanation}
                      onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Explain the correct answer..."
                      rows={2}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                      disabled={submitting}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {formData.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                            answer.correct ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <Input
                            value={answer.answerText}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            disabled={submitting}
                          />
                        </div>
                        <Button
                          type="button"
                          variant={answer.correct ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleCorrectAnswerChange(index)}
                          disabled={submitting}
                          className="shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Click the check icon to mark the correct answer</p>
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
                          {editingQuestion ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingQuestion ? 'Update Question' : 'Create Question'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {questions.length > 0 ? (
          <div className="grid gap-4">
            {questions.map((question, index) => {
              const correctAnswer = question.answers?.find(a => a.correct);
              
              return (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg shrink-0">
                        <HelpCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {question.points} {question.points === 1 ? 'point' : 'points'}
                              </Badge>
                            </div>
                            <p className="text-sm mb-3">{question.questionText}</p>
                            {question.explanation && (
                              <p className="text-xs text-gray-600 mb-3 italic">
                                💡 {question.explanation}
                              </p>
                            )}
                            <div className="space-y-2">
                              {question.answers && question.answers
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((answer, ansIndex) => (
                                  <div 
                                    key={answer.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                      answer.correct
                                        ? 'bg-green-50 border-2 border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                      answer.correct
                                        ? 'bg-green-200 text-green-700'
                                        : 'bg-gray-200'
                                    }`}>
                                      {String.fromCharCode(65 + ansIndex)}
                                    </div>
                                    <span className="flex-1">{answer.answerText}</span>
                                    {answer.correct && (
                                      <Badge variant="outline" className="ml-auto text-xs shrink-0">
                                        Correct
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteQuestionId(question.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No questions found</p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first question to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This question will be removed from the question bank.
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
  );
};
