import api from "./api";

export interface PeriodStats {
  current_month: number;
  previous_month: number;
  current_year: number;
  previous_year: number;
}

export interface StatsResponse {
  sales: PeriodStats;
  expenses: PeriodStats;
  purchases: PeriodStats;
  profits: PeriodStats;
  animals: {
    total_alive: number;
    total_dead: number;
    by_type: { name: string; count: number }[];
    sold: PeriodStats;
    purchased: PeriodStats;
  };
}

export interface Purchase {
  id: number;
  animal: number;
  animal_details?: any;
  animal_type_name?: string;
  animal_gender?: string;
  purchase_date: string;
  purchase_price: number;
  seller_name?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  animal: number;
  animal_name?: string;
  animal_number?: string;
  sold_at: string;
  sold_price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  expense_type: "medicine" | "food" | "other";
  amount: number;
  expense_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const financeService = {
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>("stats/");
    return response.data;
  },

  // Sales
  getSales: async (
    filters: any = {},
    page: number = 1,
    returnFullResponse = false
  ): Promise<any> => {
    const params = { ...filters, page };
    const response = await api.get<any>("sales/", { params });
    if (returnFullResponse) {
      return response.data;
    }
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },
  getSale: async (id: number): Promise<Sale> => {
    const response = await api.get<Sale>(`sales/${id}/`);
    return response.data;
  },
  createSale: async (data: Partial<Sale>): Promise<Sale> => {
    const response = await api.post<Sale>("sales/", data);
    return response.data;
  },
  updateSale: async (id: number, data: Partial<Sale>): Promise<Sale> => {
    const response = await api.patch<Sale>(`sales/${id}/`, data);
    return response.data;
  },
  deleteSale: async (id: number): Promise<void> => {
    await api.delete(`sales/${id}/`);
  },

  // Expenses
  getExpenses: async (
    filters: any = {},
    page: number = 1,
    returnFullResponse = false
  ): Promise<any> => {
    const params = { ...filters, page };
    const response = await api.get<any>("expenses/", { params });
    if (returnFullResponse) {
      return response.data;
    }
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },
  getExpense: async (id: number): Promise<Expense> => {
    const response = await api.get<Expense>(`expenses/${id}/`);
    return response.data;
  },
  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    const response = await api.post<Expense>("expenses/", data);
    return response.data;
  },
  updateExpense: async (id: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.patch<Expense>(`expenses/${id}/`, data);
    return response.data;
  },
  deleteExpense: async (id: number): Promise<void> => {
    await api.delete(`expenses/${id}/`);
  },

  // Purchases
  getPurchases: async (
    filters: any = {},
    page: number = 1,
    returnFullResponse = false
  ): Promise<any> => {
    const params = { ...filters, page };
    const response = await api.get<any>("purchases/", { params });
    if (returnFullResponse) {
      return response.data;
    }
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },
  getPurchase: async (id: number): Promise<Purchase> => {
    const response = await api.get<Purchase>(`purchases/${id}/`);
    return response.data;
  },
  createPurchase: async (data: Partial<Purchase>): Promise<Purchase> => {
    const response = await api.post<Purchase>("purchases/", data);
    return response.data;
  },
  updatePurchase: async (id: number, data: Partial<Purchase>): Promise<Purchase> => {
    const response = await api.patch<Purchase>(`purchases/${id}/`, data);
    return response.data;
  },
  deletePurchase: async (id: number): Promise<void> => {
    await api.delete(`purchases/${id}/`);
  },
};
