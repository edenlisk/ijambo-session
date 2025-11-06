// Entity Types matching Spring Boot backend exactly

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum ResourceType {
  PDF = 'PDF',
  LINK = 'LINK',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO'
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED'
}

// Entity interfaces matching backend entities exactly

export interface User {
  id: number;
  email: string;
  username: string;
  password?: string; // Exclude from responses in production
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  active: boolean;
  softDeleted: boolean;
  verified: boolean;
  verificationToken?: string;
  verificationExpires?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  loginAttempts: number;
  accountLockedUntil?: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  quizAttempts?: QuizAttempt[];
}

export interface TopicSummaryDto {
  id: number;
  title: string;
  description: string;
  active: boolean;
  hasQuiz: boolean;
  subTopicCount: number;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  parentTopicId?: number;
  parentTopicTitle?: string;
  subTopics?: TopicSummaryDto[];
  displayOrder: number;
  active: boolean;
  hasQuiz: boolean;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
  // Frontend-only fields for hierarchy display
  children?: Topic[];
  parentId?: number;
  quizCount?: number;
  resources?: Resource[];
  quiz?: Quiz;
  createdBy?: User;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  topic?: Topic;
  topicId?: number;
  topicTitle?: string;
  createdBy?: User;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDto {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  topicId: number;
  topicTitle: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreateDto {
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  topicId: number;
  displayOrder?: number;
  active?: boolean;
}

export interface ResourceUpdateDto {
  title?: string;
  description?: string;
  type?: ResourceType;
  url?: string;
  topicId?: number;
  displayOrder?: number;
  active?: boolean;
}

// Answer interfaces
export interface Answer {
  id: number;
  answerText: string;
  correct: boolean;
  question?: Question;
  questionId?: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerDto {
  id: number;
  answerText: string;
  correct: boolean;
  questionId: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerSummaryDto {
  id: number;
  answerText: string;
  displayOrder: number;
}

export interface AnswerCreateDto {
  answerText: string;
  correct: boolean;
  displayOrder?: number;
}

export interface AnswerUpdateDto {
  answerText?: string;
  correct?: boolean;
  displayOrder?: number;
}

// Question interfaces
export interface Question {
  id: number;
  questionText: string;
  explanation?: string;
  quiz?: Quiz;
  quizId?: number;
  createdBy?: User;
  points: number;
  displayOrder: number;
  answers: Answer[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDto {
  id: number;
  questionText: string;
  explanation?: string;
  quizId: number;
  points: number;
  displayOrder: number;
  answers?: AnswerDto[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCreateDto {
  questionText: string;
  explanation?: string;
  quizId: number;
  points: number;
  displayOrder?: number;
  answers: AnswerCreateDto[];
  active?: boolean;
}

export interface QuestionUpdateDto {
  questionText?: string;
  explanation?: string;
  points?: number;
  displayOrder?: number;
  active?: boolean;
}

// Quiz interfaces
export interface Quiz {
  id: number;
  title: string;
  description: string;
  topic?: Topic;
  topicId?: number;
  topicTitle?: string;
  createdBy?: User;
  durationMinutes: number;
  passingScore: number;
  active: boolean;
  startTime?: string;
  endTime?: string;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  questions?: Question[];
  questionCount?: number;
  totalPoints?: number;
  quizAttempts?: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizDto {
  id: number;
  title: string;
  description: string;
  topicId: number;
  topicTitle: string;
  durationMinutes: number;
  passingScore: number;
  active: boolean;
  startTime?: string;
  endTime?: string;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  questionCount: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  questions: QuestionDto[];
}

export interface QuizSummaryDto {
  id: number;
  title: string;
  topicTitle: string;
  durationMinutes: number;
  passingScore: number;
  active: boolean;
  startTime?: string;
  endTime?: string;
  questionCount: number;
  isAvailable: boolean;
}

export interface QuizCreateDto {
  title: string;
  description?: string;
  topicId: number;
  durationMinutes: number;
  passingScore: number;
  active?: boolean;
  startTime?: string;
  endTime?: string;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
}

export interface QuizUpdateDto {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  active?: boolean;
  startTime?: string;
  endTime?: string;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
}

// Quiz Attempt interfaces
export interface QuizAttempt {
  id: number;
  quiz?: Quiz;
  quizId?: number;
  quizTitle?: string;
  user?: User;
  userId?: number;
  userFullName?: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  score?: number;
  totalPoints?: number;
  passed?: boolean;
  durationMinutes?: number;
  remainingSeconds?: number;
  userAnswers?: UserAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptDto {
  id: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  userFullName: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
  score?: number;
  totalPoints?: number;
  passed?: boolean;
  durationMinutes: number;
  remainingSeconds?: number;
  userAnswers?: UserAnswerDto[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptSummaryDto {
  id: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  userFullName: string;
  user?: User;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalPoints?: number;
  passed?: boolean;
  correctAnswers?: number;
  totalQuestions?: number;
}

export interface QuizAttemptCreateDto {
  quizId: number;
  userId: number;
}

export interface QuizAttemptUpdateDto {
  status?: AttemptStatus;
  completedAt?: string;
  score?: number;
  totalPoints?: number;
  passed?: boolean;
}

// User Answer interfaces
export interface UserAnswer {
  id: number;
  quizAttempt?: QuizAttempt;
  quizAttemptId?: number;
  question?: Question;
  questionId?: number;
  questionText?: string;
  selectedAnswer?: Answer;
  selectedAnswerId?: number;
  selectedAnswerText?: string;
  correct: boolean;
  pointsEarned: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswerDto {
  id: number;
  quizAttemptId: number;
  questionId: number;
  questionText: string;
  selectedAnswerId: number;
  selectedAnswerText: string;
  correct: boolean;
  pointsEarned: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswerSummaryDto {
  questionId: number;
  questionText: string;
  selectedAnswerId: number;
  selectedAnswerText: string;
  correct: boolean;
  pointsEarned: number;
}

export interface UserAnswerCreateDto {
  quizAttemptId: number;
  questionId: number;
  selectedAnswerId: number;
}

export interface UserAnswerUpdateDto {
  selectedAnswerId: number;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'NEW_TOPIC' | 'NEW_QUIZ' | 'QUIZ_RESULT' | 'ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
  relatedId?: number;
}

// DTOs for API requests

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CreateTopicDto {
  title: string;
  description?: string;
  parentTopicId?: number;
  displayOrder?: number;
  active?: boolean;
}

export interface UserCreateDto {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    role: UserRole;
    password: string;
}

export interface UserUpdateDto {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
}

export interface PasswordResetRequest {
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface UpdateTopicDto {
  title?: string;
  description?: string;
  parentTopicId?: number;
  displayOrder?: number;
  active?: boolean;
}

export interface TopicDto {
  id: number;
  title: string;
  description: string;
  parentTopicId?: number;
  parentTopicTitle?: string;
  subTopics?: TopicSummaryDto[];
  displayOrder: number;
  active: boolean;
  hasQuiz: boolean;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDto {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  topicId: number;
  displayOrder?: number;
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  type?: ResourceType;
  url?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface CreateAnswerDto {
  answerText: string;
  correct: boolean;
  displayOrder?: number;
}

export interface CreateQuestionDto {
  questionText: string;
  explanation?: string;
  points?: number;
  displayOrder?: number;
  answers: CreateAnswerDto[];
}

export interface UpdateQuestionDto {
  questionText?: string;
  explanation?: string;
  points?: number;
  displayOrder?: number;
  active?: boolean;
  answers?: CreateAnswerDto[];
}

export interface CreateQuizDto {
  title: string;
  description: string;
  topicId: number;
  durationMinutes: number;
  passingScore: number;
  startTime?: string;
  endTime?: string;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  questionIds: number[];
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  active?: boolean;
  startTime?: string;
  endTime?: string;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  questionIds?: number[];
}

export interface StartQuizDto {
  quizId: number;
}

export interface SubmitAnswerDto {
  attemptId: number;
  questionId: number;
  answerId: number;
}

export interface SubmitQuizDto {
  attemptId: number;
}

export interface QuizStatus {
  status: 'upcoming' | 'active' | 'completed' | 'expired';
  canStart: boolean;
  timeUntilStart?: number;
  timeUntilEnd?: number;
  currentAttempt?: QuizAttempt;
  hasAttempted?: boolean;
}

// Additional helper types for frontend use
export interface QuizWithDetails extends Quiz {
  totalQuestions?: number;
  topicTitle?: string;
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quizTitle?: string;
  topicTitle?: string;
  correctAnswers?: number;
  totalQuestions?: number;
}

export interface QuizRanking {
  user: User;
  attempt: QuizAttempt;
  rank: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}
