export const GOAL_CATEGORIES = [
  { id: "general", name: "General", icon: "fa-solid fa-folder text-slate-400" },
  {
    id: "career",
    name: "Career & Work",
    icon: "fa-solid fa-briefcase text-blue-500",
  },
  {
    id: "health",
    name: "Health & Fitness",
    icon: "fa-solid fa-heart-pulse text-emerald-500",
  },
  {
    id: "personal",
    name: "Personal Development",
    icon: "fa-solid fa-user text-purple-500",
  },
  {
    id: "finance",
    name: "Finance & Wealth",
    icon: "fa-solid fa-wallet text-amber-500",
  },
];

export const DAILY_LOG_CATEGORIES = [
  {
    id: "journal",
    name: "Journal Entry",
    icon: "fa-solid fa-book-user text-indigo-500",
  },
  {
    id: "reflection",
    name: "Daily Reflection",
    icon: "fa-solid fa-brain text-sky-500",
  },
  {
    id: "habit_tracker",
    name: "Habits Check",
    icon: "fa-solid fa-square-check text-teal-500",
  },
  {
    id: "mood",
    name: "Mood & Energy",
    icon: "fa-solid fa-face-smile text-pink-500",
  },
];

export const TEMPLATE_CATEGORIES = [
  {
    id: "workflow",
    name: "Workflows",
    icon: "fa-solid fa-diagram-project text-cyan-500",
  },
  {
    id: "habit_routine",
    name: "Routines",
    icon: "fa-solid fa-repeat text-orange-500",
  },
  {
    id: "planning",
    name: "Planning Frameworks",
    icon: "fa-solid fa-list-check text-rose-500",
  },
];

export const TIMEFRAME_OPTIONS = [
  {
    id: "yearly",
    name: "Yearly",
    icon: "fa-solid fa-calendar-days text-purple-500",
  },
  {
    id: "monthly",
    name: "Monthly",
    icon: "fa-solid fa-calendar-range text-indigo-500",
  },
  {
    id: "weekly",
    name: "Weekly",
    icon: "fa-solid fa-calendar-week text-blue-500",
  },
  {
    id: "short_term",
    name: "Short Term",
    icon: "fa-solid fa-bolt text-amber-500",
  },
  {
    id: "medium_term",
    name: "Medium Term",
    icon: "fa-solid fa-clock text-emerald-500",
  },
  {
    id: "long_term",
    name: "Long Term",
    icon: "fa-solid fa-hourglass-end text-rose-500",
  },
];

export const GOAL_UNIT_OPTIONS = [
  {
    id: "%",
    name: "Percentage (%)",
    icon: "fa-solid fa-percent text-blue-500",
    max: 100,
    defaultValue: 100,
  },
  {
    id: "hrs",
    name: "Hours (hrs)",
    icon: "fa-solid fa-clock text-amber-500",
    max: 10000,
    defaultValue: 50,
  },
  {
    id: "km",
    name: "Kilometers (km)",
    icon: "fa-solid fa-route text-emerald-500",
    max: 50000,
    defaultValue: 10,
  },
  {
    id: "books",
    name: "Books",
    icon: "fa-solid fa-book text-indigo-500",
    max: 1000,
    defaultValue: 12,
  },
  {
    id: "tasks",
    name: "Tasks",
    icon: "fa-solid fa-check-double text-teal-500",
    max: 50000,
    defaultValue: 100,
  },
  {
    id: "money",
    name: "USD / RIAL ($ / ﷼)",
    icon: "fa-solid fa-money-bill text-green-500",
    max: 1000000000000,
    defaultValue: 1000,
  },
  {
    id: "count",
    name: "Count / Units",
    icon: "fa-solid fa-hashtag text-slate-500",
    max: 1000000,
    defaultValue: 10,
  },
];
