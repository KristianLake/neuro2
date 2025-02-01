export type PaymentOption = 'full' | 3 | 6 | 12;
export type PaymentStatus = 'success' | 'failure' | null;

export interface MonthlyOption {
  months: number;
  amount: number;
}