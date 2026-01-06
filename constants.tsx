
import { University, Application, Document } from './types';

// Helper to get relative dates
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'Stanford University',
    location: 'Stanford, California',
    country: 'USA',
    ranking: 3,
    programs: ['Computer Science', 'Business', 'Engineering'],
    image: 'https://picsum.photos/seed/stanford/800/400',
    tuition: '$55,000/year',
    tuitionValue: 55000,
    description: 'Stanford is a global leader in research and innovation.'
  },
  {
    id: '2',
    name: 'University of Oxford',
    location: 'Oxford',
    country: 'UK',
    ranking: 1,
    programs: ['Philosophy', 'Politics', 'Economics', 'Medicine'],
    image: 'https://picsum.photos/seed/oxford/800/400',
    tuition: '£30,000/year',
    tuitionValue: 38000,
    description: 'The oldest university in the English-speaking world.'
  },
  {
    id: '3',
    name: 'ETH Zurich',
    location: 'Zurich',
    country: 'Switzerland',
    ranking: 10,
    programs: ['Robotics', 'Architecture', 'Mathematics'],
    image: 'https://picsum.photos/seed/eth/800/400',
    tuition: 'CHF 1,500/year',
    tuitionValue: 1600,
    description: 'A top-tier technical university in the heart of Europe.'
  },
  {
    id: '4',
    name: 'University of Toronto',
    location: 'Toronto, Ontario',
    country: 'Canada',
    ranking: 18,
    programs: ['Medicine', 'Commerce', 'Data Science'],
    image: 'https://picsum.photos/seed/toronto/800/400',
    tuition: 'CAD 45,000/year',
    tuitionValue: 33000,
    description: 'Canada\'s leading university with a vibrant international community.'
  },
  {
    id: '5',
    name: 'National University of Singapore',
    location: 'Singapore',
    country: 'Singapore',
    ranking: 8,
    programs: ['Data Science', 'Engineering', 'Law'],
    image: 'https://picsum.photos/seed/nus/800/400',
    tuition: 'SGD 30,000/year',
    tuitionValue: 22000,
    description: 'A leading global university centered in Asia.'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    universityName: 'Stanford University',
    program: 'MS Computer Science',
    status: 'Under Review',
    lastUpdated: '2023-11-20',
    progress: 75,
    deadline: getFutureDate(5),
    reminderEnabled: true
  },
  {
    id: 'app2',
    universityName: 'University of Toronto',
    program: 'BSc Data Science',
    status: 'Draft',
    lastUpdated: '2023-11-25',
    progress: 20,
    deadline: getFutureDate(14),
    reminderEnabled: false
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', name: 'High School Transcript', type: 'PDF', status: 'Verified', uploadDate: '2023-10-15' },
  { id: 'doc2', name: 'IELTS/TOEFL Results', type: 'PDF', status: 'Uploaded', uploadDate: '2023-11-05' },
  { id: 'doc3', name: 'Statement of Purpose', type: 'DOCX', status: 'Missing' },
  { id: 'doc4', name: 'Passport Copy', type: 'Image', status: 'Uploaded', uploadDate: '2023-11-10' }
];
