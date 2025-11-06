import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Topic, Resource } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, FileText, Link as LinkIcon, Video, Download, ExternalLink, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTopicData(parseInt(id));
    }
  }, [id]);

  const loadTopicData = async (topicId: number) => {
    try {
      setLoading(true);
      const [topicData, resourcesData] = await Promise.all([
        api.topics.getById(topicId),
        api.resources.getByTopic(topicId, true, true) // Get active resources, ordered
      ]);
      setTopic(topicData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Failed to load topic:', error);
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
      case 'DOCUMENT':
        return FileText;
      case 'LINK':
        return LinkIcon;
      case 'VIDEO':
        return Video;
      default:
        return FileText;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'PDF':
      case 'DOCUMENT':
        return 'text-red-600';
      case 'LINK':
        return 'text-blue-600';
      case 'VIDEO':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleResourceClick = (resource: Resource) => {
    // Open resource in new tab
    window.open(resource.url, '_blank', 'noopener,noreferrer');
    toast.success('Opening resource...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Topic not found</p>
            <Button onClick={() => navigate('/topics')} className="mt-4">
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/topics')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topics
          </Button>
          
          <h1 className="text-3xl">{topic.title}</h1>
          <p className="text-gray-600 mt-2">{topic.description}</p>
          
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">
              {resources.length} Resources
            </Badge>
            <Badge variant="outline">
              {topic.quizCount || 0} Quizzes
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="mt-6">
            {resources.length > 0 ? (
              <div className="grid gap-3 sm:gap-4">
                {resources.map(resource => {
                  const Icon = getResourceIcon(resource.type);
                  const iconColor = getResourceColor(resource.type);
                  
                  return (
                    <Card 
                      key={resource.id} 
                      className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all active:scale-98"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`p-2 sm:p-3 rounded-lg ${iconColor} flex-shrink-0`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-medium line-clamp-1">{resource.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                            </div>
                            {resource.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
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
                  <p className="text-gray-600">No resources available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Resources will appear here once they are added
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About this Topic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-600">Title</h3>
                  <p className="mt-1">{topic.title}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Description</h3>
                  <p className="mt-1">{topic.description}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Created By</h3>
                  <p className="mt-1">
                    {topic.createdBy 
                      ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Created At</h3>
                  <p className="mt-1">{new Date(topic.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
