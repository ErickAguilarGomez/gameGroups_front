import axios, { AxiosInstance, AxiosResponse } from "axios";

// Obtener URL del backend desde variables de entorno
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Configuración base de Axios
const backendApi: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para añadir X-XSRF-TOKEN automáticamente
backendApi.interceptors.request.use(
  (config) => {
    // Obtener XSRF token de las cookies
    const token = getCookie("XSRF-TOKEN");
    if (token) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autenticado");
    }
    if (error.response?.status === 419) {
      console.error("CSRF token inválido");
    }
    return Promise.reject(error);
  }
);

// Helper para obtener cookies
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

// ========================================
// API de Autenticación
// ========================================

export const auth = {
  csrf: (): Promise<AxiosResponse> => backendApi.get("/sanctum/csrf-cookie"),

  login: (email: string, password: string): Promise<AxiosResponse> =>
    backendApi.post("/login", { email, password }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    birthdate: string;
    photo_url?: string;
  }): Promise<AxiosResponse> => backendApi.post("/register", data),

  logout: (): Promise<AxiosResponse> => backendApi.post("/logout"),

  me: (): Promise<AxiosResponse> => backendApi.get("/api/users/me"),

  updatePhoto: (photo_url: string): Promise<AxiosResponse> =>
    backendApi.post("/api/users/photo", { photo_url }),

  createToken: (
    email: string,
    password: string,
    tokenName: string
  ): Promise<AxiosResponse> =>
    backendApi.post("/api/tokens/create", {
      email,
      password,
      token_name: tokenName,
    }),
};

// ========================================
// API de Cloudinary
// ========================================

export const cloudinary = {
  getSignature: (folder: string = "user_photos"): Promise<AxiosResponse> =>
    backendApi.post("/api/cloudinary/signature", { folder }),
};

// ========================================
// API de Usuarios
// ========================================

export const users = {
  all: (params: object = {}): Promise<AxiosResponse> =>
    backendApi.get("/api/users", { params }),

  connected: (minutes: number = 5): Promise<AxiosResponse> =>
    backendApi.get("/api/users/connected", { params: { minutes } }),

  show: (id: number): Promise<AxiosResponse> =>
    backendApi.get(`/api/users/${id}`),

  update: (id: number, data: object): Promise<AxiosResponse> =>
    backendApi.put(`/api/users/${id}`, data),

  updateProfile: (data: object): Promise<AxiosResponse> =>
    backendApi.put("/api/users/profile", data),

  destroy: (id: number): Promise<AxiosResponse> =>
    backendApi.delete(`/api/users/${id}`),
};

// ========================================
// API de Tokens (gestión)
// ========================================

export const tokens = {
  list: (): Promise<AxiosResponse> => backendApi.get("/api/tokens"),

  revoke: (): Promise<AxiosResponse> => backendApi.post("/api/tokens/revoke"),

  revokeAll: (): Promise<AxiosResponse> =>
    backendApi.post("/api/tokens/revoke-all"),
};

// ========================================
// API de Revisión de Fotos
// ========================================

export const photos = {
  pending: (): Promise<AxiosResponse> => backendApi.get("/api/photos/pending"),

  approve: (userId: number): Promise<AxiosResponse> =>
    backendApi.post(`/api/photos/${userId}/approve`),

  reject: (userId: number, reason?: string): Promise<AxiosResponse> =>
    backendApi.post(`/api/photos/${userId}/reject`, { reason }),

  stats: (): Promise<AxiosResponse> => backendApi.get("/api/photos/stats"),
};

// ========================================
// API de Revisión de Registros
// ========================================

export const registrations = {
  pending: (): Promise<AxiosResponse> =>
    backendApi.get("/api/registrations/pending"),

  approve: (
    userId: number,
    photoDecision: "approve" | "reject" = "approve",
    groupId?: number
  ): Promise<AxiosResponse> =>
    backendApi.post(`/api/registrations/${userId}/approve`, {
      photo_decision: photoDecision,
      group_id: groupId,
    }),

  reject: (userId: number, reason?: string): Promise<AxiosResponse> =>
    backendApi.post(`/api/registrations/${userId}/reject`, { reason }),

  stats: (): Promise<AxiosResponse> =>
    backendApi.get("/api/registrations/stats"),
};

// ========================================
// API de Grupos
// ========================================

export const groups = {
  all: (): Promise<AxiosResponse> => backendApi.get("/api/groups"),

  create: (data: {
    name: string;
    group_img_url?: string;
  }): Promise<AxiosResponse> => backendApi.post("/api/groups", data),

  show: (id: number): Promise<AxiosResponse> =>
    backendApi.get(`/api/groups/${id}`),

  update: (
    id: number,
    data: { name?: string; group_img_url?: string }
  ): Promise<AxiosResponse> => backendApi.put(`/api/groups/${id}`, data),

  destroy: (id: number): Promise<AxiosResponse> =>
    backendApi.delete(`/api/groups/${id}`),

  assignUser: (groupId: number, userId: number): Promise<AxiosResponse> =>
    backendApi.post(`/api/groups/${groupId}/assign`, { user_id: userId }),

  removeUser: (
    groupId: number,
    userId: number,
    banReason: string
  ): Promise<AxiosResponse> =>
    backendApi.post(`/api/groups/${groupId}/remove`, {
      user_id: userId,
      ban_reason: banReason,
    }),

  usersWithoutGroup: (): Promise<AxiosResponse> =>
    backendApi.get("/api/groups/users/without-group"),

  bannedUsers: (): Promise<AxiosResponse> =>
    backendApi.get("/api/groups/users/banned"),

  unbanUser: (userId: number): Promise<AxiosResponse> =>
    backendApi.post("/api/groups/users/unban", { user_id: userId }),
};

// ========================================
// API Pública
// ========================================

export const publicApi = {
  status: (): Promise<AxiosResponse> => backendApi.get("/api/status"),
};

export default backendApi;
