import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Topic, CreateTopicDto } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteTopicId, setDeleteTopicId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateTopicDto>({
    title: '',
    description: '',
    parentTopicId: undefined
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await api.topics.getAll(false); // Get all topics including inactive
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        title: topic.title,
        description: topic.description,
        parentTopicId: topic.parentTopicId
      });
    } else {
      setEditingTopic(null);
      setFormData({
        title: '',
        description: '',
        parentTopicId: undefined
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingTopic) {
        await api.topics.update(editingTopic.id, formData);
        toast.success('Topic updated successfully');
      } else {
        await api.topics.create(formData);
        toast.success('Topic created successfully');
      }
      
      setIsDialogOpen(false);
      loadTopics();
    } catch (error) {
      console.error('Failed to save topic:', error);
      toast.error('Failed to save topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTopicId) return;

    try {
      await api.topics.delete(deleteTopicId);
      toast.success('Topic deleted successfully');
      setDeleteTopicId(null);
      loadTopics();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const getRootTopics = () => topics.filter(t => !t.parentTopicId);

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
              <h1 className="text-3xl">Topic Management</h1>
              <p className="text-gray-600 mt-1">Create and manage learning topics</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTopic ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
                  <DialogDescription>
                    {editingTopic ? 'Update topic information' : 'Add a new topic to the learning platform'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Topic title"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this topic covers..."
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Topic (Optional)</Label>
                    <Select 
                      value={formData.parentTopicId?.toString() || 'none'}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        parentTopicId: value === 'none' ? undefined : parseInt(value)
                      }))}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No parent (Root topic)</SelectItem>
                        {getRootTopics().map(topic => (
                          <SelectItem key={topic.id} value={topic.id.toString()}>
                            {topic.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          Saving...
                        </>
                      ) : (
                        editingTopic ? 'Update' : 'Create'
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
        {topics.length > 0 ? (
          <div className="grid gap-4">
            {topics.map(topic => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm">{topic.title}</h3>
                        {topic.parentTopicId && (
                          <span className="text-xs text-gray-500">
                            (Subtopic)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{topic.resourceCount || 0} resources</span>
                        <span>{topic.quizCount || 0} quizzes</span>
                        <span>Created {new Date(topic.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(topic)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteTopicId(topic.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No topics yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first topic to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTopicId} onOpenChange={() => setDeleteTopicId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the topic and all associated resources.
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
