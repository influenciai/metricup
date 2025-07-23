import { StartupMetrics, StartupGoals } from "@/types/startup-metrics";

// Mock data for startup metrics
export const mockStartupGoals: StartupGoals = {
  mrrGrowthTarget: 20, // 20% growth target
  newCustomersGrowthTarget: 15, // 15% new customers growth
  maxChurnRate: 5, // max 5% churn acceptable
};

export const mockStartupMetrics: StartupMetrics[] = [
  {
    id: "1",
    month: "2024-01",
    mrr: 25000,
    churn: 3.2,
    newRevenue: 8000,
    totalRevenue: 25000,
    newCustomers: 12,
    totalCustomers: 85,
    ltv: 2400,
    burnRate: {
      technology: 8000,
      salaries: 15000,
      prolabore: 5000,
      marketing: 4000,
      administrative: 2000,
      others: 1000,
      total: 35000
    },
    createdAt: new Date("2024-01-31")
  },
  {
    id: "2", 
    month: "2024-02",
    mrr: 28500,
    churn: 2.8,
    newRevenue: 9200,
    totalRevenue: 34700,
    newCustomers: 15,
    totalCustomers: 97,
    ltv: 2650,
    burnRate: {
      technology: 8500,
      salaries: 16000,
      prolabore: 5500,
      marketing: 5000,
      administrative: 2200,
      others: 800,
      total: 38000
    },
    createdAt: new Date("2024-02-29")
  },
  {
    id: "3",
    month: "2024-03", 
    mrr: 32400,
    churn: 4.1,
    newRevenue: 10800,
    totalRevenue: 45500,
    newCustomers: 18,
    totalCustomers: 111,
    ltv: 2800,
    burnRate: {
      technology: 9000,
      salaries: 17000,
      prolabore: 6000,
      marketing: 6500,
      administrative: 2500,
      others: 1200,
      total: 42200
    },
    createdAt: new Date("2024-03-31")
  },
  {
    id: "4",
    month: "2024-04",
    mrr: 36200,
    churn: 3.5,
    newRevenue: 11500,
    totalRevenue: 57000,
    newCustomers: 20,
    totalCustomers: 127,
    ltv: 3100,
    burnRate: {
      technology: 9500,
      salaries: 18000,
      prolabore: 6500,
      marketing: 7000,
      administrative: 2800,
      others: 1000,
      total: 44800
    },
    createdAt: new Date("2024-04-30")
  },
  {
    id: "5",
    month: "2024-05",
    mrr: 41800,
    churn: 2.9,
    newRevenue: 13200,
    totalRevenue: 70200,
    newCustomers: 22,
    totalCustomers: 145,
    ltv: 3400,
    burnRate: {
      technology: 10000,
      salaries: 19500,
      prolabore: 7000,
      marketing: 8000,
      administrative: 3000,
      others: 1500,
      total: 49000
    },
    createdAt: new Date("2024-05-31")
  }
];

export const getCurrentCash = (mrr: number, burnRate: number): number => {
  return mrr - burnRate;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};