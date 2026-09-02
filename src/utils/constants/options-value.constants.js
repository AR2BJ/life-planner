export const GOAL_CATEGORIES = [
  {
    id: "general",
    name: "General",
    icon: "fa-solid fa-folder text-yellow-500/80",
  },
  {
    id: "health",
    name: "Health & Fitness",
    icon: "fa-solid fa-heart-pulse text-emerald-500/80",
  },
  {
    id: "career",
    name: "Career & Work",
    icon: "fa-solid fa-briefcase text-cyan-500/80",
  },
  {
    id: "personal",
    name: "Personal Development",
    icon: "fa-solid fa-user text-lime-500/80",
  },
  {
    id: "finance",
    name: "Finance & Wealth",
    icon: "fa-solid fa-wallet text-violet-500/80",
  },
  {
    id: "education",
    name: "Education & Learning",
    icon: "fa-solid fa-graduation-cap text-pink-500/80",
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Social",
    icon: "fa-solid fa-masks-theater text-red-500/80",
  },
];

export const DAILY_LOG_CATEGORIES = [
  {
    id: "journal",
    name: "Journal Entry",
    icon: "fa-solid fa-book-user text-yellow-500/80",
  },
  {
    id: "reflection",
    name: "Daily Reflection",
    icon: "fa-solid fa-brain text-emerald-500/80",
  },
  {
    id: "activity_log",
    name: "Activity Log",
    icon: "fa-solid fa-list-check text-cyan-500/80",
  },
  {
    id: "mood",
    name: "Mood & Energy",
    icon: "fa-solid fa-face-smile text-lime-500/80",
  },
  {
    id: "gratitude",
    name: "Gratitude & Wins",
    icon: "fa-solid fa-sun text-violet-500/80",
  },
  {
    id: "notes",
    name: "Quick Notes",
    icon: "fa-solid fa-note-sticky text-pink-500/80",
  },
  {
    id: "review",
    name: "Nightly Review",
    icon: "fa-solid fa-moon text-red-500/80",
  },
];

export const TEMPLATE_CATEGORIES = [
  {
    id: "workflow",
    name: "Workflows",
    icon: "fa-solid fa-diagram-project text-yellow-500/80",
  },
  {
    id: "routine",
    name: "Daily Routines",
    icon: "fa-solid fa-repeat text-emerald-500/80",
  },
  {
    id: "planning",
    name: "Planning Frameworks",
    icon: "fa-solid fa-sliders text-cyan-500/80",
  },
  {
    id: "project_structure",
    name: "Project Structure",
    icon: "fa-solid fa-sitemap text-lime-500/80",
  },
  {
    id: "review_checklist",
    name: "Review Checklists",
    icon: "fa-solid fa-clipboard-check text-violet-500/80",
  },
  {
    id: "event_blueprint",
    name: "Event Blueprints",
    icon: "fa-solid fa-calendar-plus text-pink-500/80",
  },
  {
    id: "meeting_agenda",
    name: "Meeting Agendas",
    icon: "fa-solid fa-comments text-red-500/80",
  },
];

export const TIMEFRAME_OPTIONS = [
  {
    id: "yearly",
    name: "Yearly",
    icon: "fa-solid fa-calendar-days text-violet-500/80",
  },
  {
    id: "monthly",
    name: "Monthly",
    icon: "fa-solid fa-calendar-range text-pink-500/80",
  },
  {
    id: "weekly",
    name: "Weekly",
    icon: "fa-solid fa-calendar-week text-blue-500/80",
  },
  {
    id: "short_term",
    name: "Short Term",
    icon: "fa-solid fa-bolt text-amber-500/80",
  },
  {
    id: "medium_term",
    name: "Medium Term",
    icon: "fa-solid fa-clock text-emerald-500/80",
  },
  {
    id: "long_term",
    name: "Long Term",
    icon: "fa-solid fa-hourglass-end text-red-500/80",
  },
  {
    id: "lifetime",
    name: "Lifetime / Milestone",
    icon: "fa-solid fa-infinity text-cyan-500/80",
  },
];

export const GOAL_PRIORITY_OPTIONS = [
  {
    id: "low",
    name: "Low Priority",
    icon: "fa-solid fa-flag text-lime-400",
  },
  {
    id: "medium",
    name: "Medium Priority",
    icon: "fa-solid fa-flag text-amber-400",
  },
  {
    id: "high",
    name: "High Priority",
    icon: "fa-solid fa-flag text-red-400",
  },
];

export const DAILY_MOOD_OPTIONS = [
  {
    id: "great",
    name: "Great",
    icon: "fa-solid fa-face-smile-beam text-emerald-500/80",
  },
  {
    id: "good",
    name: "Good",
    icon: "fa-solid fa-face-smile text-cyan-500/80",
  },
  {
    id: "neutral",
    name: "Neutral",
    icon: "fa-solid fa-face-meh text-brand/80",
  },
  {
    id: "bad",
    name: "Bad",
    icon: "fa-solid fa-face-frown text-red-500/80",
  },
];

export const GOAL_UNIT_OPTIONS = [
  {
    id: "%",
    name: "Percentage (%)",
    icon: "fa-solid fa-percent text-blue-500/80",
    max: 100,
    defaultValue: 100,
  },
  {
    id: "hrs",
    name: "Hours (hrs)",
    icon: "fa-solid fa-clock text-amber-500/80",
    max: 10000,
    defaultValue: 50,
  },
  {
    id: "km",
    name: "Kilometers (km)",
    icon: "fa-solid fa-route text-emerald-500/80",
    max: 50000,
    defaultValue: 10,
  },
  {
    id: "books",
    name: "Books",
    icon: "fa-solid fa-book text-fuchsia-500/80",
    max: 1000,
    defaultValue: 12,
  },
  {
    id: "sessions",
    name: "Sessions / Milestones",
    icon: "fa-solid fa-flag-checkered text-red-500/80",
    max: 50000,
    defaultValue: 100,
  },
  {
    id: "money",
    name: "USD / RIAL ($ / ﷼)",
    icon: "fa-solid fa-money-bill text-cyan-500/80",
    max: 1000000000000,
    defaultValue: 1000,
  },
  {
    id: "count",
    name: "Count / Units",
    icon: "fa-solid fa-hashtag text-pink-500/80",
    max: 1000000,
    defaultValue: 10,
  },
];

export const FILTER_OPTIONS_BY_TAB = {
  goals: [
    {
      value: "all",
      title: "All Timeframes & Dates",
      icon: "fa-regular fa-calendar text-cyan-400",
    },
    {
      value: "today",
      title: "Due Today",
      icon: "fa-regular fa-calendar-day text-orange-400",
    },
    {
      value: "completed",
      title: "Completed / Done Goals",
      icon: "fa-regular fa-circle-check text-emerald-400",
    },
    {
      value: "overdue",
      title: "Overdue Goals",
      icon: "fa-regular fa-clock text-red-400",
    },
    {
      value: "yearly",
      title: "Yearly Goals",
      icon: "fa-regular fa-calendar-days text-violet-400",
    },
    {
      value: "monthly",
      title: "Monthly Goals",
      icon: "fa-regular fa-calendar-range text-pink-400",
    },
    {
      value: "weekly",
      title: "Weekly Goals",
      icon: "fa-regular fa-calendar-week text-blue-400",
    },
    {
      value: "short_term",
      title: "Short Term",
      icon: "fa-regular fa-bolt text-yellow-400",
    },
    {
      value: "medium_term",
      title: "Medium Term",
      icon: "fa-regular fa-clock text-emerald-400",
    },
    {
      value: "long_term",
      title: "Long Term",
      icon: "fa-regular fa-hourglass-end text-fuchsia-400",
    },
    {
      value: "lifetime",
      title: "Lifetime / Milestone",
      icon: "fa-regular fa-infinity text-teal-400",
    },
  ],
  daily: [
    {
      value: "all",
      title: "All Logs",
      icon: "fa-regular fa-calendar text-emerald-400",
    },
    {
      value: "today",
      title: "Today",
      icon: "fa-regular fa-calendar-day text-yellow-400",
    },
    {
      value: "yesterday",
      title: "Yesterday",
      icon: "fa-regular fa-calendar-minus text-cyan-400",
    },
    {
      value: "this_week",
      title: "This Week",
      icon: "fa-regular fa-calendar-week text-pink-400",
    },
    {
      value: "this_month",
      title: "This Month",
      icon: "fa-regular fa-calendar-range text-violet-400",
    },
    {
      value: "this_year",
      title: "This Year",
      icon: "fa-regular fa-calendar-days text-fuchsia-400",
    },
  ],
  templates: [
    {
      value: "all",
      title: "All Templates",
      icon: "fa-regular fa-layer-group text-emerald-400",
    },
    {
      value: "favorites",
      title: "Favorites Only",
      icon: "fa-regular fa-star text-yellow-400",
    },
  ],
};

export const SORT_OPTIONS_BY_TAB = {
  goals: [
    {
      value: "priority",
      title: "Priority (High to Low)",
      icon: "fa-regular fa-arrow-down-short-wide text-yellow-400",
    },
    {
      value: "progress_desc",
      title: "Progress (High to Low)",
      icon: "fa-regular fa-chart-line text-emerald-400",
    },
    {
      value: "progress_asc",
      title: "Progress (Low to High)",
      icon: "fa-regular fa-chart-line-down text-cyan-400",
    },
    {
      value: "dueDate",
      title: "Due Date",
      icon: "fa-regular fa-calendar text-blue-400",
    },
    {
      value: "completedAt",
      title: "Completion Date",
      icon: "fa-regular fa-calendar-check text-emerald-400",
    },
    {
      value: "createdAt",
      title: "Date Created",
      icon: "fa-regular fa-clock text-red-400",
    },
    {
      value: "title",
      title: "Title (A-Z)",
      icon: "fa-regular fa-arrow-down-a-z text-violet-400",
    },
  ],
  daily: [
    {
      value: "date_desc",
      title: "Date (Newest First)",
      icon: "fa-regular fa-calendar-arrow-down text-yellow-400",
    },
    {
      value: "date_asc",
      title: "Date (Oldest First)",
      icon: "fa-regular fa-calendar-arrow-up text-violet-400",
    },
    {
      value: "createdAt",
      title: "Date Created",
      icon: "fa-regular fa-clock text-red-400",
    },
    {
      value: "title",
      title: "Title (A-Z)",
      icon: "fa-regular fa-arrow-down-a-z text-emerald-400",
    },
  ],
  templates: [
    {
      value: "favorites",
      title: "Favorites First",
      icon: "fa-regular fa-star text-yellow-400",
    },
    {
      value: "title",
      title: "Title (A-Z)",
      icon: "fa-regular fa-arrow-down-a-z text-emerald-400",
    },
    {
      value: "createdAt",
      title: "Date Created",
      icon: "fa-regular fa-clock text-red-400",
    },
  ],
};
