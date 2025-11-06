import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type {Topic} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { BookOpen, Search, FileText, ClipboardList, ChevronRight } from 'lucide-react';

export const Topics: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      // Get all active topics from the API
      const data = await api.topics.getAll(true);
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTopicHierarchy = (topics: Topic[]): Topic[] => {
    const topicMap = new Map<number, Topic>();
    const rootTopics: Topic[] = [];

    topics.forEach(topic => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });

    topics.forEach(topic => {
      const topicNode = topicMap.get(topic.id);
      if (topicNode) {
        // Use parentTopicId from the backend
        if (topic.parentTopicId && topicMap.has(topic.parentTopicId)) {
          const parent = topicMap.get(topic.parentTopicId);
          if (parent && parent.children) {
            parent.children.push(topicNode);
          }
        } else {
          rootTopics.push(topicNode);
        }
      }
    });

    return rootTopics;
  };

  const filterTopics = (topics: Topic[], query: string): Topic[] => {
    if (!query) return topics;
    
    const lowerQuery = query.toLowerCase();
    return topics.filter(topic => 
      topic.title.toLowerCase().includes(lowerQuery) ||
      topic.description.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredTopics = filterTopics(topics, searchQuery);
  const hierarchicalTopics = buildTopicHierarchy(filteredTopics);

  const renderTopicItem = (topic: Topic, level: number = 0) => {
    const hasChildren = topic.children && topic.children.length > 0;

    if (hasChildren) {
      return (
        <AccordionItem key={topic.id} value={`topic-${topic.id}`} className={level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 flex-1">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span>{topic.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {topic.children?.length || 0} subtopics
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {/* Parent topic card */}
              <div 
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm">View {topic.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {topic.resourceCount || 0} resources
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {topic.quizCount || 0} quizzes
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Subtopics */}
              <Accordion type="multiple" className="space-y-2">
                {topic.children?.map(child => renderTopicItem(child, level + 1))}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <div 
        key={topic.id}
        className={`p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all ${level > 0 ? 'ml-6' : ''}`}
        onClick={() => navigate(`/topics/${topic.id}`)}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm">{topic.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {topic.resourceCount || 0} resources
              </span>
              <span className="flex items-center gap-1">
                <ClipboardList className="w-3 h-3" />
                {topic.quizCount || 0} quizzes
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl mb-4">Browse Topics</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hierarchicalTopics.length > 0 ? (
          <div className="space-y-4">
            <Accordion type="multiple" className="space-y-4">
              {hierarchicalTopics.map(topic => renderTopicItem(topic))}
            </Accordion>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No topics found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'No topics available yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
