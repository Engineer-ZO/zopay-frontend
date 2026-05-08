export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "merchant" | "admin";
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: string;
}
