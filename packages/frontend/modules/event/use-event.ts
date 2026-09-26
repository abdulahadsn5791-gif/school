import {
  type CreateEventType,
  createEventDto,
  type DeleteEventType,
  deleteEventDto,
  type GetEventsType,
  getEventsDto,
  type UpdateEventType,
  updateEventDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventService } from './event.service';

export const EVENT_QUERY_KEY = ['events'];

export function useGetEvents(params: GetEventsType) {
  return useQuery({
    queryKey: [...EVENT_QUERY_KEY, 'list', params],
    queryFn: () => eventService.getEvents(getEventsDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetEventById(eventId: string) {
  return useQuery({
    queryKey: [...EVENT_QUERY_KEY, eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: Boolean(eventId),
  });
}

function applyEventMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEY });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventType) => eventService.createEvent(createEventDto.parse(data)),
    onSuccess: () => applyEventMutationResult(queryClient),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventType) => eventService.updateEvent(updateEventDto.parse(data)),
    onSuccess: () => applyEventMutationResult(queryClient),
  });
}

export function useSoftDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteEventType) => eventService.deleteEvent(deleteEventDto.parse(data)),
    onSuccess: () => applyEventMutationResult(queryClient),
  });
}

export function useRecoverEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.recoverEvent(eventId),
    onSuccess: () => applyEventMutationResult(queryClient),
  });
}
