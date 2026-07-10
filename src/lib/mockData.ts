export const rushees = [
  {
    id: "1",
    name: "River McCorry",
    number: 1,
    major: "Mechanical Engineering",
    year: "Sophomore",
    photo:
       "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    events: ["Info Night", "Game Night", "Coffee Chats"],
    applicationSummary:
      "Interested in technology. Looking to grow professionally and be part of a close brotherhood.",
    reviews: 8,
    votedBy: ["Alex M.", "Kevin L.", "Brian T.", "Michael R."],
  },
  {
    id: "2",
    name: "Daniel Wang",
    number: 2,
    major: "Computer Science",
    year: "Sophomore",
    photo:
       "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    events: ["Professional Night", "Professional Night"],
    applicationSummary:
      "Interested in software engineering, technical development, and meeting other motivated students.",
    reviews: 5,
    votedBy: ["Alex M.", "Kevin L."],
  },
  {
    id: "3",
    name: "Eesha Atluri",
    number: 3,
    major: "Computer Science",
    year: "Sophomore",
    photo:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop",
    events: ["Info Night", "Professional Night"],
    applicationSummary:
      "Interested in product marketing, tech, and joining a strong professional community.",
    reviews: 3,
    votedBy: ["Brian T.", "Michael R."],
  },
];

export const events = [
  "Info Night",
  "Game Night",
  "Professional Night",
  "Coffee Chats",
];

export const feedback = [
  {
    id: "1",
    rusheeId: "1",
    rusheeName: "River McCorry",
    rusheeNumber: 1,
    events: ["Info Night", "Game Night"],
    communication: 4,
    passion: 5,
    cultureFit: 4,
    fitAddChoice: "Add",
    fitAddScore: 4,
    comment: "Great conversation and shows real interest in TEK.",
  },
  {
    id: "2",
    rusheeId: "2",
    rusheeName: "Daniel Wang",
    rusheeNumber: 2,
    events: ["Game Night"],
    communication: 3,
    passion: 4,
    cultureFit: 3,
    fitAddChoice: "Neither",
    fitAddScore: 0,
    comment: "Nice person",
  },
];