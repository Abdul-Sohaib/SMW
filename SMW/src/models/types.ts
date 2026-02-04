// Common types used across the application
export interface Warrior {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  platforms: string[];
  performance: number;
  tasksCompleted: number;
  rating: number;
  status: 'active' | 'inactive';
  joinDate: Date;
  socialProfiles: SocialProfile[];
  taskStats: TaskStats;
  performanceData: PerformanceData[];
  taskProofs: TaskProof[];
  warnings: Warning[];
}

export interface SocialProfile {
  platform: string;
  username: string;
  followers: number;
  verified: boolean;
}

export interface TaskStats {
  completed: number;
  pending: number;
  rejected: number;
  totalEarnings: number;
}

export interface PerformanceData {
  date: string;
  tasks: number;
  engagement: number;
}

export interface TaskProof {
  id: number;
  taskTitle: string;
  platform: string;
  timestamp: Date;
  status: 'approved' | 'pending' | 'rejected';
  imageUrl?: string;
  link: string;
}

export interface Warning {
  id: number;
  date: Date;
  reason: string;
  status: 'active' | 'resolved';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  platform: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  submissions: TaskSubmission[];
}

export interface TaskSubmission {
  id: number;
  warriorName: string;
  warriorAvatar?: string;
  warriorVerified: boolean;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'resubmit';
  imageUrl?: string;
  link: string;
  notes?: string;
}

export interface FlaggedWarrior {
  id: number;
  name: string;
  avatar?: string;
  reason: 'fake_proof' | 'missed_deadlines' | 'inactivity' | 'low_quality' | 'multiple_rejections';
  warningCount: number;
  lastActionDate: Date;
  lastActionBy: string;
  status: 'pending_review' | 'under_investigation' | 'suspended';
}