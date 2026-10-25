export type Role = "STUDENT" | "MENTOR";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Feedback {
  id: string;
  message: string;
  createdAt: string;
  mentor: { name: string };
}

export interface Submission {
  id: string;
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  status: SubmissionStatus;
  createdAt: string;
  feedbacks: Feedback[];
  student?: { id: string; name: string; email: string };
}