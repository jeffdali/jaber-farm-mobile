import api from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('auth/login/', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('auth/me/');
    return response.data;
  },
  
  refreshToken: async (refresh: string) => {
    const response = await api.post('auth/refresh/', { refresh });
    return response.data;
  }
};

export default authService;
