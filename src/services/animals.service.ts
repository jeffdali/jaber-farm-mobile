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
  purchase_price?: number;
  purchase_date?: string;
  seller_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnimalFilters {
  animal_type?: number;
  gender?: string;
  status?: string;
  search?: string;
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

  getAnimals: async (filters: AnimalFilters = {}) => {
    const params = {
      ...filters,
      status: filters.status || 'existing', // Default to existing (live) as requested
    };
    const response = await api.get('animals/', { params });
    if (response.data.results) {
      return response.data.results;
    }
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
  }
};
