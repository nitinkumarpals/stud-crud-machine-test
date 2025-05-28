export enum SUBJECT {
  Math = "Math",
  Science = "Science",
  English = "English",
  Social_Studies = "Social Studies",
  Art = "Art",
}

export interface Mark {
  id: string;
  subject: string;
  score: number;
  studentId: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  age: string;
  createdAt: string;
  updatedAt: string;
  marks: Mark[];
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}