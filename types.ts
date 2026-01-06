
export interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  ranking: number;
  programs: string[];
  image: string;
  tuition: string;
  tuitionValue: number; // Numeric value for filtering (in USD equivalent)
  description: string;
}

export interface Application {
  id: string;
  universityName: string;
  program: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  lastUpdated: string;
  progress: number;
  deadline?: string; // ISO string for the application deadline
  reminderEnabled?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  gpa: string;
  targetMajor: string;
  preferredCountries: string[];
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: 'Missing' | 'Uploaded' | 'Verified';
  uploadDate?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
