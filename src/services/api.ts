
// api.ts or services/api.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired - try refresh or redirect to login
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { token } = response.data;
                    localStorage.setItem('authToken', token);

                    // Retry original request
                    if (error.config) {
                        error.config.headers.Authorization = `Bearer ${token}`;
                        return axios.request(error.config);
                    }
                } catch (refreshError) {
                    // Refresh failed - clear auth and redirect
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token - redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// API Methods
export const api = {
    // Generic methods
    get: async <T = any>(url: string): Promise<T> => {
        const response = await apiClient.get<T>(url);
        return response.data;
    },

    post: async <T = any>(url: string, data?: any): Promise<T> => {
        const response = await apiClient.post<T>(url, data);
        return response.data;
    },

    put: async <T = any>(url: string, data?: any): Promise<T> => {
        const response = await apiClient.put<T>(url, data);
        return response.data;
    },

    patch: async <T = any>(url: string, data?: any): Promise<T> => {
        const response = await apiClient.patch<T>(url, data);
        return response.data;
    },

    delete: async <T = any>(url: string): Promise<T> => {
        const response = await apiClient.delete<T>(url);
        return response.data;
    },

    // User Management APIs
    users: {
        // Get all users
        getAll: () => api.get('/api/users'),

        // Get active users only
        getActive: () => api.get('/api/users/active'),

        // Get inactive users only
        getInactive: () => api.get('/api/users/inactive'),

        // Get user by ID
        getById: (id: number) => api.get(`/api/users/${id}`),

        // Get user by email
        getByEmail: (email: string) => api.get(`/api/users/email/${encodeURIComponent(email)}`),

        // Search users
        search: (keyword: string, activeOnly: boolean = false) =>
            api.get(`/api/users/search?keyword=${encodeURIComponent(keyword)}&activeOnly=${activeOnly}`),

        // Get users by role
        getByRole: (role: string, activeOnly: boolean = false) =>
            api.get(`/api/users/role/${role}?activeOnly=${activeOnly}`),

        // Create new user
        create: (userData: {
            email: string;
            firstName: string;
            lastName: string;
            username: string;
            role: string;
            password: string;
        }) => api.post('/api/users', userData),

        // Update user
        update: (id: number, userData: {
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        }) => api.put(`/api/users/${id}`, userData),

        // Delete user
        delete: (id: number) => api.delete(`/api/users/${id}`),

        // Activate user
        activate: (id: number) => api.patch(`/api/users/${id}/activate`),

        // Deactivate user
        deactivate: (id: number) => api.patch(`/api/users/${id}/deactivate`),

        // Reset password (admin)
        resetPassword: (id: number, newPassword: string) =>
            api.post(`/api/users/${id}/reset-password`, { newPassword }),

        // Change password (user)
        changePassword: (id: number, oldPassword: string, newPassword: string) =>
            api.post(`/api/users/${id}/change-password`, { oldPassword, newPassword }),

        // Check if email exists
        checkEmailExists: (email: string, userId?: number) =>
            api.get(`/api/users/check-email?email=${encodeURIComponent(email)}${userId ? `&id=${userId}` : ''}`),

        // Get user statistics
        stats: {
            countByRole: (role: string) => api.get(`/api/users/role/${role}/count`),
            countActive: () => api.get('/api/users/active/count'),
            countActiveByRole: (role: string) => api.get(`/api/users/role/${role}/active/count`),
        },

        // Quiz-related user queries
        withQuizAttempts: () => api.get('/api/users/with-quiz-attempts'),
        withoutQuizAttempts: () => api.get('/api/users/without-quiz-attempts'),
        getQuizAttemptCount: (userId: number) => api.get(`/api/users/${userId}/quiz-attempts/count`),
        getTopByQuizAttempts: () => api.get('/api/users/top-by-quiz-attempts'),
    },

    // Authentication APIs
    auth: {
        login: (credentials: { username: string; password: string }) =>
            api.post('/api/auth/login', credentials),

        register: (data: {
            email: string;
            firstName: string;
            lastName: string;
            username: string;
            password: string;
        }) => api.post('/api/auth/register', data),

        refreshToken: (refreshToken: string) =>
            api.post('/api/auth/refresh-token', { refreshToken }),

        verifyEmail: (token: string) =>
            api.get(`/api/auth/verify-email?token=${token}`),

        forgotPassword: (email: string) =>
            api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`),

        resetPassword: (token: string, newPassword: string) =>
            api.post(`/api/auth/reset-password?token=${token}`, { newPassword }),

        resendVerification: (email: string) =>
            api.post(`/api/auth/resend-verification?email=${encodeURIComponent(email)}`),
    },

    // Topic APIs
    topics: {
        // Create a new topic
        create: (data: {
            title: string;
            description?: string;
            parentTopicId?: number;
            displayOrder?: number;
            active?: boolean;
        }) => api.post('/api/topics', data),

        // Get topic by ID
        getById: (id: number) => api.get(`/api/topics/${id}`),

        // Get all topics
        getAll: (activeOnly: boolean = false) =>
            api.get(`/api/topics?activeOnly=${activeOnly}`),

        // Get root topics (topics without parent)
        getRootTopics: (activeOnly: boolean = false) =>
            api.get(`/api/topics/root?activeOnly=${activeOnly}`),

        // Get subtopics for a parent topic
        getSubTopics: (parentTopicId: number, activeOnly: boolean = false) =>
            api.get(`/api/topics/${parentTopicId}/subtopics?activeOnly=${activeOnly}`),

        // Update a topic
        update: (id: number, data: {
            title?: string;
            description?: string;
            parentTopicId?: number;
            displayOrder?: number;
            active?: boolean;
        }) => api.put(`/api/topics/${id}`, data),

        // Delete a topic (hard delete)
        delete: (id: number) => api.delete(`/api/topics/${id}`),

        // Deactivate a topic (soft delete)
        deactivate: (id: number) => api.patch(`/api/topics/${id}/deactivate`),

        // Search topics by title
        search: (title: string, activeOnly: boolean = false) =>
            api.get(`/api/topics/search?title=${encodeURIComponent(title)}&activeOnly=${activeOnly}`),

        // Check if topic exists
        exists: (id: number) => api.get(`/api/topics/${id}/exists`),
    },

    // Resource APIs
    resources: {
        // Create a new resource
        create: (data: {
            title: string;
            description?: string;
            type: string;
            url: string;
            topicId: number;
            displayOrder?: number;
            active?: boolean;
        }) => api.post('/api/resources', data),

        // Get resource by ID
        getById: (id: number, withTopic: boolean = false) =>
            api.get(`/api/resources/${id}?withTopic=${withTopic}`),

        // Update a resource
        update: (id: number, data: {
            title?: string;
            description?: string;
            type?: string;
            url?: string;
            topicId?: number;
            displayOrder?: number;
            active?: boolean;
        }) => api.put(`/api/resources/${id}`, data),

        // Delete a resource
        delete: (id: number) => api.delete(`/api/resources/${id}`),

        // Get all resources
        getAll: (withTopic: boolean = false, activeOnly: boolean = false) =>
            api.get(`/api/resources?withTopic=${withTopic}&activeOnly=${activeOnly}`),

        // Get resources by topic ID
        getByTopic: (topicId: number, activeOnly: boolean = false, ordered: boolean = false) =>
            api.get(`/api/resources/topic/${topicId}?activeOnly=${activeOnly}&ordered=${ordered}`),

        // Get resources by type
        getByType: (type: string, activeOnly: boolean = false) =>
            api.get(`/api/resources/type/${type}?activeOnly=${activeOnly}`),

        // Get resources by topic and type
        getByTopicAndType: (topicId: number, type: string, activeOnly: boolean = false) =>
            api.get(`/api/resources/topic/${topicId}/type/${type}?activeOnly=${activeOnly}`),

        // Search resources by title
        search: (title: string, activeOnly: boolean = false) =>
            api.get(`/api/resources/search?title=${encodeURIComponent(title)}&activeOnly=${activeOnly}`),

        // Activate a resource
        activate: (id: number) => api.patch(`/api/resources/${id}/activate`),

        // Deactivate a resource
        deactivate: (id: number) => api.patch(`/api/resources/${id}/deactivate`),

        // Reorder resources for a topic
        reorder: (topicId: number, resourceIds: number[]) =>
            api.put(`/api/resources/topic/${topicId}/reorder`, resourceIds),

        // Count resources by topic
        countByTopic: (topicId: number, activeOnly: boolean = false) =>
            api.get(`/api/resources/topic/${topicId}/count?activeOnly=${activeOnly}`),

        // Count resources by type
        countByType: (type: string) =>
            api.get(`/api/resources/type/${type}/count`),

        // Delete all resources by topic
        deleteByTopic: (topicId: number) =>
            api.delete(`/api/resources/topic/${topicId}`),

        // Check if URL is unique
        checkUrlUnique: (url: string, id?: number) =>
            api.get(`/api/resources/check-url?url=${encodeURIComponent(url)}${id ? `&id=${id}` : ''}`),
    },

    // Quiz APIs
    quizzes: {
        // Create quiz
        create: (data: any) => api.post('/api/quizzes', data),

        // Get quiz by ID
        getById: (id: number) => api.get(`/api/quizzes/${id}`),

        // Get quiz with questions
        getByIdWithQuestions: (id: number) => api.get(`/api/quizzes/${id}/with-questions`),

        // Get all quizzes
        getAll: (activeOnly: boolean = false) =>
            api.get(`/api/quizzes?activeOnly=${activeOnly}`),

        // Get available quizzes
        getAvailable: () => api.get('/api/quizzes/available'),

        // Get scheduled quizzes
        getScheduled: () => api.get('/api/quizzes/scheduled'),

        // Get ended quizzes
        getEnded: () => api.get('/api/quizzes/ended'),

        // Search quizzes
        search: (title: string) =>
            api.get(`/api/quizzes/search?title=${encodeURIComponent(title)}`),

        // Update quiz
        update: (id: number, data: any) => api.put(`/api/quizzes/${id}`, data),

        activate: (id: number) => api.patch(`/api/quizzes/${id}/activate`, {}),

        deactivate: (id: number) => api.patch(`/api/quizzes/${id}/deactivate`, {}),

        // Delete quiz
        delete: (id: number) => api.delete(`/api/quizzes/${id}`),

        // Check if quiz exists
        exists: (id: number) => api.get(`/api/quizzes/${id}/exists`),

        // Check if quiz is available
        isAvailable: (id: number) => api.get(`/api/quizzes/${id}/is-available`),

        // Topic-scoped quiz endpoints
        createForTopic: (topicId: number, data: any) =>
            api.post(`/api/topics/${topicId}/quizzes`, data),

        getByIdAndTopicId: (topicId: number, id: number) =>
            api.get(`/api/topics/${topicId}/quizzes/${id}`),

        getByTopicId: (topicId: number, activeOnly: boolean = false, withQuestions: boolean = false) =>
            api.get(`/api/topics/${topicId}/quizzes?activeOnly=${activeOnly}&withQuestions=${withQuestions}`),

        getSummariesByTopicId: (topicId: number) =>
            api.get(`/api/topics/${topicId}/quizzes/summaries`),

        getAvailableByTopicId: (topicId: number) =>
            api.get(`/api/topics/${topicId}/quizzes/available`),

        updateForTopic: (topicId: number, id: number, data: any) =>
            api.put(`/api/topics/${topicId}/quizzes/${id}`, data),

        deleteForTopic: (topicId: number, id: number) =>
            api.delete(`/api/topics/${topicId}/quizzes/${id}`),

        deleteAllForTopic: (topicId: number) =>
            api.delete(`/api/topics/${topicId}/quizzes`),

        countByTopicId: (topicId: number, activeOnly: boolean = false) =>
            api.get(`/api/topics/${topicId}/quizzes/count?activeOnly=${activeOnly}`),

        existsForTopic: (topicId: number, id: number) =>
            api.get(`/api/topics/${topicId}/quizzes/${id}/exists`),
    },

    // Question APIs (nested under quizzes)
    questions: {
        // Create question for quiz
        create: (quizId: number, data: any) =>
            api.post(`/api/quizzes/${quizId}/questions`, data),

        // Get question by ID
        getById: (quizId: number, id: number) =>
            api.get(`/api/quizzes/${quizId}/questions/${id}`),

        // Get all questions for quiz
        getByQuizId: (quizId: number) =>
            api.get(`/api/quizzes/${quizId}/questions`),

        // Get question summaries for quiz
        getSummaries: (quizId: number) =>
            api.get(`/api/quizzes/${quizId}/questions/summaries`),

        // Update question
        update: (quizId: number, id: number, data: any) =>
            api.put(`/api/quizzes/${quizId}/questions/${id}`, data),

        // Delete question
        delete: (quizId: number, id: number) =>
            api.delete(`/api/quizzes/${quizId}/questions/${id}`),

        // Delete all questions for quiz
        deleteAll: (quizId: number) =>
            api.delete(`/api/quizzes/${quizId}/questions`),

        // Reorder questions
        reorder: (quizId: number, questionIds: number[]) =>
            api.put(`/api/quizzes/${quizId}/questions/reorder`, questionIds),

        // Count questions
        count: (quizId: number) =>
            api.get(`/api/quizzes/${quizId}/questions/count`),

        // Check if question exists
        exists: (quizId: number, id: number) =>
            api.get(`/api/quizzes/${quizId}/questions/${id}/exists`),
    },

    // Answer APIs  
    answers: {
        // Create answer for question
        create: (questionId: number, data: any) =>
            api.post(`/api/questions/${questionId}/answers`, data),

        // Get answer by ID
        getById: (questionId: number, id: number) =>
            api.get(`/api/questions/${questionId}/answers/${id}`),

        // Get all answers for question
        getByQuestionId: (questionId: number) =>
            api.get(`/api/questions/${questionId}/answers`),

        // Get answer summaries
        getSummaries: (questionId: number) =>
            api.get(`/api/questions/${questionId}/answers/summaries`),

        // Get correct answers
        getCorrect: (questionId: number) =>
            api.get(`/api/questions/${questionId}/answers/correct`),

        // Update answer
        update: (questionId: number, id: number, data: any) =>
            api.put(`/api/questions/${questionId}/answers/${id}`, data),

        // Delete answer
        delete: (questionId: number, id: number) =>
            api.delete(`/api/questions/${questionId}/answers/${id}`),

        // Delete all answers for question
        deleteAll: (questionId: number) =>
            api.delete(`/api/questions/${questionId}/answers`),

        // Count answers
        count: (questionId: number) =>
            api.get(`/api/questions/${questionId}/answers/count`),

        // Count correct answers
        countCorrect: (questionId: number) =>
            api.get(`/api/questions/${questionId}/answers/count/correct`),

        // Check if answer exists
        exists: (questionId: number, id: number) =>
            api.get(`/api/questions/${questionId}/answers/${id}/exists`),
    },

    // Quiz Attempt APIs
    quizAttempts: {
        // Create attempt
        create: (data: any) => api.post('/api/quiz-attempts', data),

        // Get attempt by ID
        getById: (id: number) => api.get(`/api/quiz-attempts/${id}`),

        // Get attempt with answers
        getByIdWithAnswers: (id: number) =>
            api.get(`/api/quiz-attempts/${id}/with-answers`),

        // Update attempt
        update: (id: number, data: any) =>
            api.put(`/api/quiz-attempts/${id}`, data),

        // Delete attempt
        delete: (id: number) => api.delete(`/api/quiz-attempts/${id}`),

        // Get all attempts
        getAll: () => api.get('/api/quiz-attempts'),

        // Get all attempts summary
        getAllSummary: () => api.get('/api/quiz-attempts/summary'),

        // Get attempts by user ID
        getByUserId: (userId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}`),

        // Get attempts summary by user ID
        getSummaryByUserId: (userId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/summary`),

        // Get attempts by quiz ID
        getByQuizId: (quizId: number) =>
            api.get(`/api/quiz-attempts/quiz/${quizId}`),

        // Get attempts summary by quiz ID
        getSummaryByQuizId: (quizId: number) =>
            api.get(`/api/quiz-attempts/quiz/${quizId}/summary`),

        // Get attempts by user and quiz
        getByUserAndQuiz: (userId: number, quizId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/quiz/${quizId}`),

        // Get in-progress attempt
        getInProgress: (userId: number, quizId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/quiz/${quizId}/in-progress`),

        // Get latest attempt
        getLatest: (userId: number, quizId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/quiz/${quizId}/latest`),

        // Get attempts by status
        getByStatus: (status: string) =>
            api.get(`/api/quiz-attempts/status/${status}`),

        // Submit attempt
        submit: (id: number) => api.post(`/api/quiz-attempts/${id}/submit`),

        // Mark expired attempts
        markExpired: () => api.post('/api/quiz-attempts/mark-expired'),

        // Get attempts in date range
        getInDateRange: (startDate: string, endDate: string) =>
            api.get(`/api/quiz-attempts/date-range?startDate=${startDate}&endDate=${endDate}`),

        // Get user attempts in date range
        getUserInDateRange: (userId: number, startDate: string, endDate: string) =>
            api.get(`/api/quiz-attempts/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`),

        // Check if user has in-progress attempt
        hasInProgress: (userId: number, quizId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/quiz/${quizId}/has-in-progress`),

        // Get user attempt count
        getUserCount: (userId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/count`),

        // Get quiz attempt count
        getQuizCount: (quizId: number) =>
            api.get(`/api/quiz-attempts/quiz/${quizId}/count`),

        // Get user passed attempt count
        getUserPassedCount: (userId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/passed-count`),

        // Get quiz average score
        getQuizAverageScore: (quizId: number) =>
            api.get(`/api/quiz-attempts/quiz/${quizId}/average-score`),

        // Get user best score
        getUserBestScore: (userId: number, quizId: number) =>
            api.get(`/api/quiz-attempts/user/${userId}/quiz/${quizId}/best-score`),
    },

    // User Answer APIs
    userAnswers: {
        // Submit answer
        submit: (data: any) => api.post('/api/user-answers', data),

        // Get user answer by ID
        getById: (id: number) => api.get(`/api/user-answers/${id}`),

        // Get answers by quiz attempt
        getByQuizAttempt: (quizAttemptId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}`),

        // Get correct answers
        getCorrect: (quizAttemptId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}/correct`),

        // Get incorrect answers
        getIncorrect: (quizAttemptId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}/incorrect`),

        // Get statistics
        getStatistics: (quizAttemptId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}/statistics`),

        // Get answer for specific question
        getForQuestion: (quizAttemptId: number, questionId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}/question/${questionId}`),

        // Check if question answered
        hasAnswered: (quizAttemptId: number, questionId: number) =>
            api.get(`/api/user-answers/quiz-attempt/${quizAttemptId}/question/${questionId}/exists`),

        // Update answer
        update: (id: number, data: any) =>
            api.put(`/api/user-answers/${id}`, data),

        // Delete answer
        delete: (id: number) => api.delete(`/api/user-answers/${id}`),
    },
};

export default api;
