import { rushees } from "@/lib/mockData";

export type Rushee = {
  id: string;
  name: string;
  number: number;
  major: string;
  year: string;
  photo: string;
  events: string[];
  applicationSummary: string;
  reviews: number;
  votedBy: string[];
};

export function getStoredRushees(): Rushee[] {
  if (typeof window === "undefined") {
    return rushees;
  }

  const savedRusheesString = localStorage.getItem("tek-rushees");

  if (!savedRusheesString) {
    return rushees;
  }

  return JSON.parse(savedRusheesString);
}