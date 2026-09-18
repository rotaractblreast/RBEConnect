export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Contacted"
  | "Accepted"
  | "Waitlisted"
  | "Rejected";

export interface Application {
  rowIndex: number;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  address?: string;
  social?: string;
  organizationType: string;
  organization: string;
  rotaractStatus: string;
  why?: string;
  clubName?: string;
  journey?: string;
  hobbies?: string;
  contribute: string | string[];
  contributeOther?: string;
  status: ApplicationStatus | string;
  lastReviewer?: string;
  lastReviewedAt?: string;
  notes?: string;
}

export interface Subscriber {
  rowIndex: number;
  timestamp: string;
  email: string;
}

export interface ContactMessage {
  rowIndex: number;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Reviewer {
  email: string;
  name: string;
  role?: string;
}

export interface RawDashboardData {
  applications: Application[];
  subscribers: Subscriber[];
  contactMessages: ContactMessage[];
}

export interface FilterState {
  search: string;
  status: string;
  occupation: string;
  experience: string;
}

export type ToastType = "done" | "error" | "warning" | "info" | "lock";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
