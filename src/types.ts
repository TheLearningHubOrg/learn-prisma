export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
  createdAt: string;
}

export interface CurriculumStage {
  id: number;
  title: string;
  domainFocus: string;
  completed: boolean;
  createdAt: string;
}
