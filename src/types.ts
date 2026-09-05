export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: number;
}

export interface ReflectionInsight {
  mainTheme: string;
  emotionalTone: string;
  keyObservation: string;
  actionableReflection: string;
  generatedAt: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  messages: JournalMessage[];
  reflection?: ReflectionInsight;
  createdAt: number;
  updatedAt: number;
}

export interface ChatApiRequest {
  history: Array<{ role: 'user' | 'model'; content: string }>;
  prompt: string;
  existingTitle?: string;
}

export interface ChatApiResponse {
  response: string;
  summary?: string;
  title?: string;
}

export interface ReflectionApiRequest {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
}

export interface ReflectionApiResponse {
  insight: ReflectionInsight;
}
