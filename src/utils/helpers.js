import { GOAL_UNIT_OPTIONS } from "./constants/options-value.constants";

export const openMilestonesState = {
  milestonesMemory: new Map(),

  expandedGoalIds: new Set(),

  clear() {
    this.expandedTaskIds.clear();
    this.subtasksMemory.clear();
  },
};

export function generateId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  function getRandomHex(length) {
    let result = "";
    const chars = "0123456789abcdef";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
  }

  const timestamp = getRandomHex(32).toString(16).padStart(12, "0");
  const randomPart = getRandomHex(8);

  const timeLow = timestamp.slice(0, 8);
  const timeMid = timestamp.slice(8, 12);
  const timeHiAndVersion = "4" + getRandomHex(3);
  const clockSeqHiAndReserved = getRandomHex(3);
  const node = getRandomHex(6) + randomPart.slice(0, 6);

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}-${node}`;
}

export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return formatDate(new Date());
}

export function parseFormattedNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/,/g, "")) || 0;
}

export function formatNumberWithCommas(val) {
  if (!val && val !== 0) return "";
  const cleanNum = val.toString().replace(/\D/g, "");
  if (!cleanNum) return "";
  return parseInt(cleanNum, 10).toLocaleString("en-US");
}

export function getUnitConfig(unitId) {
  const found = GOAL_UNIT_OPTIONS.find((u) => u.id === unitId);
  return found || { max: 100000, defaultValue: 100 };
}

export function calculateGoalProgress(goal = {}) {
  const target = Math.max(1, Number(goal.targetValue) || 100);
  const current = Math.max(0, Number(goal.currentValue) || 0);

  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
  const hasMilestones = milestones.length > 0;

  const isNumericUnit = goal.unit && goal.unit !== "%";

  let progressPercent = 0;

  if (hasMilestones && !isNumericUnit) {
    const completedCount = milestones.filter((m) =>
      Boolean(m.completed),
    ).length;
    progressPercent = Math.round((completedCount / milestones.length) * 100);
  } else {
    progressPercent = Math.round((current / target) * 100);
  }

  progressPercent = Math.min(100, Math.max(0, progressPercent));

  return {
    current,
    target,
    progressPercent,
    isNumericUnit,
    isCompleted: progressPercent === 100,
    isInProgress: progressPercent > 0 && progressPercent < 100,
    hasMilestones,
  };
}
