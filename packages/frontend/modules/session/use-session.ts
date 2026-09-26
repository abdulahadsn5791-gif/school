import {
  type GetSessionsType,
  getSessionsDto,
  type IssueSessionType,
  issueSessionDto,
  type SessionIdType,
  sessionIdDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from './session.service';

export const SESSION_QUERY_KEY = ['sessions'];

export function useGetSessions(params: GetSessionsType) {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEY, 'list', params],
    queryFn: () => sessionService.getSessions(getSessionsDto.parse(params)),
    enabled: Boolean(params.userId),
  });
}

function applySessionMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
}

export function useIssueSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IssueSessionType) =>
      sessionService.issueSession(issueSessionDto.parse(data)),
    onSuccess: () => applySessionMutationResult(queryClient),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionIdType) => sessionService.revokeSession(sessionIdDto.parse(data)),
    onSuccess: () => applySessionMutationResult(queryClient),
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => sessionService.revokeAllSessions(userId),
    onSuccess: () => applySessionMutationResult(queryClient),
  });
}
