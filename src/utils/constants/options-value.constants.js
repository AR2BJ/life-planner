export const LIFE_AREAS = [
  {
    id: "health",
    name: "Health & Fitness",
    icon: "fa-solid fa-heart-pulse text-emerald-500/80",
    class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
  },
  {
    id: "career",
    name: "Career & Work",
    icon: "fa-solid fa-briefcase text-cyan-500/80",
    class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
  },
  {
    id: "personal",
    name: "Personal Growth",
    icon: "fa-solid fa-user text-lime-500/80",
    class: "bg-lime-500/10 text-lime-500/80 border-lime-500/20",
  },
  {
    id: "finance",
    name: "Finance & Wealth",
    icon: "fa-solid fa-wallet text-violet-500/80",
    class: "bg-violet-500/10 text-violet-500/80 border-violet-500/20",
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Social",
    icon: "fa-solid fa-masks-theater text-pink-500/80",
    class: "bg-pink-500/10 text-pink-500/80 border-pink-500/20",
  },
];

export const PLAN_STATES = [
  {
    id: "active",
    name: "Active",
    icon: "fa-solid fa-play text-cyan-500/80",
    class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
  },
  {
    id: "paused",
    name: "Paused",
    icon: "fa-solid fa-pause text-yellow-500/80",
    class: "bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20",
  },
  {
    id: "completed",
    name: "Completed",
    icon: "fa-solid fa-check-double text-emerald-500/80",
    class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
  },
];

export const ENERGY_LEVEL_OPTIONS = [
  {
    value: 1,
    label: "1 - Low Energy",
    icon: "fa-solid fa-battery-empty text-red-500/80",
    class: "bg-red-500/10 text-red-500/80 border-red-500/20",
  },
  {
    value: 2,
    label: "2 - Moderate",
    icon: "fa-solid fa-battery-half text-orange-500/80",
    class: "bg-orange-500/10 text-orange-500/80 border-orange-500/20",
  },
  {
    value: 3,
    label: "3 - Normal",
    icon: "fa-solid fa-battery-half text-yellow-500/80",
    class: "bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20",
  },
  {
    value: 4,
    label: "4 - High Energy",
    icon: "fa-solid fa-battery-three-quarters text-lime-500/80",
    class: "bg-lime-500/10 text-lime-500/80 border-lime-500/20",
  },
  {
    value: 5,
    label: "5 - Peak Performance",
    icon: "fa-solid fa-battery-full text-emerald-500/80",
    class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
  },
];

export const MOOD_OPTIONS = [
  {
    value: "terrible",
    label: "Terrible",
    icon: "fa-solid fa-face-frown-open text-red-500/80",
    class: "bg-red-500/10 text-red-500/80 border-red-500/20",
  },
  {
    value: "bad",
    label: "Bad",
    icon: "fa-solid fa-face-frown text-orange-500/80",
    class: "bg-orange-500/10 text-orange-500/80 border-orange-500/20",
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: "fa-solid fa-face-meh text-yellow-500/80",
    class: "bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20",
  },
  {
    value: "good",
    label: "Good",
    icon: "fa-solid fa-face-smile text-cyan-500/80",
    class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
  },
  {
    value: "excellent",
    label: "Excellent",
    icon: "fa-solid fa-face-laugh-beam text-emerald-500/80",
    class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
  },
];

export const FILTER_OPTIONS_BY_TAB = {
  plans: [
    {
      value: "all",
      title: "All Plans",
      icon: "fa-regular fa-layer-group text-cyan-400",
      class: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      value: "active",
      title: "Active Plans",
      icon: "fa-regular fa-circle-play text-emerald-400",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      value: "paused",
      title: "Paused Plans",
      icon: "fa-regular fa-circle-pause text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    {
      value: "completed",
      title: "Completed Plans",
      icon: "fa-regular fa-circle-check text-blue-400",
      class: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
  ],
  logs: [
    {
      value: "all",
      title: "All Time Logs",
      icon: "fa-regular fa-calendar text-emerald-400",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      value: "today",
      title: "Today",
      icon: "fa-regular fa-calendar-day text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    {
      value: "this_week",
      title: "This Week",
      icon: "fa-regular fa-calendar-week text-pink-400",
      class: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
    {
      value: "this_month",
      title: "This Month",
      icon: "fa-regular fa-calendar-range text-violet-400",
      class: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
  ],
  templates: [
    {
      value: "all",
      title: "All Templates",
      icon: "fa-regular fa-layer-group text-emerald-400",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      value: "favorites",
      title: "Favorites Only",
      icon: "fa-regular fa-star text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
  ],
};

export const SORT_OPTIONS_BY_TAB = {
  plans: [
    {
      value: "date_desc",
      title: "Newest First",
      icon: "fa-regular fa-calendar-arrow-down text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    {
      value: "date_asc",
      title: "Oldest First",
      icon: "fa-regular fa-calendar-arrow-up text-violet-400",
      class: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      value: "title",
      title: "Title (A-Z)",
      icon: "fa-regular fa-arrow-down-a-z text-emerald-400",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ],
  logs: [
    {
      value: "date_desc",
      title: "Date (Newest First)",
      icon: "fa-regular fa-calendar-arrow-down text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    {
      value: "date_asc",
      title: "Date (Oldest First)",
      icon: "fa-regular fa-calendar-arrow-up text-violet-400",
      class: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
  ],
  templates: [
    {
      value: "favorites",
      title: "Favorites First",
      icon: "fa-regular fa-star text-yellow-400",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    {
      value: "title",
      title: "Title (A-Z)",
      icon: "fa-regular fa-arrow-down-a-z text-emerald-400",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      value: "date_desc",
      title: "Date Created",
      icon: "fa-regular fa-clock text-red-400",
      class: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  ],
};
