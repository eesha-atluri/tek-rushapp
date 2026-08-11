import { rushees } from "@/lib/mockData";

export type Rushee = {
  id: string;
  name: string;
  number: number;
  major: string;
  year: string;
  gender?: string;
  photo: string;
  events: string[];
  applicationSummary: string;
  reviews: number;
  votedBy: string[];
  assignedBrotherId?: string;
};

export function normalizeRushee(rawRushee: Partial<Rushee>): Rushee {
  return {
    id: rawRushee.id || String(Date.now()),
    name: rawRushee.name || "Unnamed Rushee",
    number: rawRushee.number || 0,
    major: rawRushee.major || "",
    year: rawRushee.year || "",
    gender: rawRushee.gender || "",
    photo: rawRushee.photo || "",
    events: rawRushee.events || [],
    applicationSummary: rawRushee.applicationSummary || "",
    reviews: rawRushee.reviews || 0,
    votedBy: rawRushee.votedBy || [],
    assignedBrotherId: rawRushee.assignedBrotherId || "",
  };
}

export function getStoredRushees(): Rushee[] {
  if (typeof window === "undefined") {
    return rushees.map((rushee) => normalizeRushee(rushee));
  }

  const savedRusheesString = localStorage.getItem("tek-rushees");

  if (!savedRusheesString) {
    return rushees.map((rushee) => normalizeRushee(rushee));
  }

  return JSON.parse(savedRusheesString).map((rushee: Partial<Rushee>) =>
    normalizeRushee(rushee)
  );
}

export function saveStoredRushees(updatedRushees: Rushee[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem("tek-rushees", JSON.stringify(updatedRushees));
}