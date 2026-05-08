export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'COMPLIANCE' | 'FEATURE' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SenderType = 'MERCHANT' | 'ADMIN';

export interface SupportAttachmentInput {
    base64: string;
    filename: string;
    mimeType: string;
}

export interface TicketAttachment {
    name: string; // inferred, URL processing might be needed
    url: string;
}

export interface SupportTicket {
    id: string;
    ticketNumber: number;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    merchantId?: string; // Visible to admin
    merchantName?: string; // Visible to admin
    assignedTo?: string; // UUID of admin
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderType: SenderType;
    senderName?: string; // e.g. "support@zitopay.com" or Merchant Name
    message: string;
    attachments: string[]; // URLs
    isInternal?: boolean; // For admin internal notes
    createdAt: string;
}

export interface CreateTicketRequest {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
    attachments?: Array<SupportAttachmentInput | string>;
}

export interface CreateTicketResponse {
    success: boolean;
    ticket: SupportTicket;
}

export interface GetTicketsResponse {
    success: boolean;
    tickets: SupportTicket[];
}

// For Admin List, response might be slightly different or include merchant info in the ticket object
export interface AdminTicketListItem {
    ticket: SupportTicket;
    merchantName: string;
}

export interface GetAdminTicketsResponse {
    success: boolean;
    tickets: AdminTicketListItem[];
}

export interface TicketDetailResponse {
    success: boolean;
    data: {
        ticket: SupportTicket;
        messages: TicketMessage[];
    };
}

export interface ReplyTicketRequest {
    message: string;
    attachments?: Array<SupportAttachmentInput | string>;
}

export interface ReplyTicketResponse {
    success: boolean;
    message: TicketMessage;
}

// Admin specific
export interface AdminReplyTicketRequest extends ReplyTicketRequest {
    isInternal?: boolean;
    newStatus?: TicketStatus;
}

export interface UpdateTicketAttributesRequest {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
}
