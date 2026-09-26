import type {
  CreateEventType,
  DeleteEventType,
  EventListResponseDto,
  EventResponseDto,
  GetEventsType,
  UpdateEventType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class EventService {
  getEvents(params: GetEventsType): Promise<EventListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.type) searchParams.set('type', params.type);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<EventListResponseDto>(`/events${query ? `?${query}` : ''}`);
  }

  getEventById(id: string): Promise<EventResponseDto> {
    return http.get<EventResponseDto>(`/events/${id}`);
  }

  createEvent(data: CreateEventType): Promise<EventResponseDto> {
    return http.post<EventResponseDto>('/events', data);
  }

  updateEvent(data: UpdateEventType): Promise<EventResponseDto> {
    return http.patch<EventResponseDto>('/events', data);
  }

  deleteEvent(data: DeleteEventType): Promise<void> {
    return http.delete<void>('/events/soft', data);
  }

  recoverEvent(eventId: string): Promise<EventResponseDto> {
    return http.patch<EventResponseDto>('/events/recover', { eventId });
  }
}

export const eventService = new EventService();
