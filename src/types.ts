export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: string;
  tags: string[];
  client: string;
  clientReputation: number;
  date: string;
  deadline: string;
  projectType: string;
  duration: string;
  applicants: number;
  teamSizeNeeded: number;
  workMode: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  rolesNeeded: string[];
  lead: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  major: string;
  skills: string[];
  reputation: number;
  availability?: string;
  image?: string;
}
