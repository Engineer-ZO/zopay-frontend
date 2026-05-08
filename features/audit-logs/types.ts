// Audit Log Types

export type ActorType = "ADMIN" | "MERCHANT";

export type SortBy = "createdAt" | "action" | "actorType";
export type SortOrder = "asc" | "desc";

export interface AuditLog {
  id: string;
  actorType: ActorType;
  actorId: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  actionDescription: string;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  entityDescription: string | null;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  createdAt: string;
}

export interface ListAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  actorTypes: string[];
  actions: string[];
  entityTypes: string[];
}

export interface GetFilterOptionsResponse {
  success: boolean;
  data: FilterOptions;
}

export interface ListAuditLogsParams {
  actorType?: ActorType;
  action?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}
