const CURRENCY_STORAGE_KEY = "app_user_currency";
let inMemoryCurrency = null;

export async function initUserCurrency() {
  const cached = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (cached) {
    inMemoryCurrency = cached;
    return cached;
  }

  try {
    const response = await fetch("/api-geo/json/");
    if (!response.ok) throw new Error("Location API request failed");

    const data = await response.json();
    const currency = data.currency || "USD";

    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    inMemoryCurrency = currency;
    return currency;
  } catch (error) {
    console.warn("Currency detection failed, defaulting to USD:", error);
    inMemoryCurrency = "USD";
    return "USD";
  }
}

export function getCurrentCurrencyCode() {
  return (
    inMemoryCurrency || localStorage.getItem(CURRENCY_STORAGE_KEY) || "USD"
  );
}
