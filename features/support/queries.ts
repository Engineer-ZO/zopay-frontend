import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createTicket,
    getTickets,
    getTicketDetails,
    replyToTicket,
} from "./api";
import { CreateTicketRequest, ReplyTicketRequest } from "./types";

// Keys
export const supportKeys = {
    all: ["support"] as const,
    tickets: () => [...supportKeys.all, "tickets"] as const,
    ticket: (id: string) => [...supportKeys.tickets(), id] as const,
};

// Hooks

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTicketRequest) => createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
        },
    });
}

export function useTickets() {
    return useQuery({
        queryKey: supportKeys.tickets(),
        queryFn: () => getTickets(),
    });
}

export function useTicketDetails(ticketId: string) {
    return useQuery({
        queryKey: supportKeys.ticket(ticketId),
        queryFn: () => getTicketDetails(ticketId),
        enabled: !!ticketId,
    });
}

export function useReplyTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, data }: { ticketId: string; data: ReplyTicketRequest }) =>
            replyToTicket(ticketId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticket(variables.ticketId) });
        },
    });
}
