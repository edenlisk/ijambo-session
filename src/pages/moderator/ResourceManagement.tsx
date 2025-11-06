import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Resource, ResourceCreateDto, Topic, ResourceType } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { Plus, MoreVertical, Edit, Trash2, FileText, Link as LinkIcon, Video, Download, Loader2, ExternalLink, Search, Filter, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';

export const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteResourceId, setDeleteResourceId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [formData, setFormData] = useState<ResourceCreateDto>({
    title: '',
    description: '',
    type: ResourceType.LINK,
    url: '',
    topicId: 0,
    displayOrder: 0,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, topicsData] = await Promise.all([
        api.resources.getAll(true, false), // Get all resources with topic info
        api.topics.getAll(false)
      ]);
      setResources(resourcesData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        topicId: resource.topicId || 0,
        displayOrder: resource.displayOrder,
        active: resource.active
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        type: ResourceType.LINK,
        url: '',
        topicId: 0,
        displayOrder: 0,
        active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url || !formData.topicId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingResource) {
        await api.resources.update(editingResource.id, formData);
        toast.success('Resource updated successfully');
      } else {
        await api.resources.create(formData);
        toast.success('Resource created successfully');
      }
      
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteResourceId) return;

    try {
      await api.resources.delete(deleteResourceId);
      toast.success('Resource deleted successfully');
      setDeleteResourceId(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleToggleActive = async (resource: Resource) => {
    try {
      if (resource.active) {
        await api.resources.deactivate(resource.id);
        toast.success('Resource deactivated');
      } else {
        await api.resources.activate(resource.id);
        toast.success('Resource activated');
      }
      loadData();
    } catch (error) {
      console.error('Failed to toggle resource status:', error);
      toast.error('Failed to update resource status');
    }
  };

  const handleOpenResource = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.PDF:
      case ResourceType.DOCUMENT:
        return FileText;
      case ResourceType.LINK:
        return LinkIcon;
      case ResourceType.VIDEO:
        return Video;
      default:
        return FileText;
    }
  };

  const getResourceColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.PDF:
      case ResourceType.DOCUMENT:
        return 'text-red-600 bg-red-50';
      case ResourceType.LINK:
        return 'text-blue-600 bg-blue-50';
      case ResourceType.VIDEO:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopic = filterTopic === 'all' || resource.topicId?.toString() === filterTopic;
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && resource.active) ||
      (filterStatus === 'inactive' && !resource.active);

    return matchesSearch && matchesTopic && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Resource Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage learning resources and materials</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingResource ? 'Edit Resource' : 'Create New Resource'}</DialogTitle>
                  <DialogDescription>
                    {editingResource ? 'Update resource information' : 'Add a new learning resource'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Great Controversy by Ellen G White"
                      disabled={submitting}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this resource..."
                      rows={3}
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ResourceType }))}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ResourceType.LINK}>Link</SelectItem>
                          <SelectItem value={ResourceType.PDF}>PDF</SelectItem>
                          <SelectItem value={ResourceType.VIDEO}>Video</SelectItem>
                          <SelectItem value={ResourceType.DOCUMENT}>Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic *</Label>
                      <Select 
                        value={formData.topicId.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, topicId: parseInt(value) }))}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map(topic => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/resource"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                        disabled={submitting}
                        min={0}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="active">Status</Label>
                      <Select 
                        value={formData.active ? 'true' : 'false'}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === 'true' }))}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                        editingResource ? 'Update' : 'Create'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ResourceType.LINK}>Link</SelectItem>
                  <SelectItem value={ResourceType.PDF}>PDF</SelectItem>
                  <SelectItem value={ResourceType.VIDEO}>Video</SelectItem>
                  <SelectItem value={ResourceType.DOCUMENT}>Document</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredResources.length > 0 ? (
          <div className="grid gap-4">
            {filteredResources.map(resource => {
              const Icon = getResourceIcon(resource.type);
              const colorClass = getResourceColor(resource.type);
              
              return (
                <Card key={resource.id} className={!resource.active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className={`p-3 rounded-lg ${colorClass} self-start`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <h3 className="text-base font-medium">{resource.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {resource.type}
                            </Badge>
                            <Badge 
                              variant={resource.active ? "default" : "outline"} 
                              className="text-xs"
                            >
                              {resource.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {resource.description || 'No description'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="font-medium">{resource.topicTitle}</span>
                          <span>•</span>
                          <span>Order: {resource.displayOrder}</span>
                          <span>•</span>
                          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 self-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenResource(resource)}
                          className="flex-1 sm:flex-none"
                        >
                          <ExternalLink className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Open</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(resource)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(resource)}>
                              {resource.active ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteResourceId(resource.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No resources found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery || filterTopic !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first resource to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResourceId} onOpenChange={() => setDeleteResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource.
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
