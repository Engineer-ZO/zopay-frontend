import { apiClient } from "@/lib/apiClient";
import {
    CreateTicketRequest,
    CreateTicketResponse,
    GetTicketsResponse,
    TicketDetailResponse,
    ReplyTicketRequest,
    ReplyTicketResponse,
} from "./types";

const MERCHANT_BASE_URL = "/merchant/v1/support";

/**
 * Create a new support ticket
 */
export const createTicket = async (data: CreateTicketRequest): Promise<CreateTicketResponse> => {
    const response = await apiClient.post<CreateTicketResponse>(`${MERCHANT_BASE_URL}/tickets`, data);
    return response.data;
};

/**
 * Get all tickets for the current merchant
 */
export const getTickets = async (): Promise<GetTicketsResponse> => {
    const response = await apiClient.get<GetTicketsResponse>(`${MERCHANT_BASE_URL}/tickets`);
    return response.data;
};

/**
 * Get ticket details and messages
 */
export const getTicketDetails = async (ticketId: string): Promise<TicketDetailResponse> => {
    const response = await apiClient.get<TicketDetailResponse>(`${MERCHANT_BASE_URL}/tickets/${ticketId}`);
    return response.data;
};

/**
 * Reply to a ticket
 */
export const replyToTicket = async (ticketId: string, data: ReplyTicketRequest): Promise<ReplyTicketResponse> => {
    const response = await apiClient.post<ReplyTicketResponse>(
        `${MERCHANT_BASE_URL}/tickets/${ticketId}/reply`,
        data
    );
    return response.data;
};
