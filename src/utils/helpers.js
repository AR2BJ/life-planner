import { GOAL_UNIT_OPTIONS } from "./constants/options-value.constants";
import { getCurrentCurrencyCode } from "@/services/currency.service";

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

export function getCurrencySymbol() {
  const currencyCode = getCurrentCurrencyCode();
  const userLocale = navigator.language || "en-US";

  try {
    const parts = new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency: currencyCode,
    }).formatToParts(1);

    const symbolPart = parts.find((part) => part.type === "currency");
    return symbolPart ? symbolPart.value : currencyCode;
  } catch (e) {
    return currencyCode;
  }
}

export function formatCurrency(val) {
  const amount = parseFormattedNumber(val);
  const currencyCode = getCurrentCurrencyCode();
  const userLocale = navigator.language || "en-US";

  try {
    return new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: currencyCode === "IRR" ? 0 : 2,
    }).format(amount);
  } catch (e) {
    return `${formatNumberWithCommas(amount)} ${getCurrencySymbol()}`;
  }
}
