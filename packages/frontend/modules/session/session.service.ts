import type {
  GetSessionsType,
  IssueSessionType,
  SessionIdType,
  SessionListResponseDto,
  SessionResponseDto,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class SessionService {
  getSessions(params: GetSessionsType): Promise<SessionListResponseDto> {
    return http.get<SessionListResponseDto>(
      `/sessions?userId=${encodeURIComponent(params.userId)}`,
    );
  }

  issueSession(data: IssueSessionType): Promise<SessionResponseDto> {
    return http.post<SessionResponseDto>('/sessions', data);
  }

  revokeSession(data: SessionIdType): Promise<{ message: string }> {
    return http.patch<{ message: string }>('/sessions/revoke', data);
  }

  revokeAllSessions(userId: string): Promise<{ message: string }> {
    return http.patch<{ message: string }>(
      `/sessions/revoke/all?userId=${encodeURIComponent(userId)}`,
    );
  }
}

export const sessionService = new SessionService();
