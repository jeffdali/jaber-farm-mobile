import api from './api';

export interface AnimalType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: number;
  name: string;
  gender: 'male' | 'female';
  animal_number: string;
  animal_type: number;
  animal_type_name: string;
  birth_date: string;
  mother: number | null;
  weight: number | null;
  head_price: number | null;
  breeder_notes: string;
  color: string;
  status: 'existing' | 'sold' | 'dead';
  age: string;
  purchase_id?: number;
  purchase_price?: number;
  purchase_date?: string;
  seller_name?: string;
  mother_name?: string;
  mother_number?: string;
  is_pregnant: boolean;
  has_pending_pregnancy: boolean;
  has_active_pregnancy: boolean;
  current_pregnancy_status: 'pending' | 'success' | 'cancelled' | 'delivered' | null;
  offspring_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PregnancyTracking {
  id: number;
  animal: number;
  status: 'pending' | 'success' | 'cancelled' | 'delivered';
  status_display: string;
  date_started: string;
  date_confirmed?: string;
  expected_delivery_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AnimalFilters {
  animal_type?: number;
  gender?: string;
  status?: string;
  search?: string;
  is_pregnant?: boolean;
  has_active_pregnancy?: boolean;
  pregnancy_status?: string;
  birth_date_min?: string;
  birth_date_max?: string;
  weight_min?: string;
  weight_max?: string;
  head_price_min?: string;
  head_price_max?: string;
  color?: string;
  animal_number?: string;
}

export interface BreederNote {
  id: number;
  animal: number;
  note: string;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export const animalsService = {
  getAnimalTypes: async () => {
    const response = await api.get('types/');
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },

  createAnimalType: async (data: { name: string }) => {
    const response = await api.post('types/', data);
    return response.data;
  },
  
  updateAnimalType: async (id: number, data: Partial<Omit<AnimalType, "id" | "created_at" | "updated_at">>) => {
    const response = await api.patch(`types/${id}/`, data);
    return response.data;
  },

  deleteAnimalType: async (id: number) => {
    await api.delete(`types/${id}/`);
  },

  getAnimals: async (
    filters: AnimalFilters = {},
    page: number = 1,
    returnFullResponse = false,
  ) => {
    const params: any = {
      ...filters,
      page,
    };

    // Handle status default 'existing'. If 'all' is passed, remove the filter.
    if (!filters.status) {
      params.status = "existing";
    } else if (filters.status === "all") {
      delete params.status;
    }

    const response = await api.get("animals/", { params });
    if (returnFullResponse) {
      return response.data;
    }
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },

  getAllAnimals: async (filters: AnimalFilters = {}): Promise<Animal[]> => {
    const params: any = {
      ...filters,
      no_pagination: "true",
    };

    // Handle status default 'existing'.
    if (!filters.status) {
      params.status = "existing";
    } else if (filters.status === "all") {
      delete params.status;
    }

    const response = await api.get("animals/", { params });
    // When pagination is disabled, DRF returns the array directly
    return response.data;
  },

  getAnimal: async (id: number) => {
    const response = await api.get(`animals/${id}/`);
    return response.data;
  },

  createAnimal: async (data: Partial<Animal>) => {
    const response = await api.post('animals/', data);
    return response.data;
  },

  updateAnimal: async (id: number, data: Partial<Animal>) => {
    const response = await api.patch(`animals/${id}/`, data);
    return response.data;
  },

  deleteAnimal: async (id: number) => {
    await api.delete(`animals/${id}/`);
  },

  checkDeletion: async (id: number) => {
    const response = await api.get(`animals/${id}/check_deletion/`);
    return response.data;
  },

  getOffspring: async (id: number): Promise<Animal[]> => {
    const response = await api.get(`animals/${id}/offspring/`);
    return response.data;
  },

  getNotes: async (animalId: number) => {
    const response = await api.get('notes/', { params: { animal: animalId } });
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },

  createNote: async (data: Partial<BreederNote>) => {
    const response = await api.post('notes/', data);
    return response.data;
  },

  updateNote: async (id: number, data: Partial<BreederNote>) => {
    const response = await api.patch(`notes/${id}/`, data);
    return response.data;
  },

  deleteNote: async (id: number) => {
    await api.delete(`notes/${id}/`);
  },

  getPregnancyRecords: async (animalId: number) => {
    const response = await api.get('pregnancy/', { params: { animal: animalId } });
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  },

  createPregnancyRecord: async (data: Partial<PregnancyTracking>) => {
    const response = await api.post('pregnancy/', data);
    return response.data;
  },

  updatePregnancyRecord: async (id: number, data: Partial<PregnancyTracking>) => {
    const response = await api.patch(`pregnancy/${id}/`, data);
    return response.data;
  },

  deletePregnancyRecord: async (id: number) => {
    await api.delete(`pregnancy/${id}/`);
  }
};
