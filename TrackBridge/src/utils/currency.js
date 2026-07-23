
export function formatNaira(amount, { decimals = false } = {}) {
  const value = Number(amount) || 0;
  const formatted = value.toLocaleString("en-NG", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
  return `₦${formatted}`;
}

export const CURRENCY_SYMBOL = "₦";
export const CURRENCY_CODE = "NGN";
