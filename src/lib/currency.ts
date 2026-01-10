// Nepali Rupee (NPR) currency formatting

export function formatNPR(amount: number): string {
  return `रु ${amount.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatNPRCompact(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
