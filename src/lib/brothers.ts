export type BrotherRole = "admin" | "brother";

export type Brother = {
  id: string;
  name: string;
  email: string;
  role: BrotherRole;
};

export const brothers: Brother[] = [
  {
    id: "river",
    name: "River McCorry",
    email: "rivermcc@umich.edu",
    role: "admin",
  },
  {
    id: "brother-2",
    name: "Brother 2",
    email: "brother2@umich.edu",
    role: "brother",
  },
  {
    id: "brother-3",
    name: "Brother 3",
    email: "brother3@umich.edu",
    role: "brother",
  },
  {
    id: "brother-4",
    name: "Brother 4",
    email: "brother4@umich.edu",
    role: "brother",
  },
  {
    id: "brother-5",
    name: "Brother 5",
    email: "brother5@umich.edu",
    role: "brother",
  },
];

export function getCurrentBrother(): Brother {
  if (typeof window === "undefined") {
    return brothers[0];
  }

  const savedBrotherId = localStorage.getItem("tek-current-brother-id");

  const selectedBrother = brothers.find(
    (brother) => brother.id === savedBrotherId
  );

  return selectedBrother || brothers[0];
}

export function setCurrentBrotherId(brotherId: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem("tek-current-brother-id", brotherId);
}

export function getBrotherNameById(brotherId?: string) {
  if (!brotherId) return "Unassigned";

  return (
    brothers.find((brother) => brother.id === brotherId)?.name || "Unassigned"
  );
}