export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FCFA`;
}
