export interface StartupMetrics {
  id: string;
  month: string; // formato: "YYYY-MM"
  mrr: number;
  churn: number;
  newRevenue: number;
  totalRevenue: number;
  newCustomers: number;
  totalCustomers: number;
  ltv: number;
  burnRate: BurnRateCategories;
  createdAt: Date;
}

export interface BurnRateCategories {
  technology: number;
  salaries: number;
  prolabore: number;
  marketing: number;
  administrative: number;
  others: number;
  total: number;
}

export interface StartupGoals {
  mrrGrowthTarget: number; // porcentagem
  newCustomersGrowthTarget: number; // porcentagem
  maxChurnRate: number; // porcentagem
}

export interface MetricsPrediction {
  expectedMRR: number;
  expectedNewCustomers: number;
  expectedTotalCustomers: number;
  currentCash: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MonthlyReport {
  month: string;
  metrics: StartupMetrics;
  comparison: {
    mrrGrowth: number;
    customerGrowth: number;
    churnChange: number;
    revenueGrowth: number;
  };
  goalsStatus: {
    mrrOnTrack: boolean;
    customersOnTrack: boolean;
    churnAcceptable: boolean;
  };
  alerts: Alert[];
}