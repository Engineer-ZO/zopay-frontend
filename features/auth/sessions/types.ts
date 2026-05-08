export interface Session {
  sessionId: string;
  createdAt: string;        // ISO datetime
  lastActivity: string;     // ISO datetime  
  deviceInfo: string;       // e.g., "Chrome 124.0.0.0 on Windows 10"
  ipAddress: string;        // e.g., "192.168.1.100"
  refreshCount: number;     // number of JWT refreshes
}

export interface GetSessionsResponse {
  success: true;
  sessions: Session[];
}

export interface ForceLogoutResponse {
  success: true;
  message: string;
}
