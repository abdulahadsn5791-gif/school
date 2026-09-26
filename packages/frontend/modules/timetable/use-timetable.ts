import {
  type CreateTimetableEntryType,
  createTimetableEntryDto,
  type DeleteTimetableEntryType,
  deleteTimetableEntryDto,
  type GetTimetableEntriesType,
  getTimetableEntriesDto,
  type UpdateTimetableEntryType,
  updateTimetableEntryDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timetableService } from './timetable.service';

export const TIMETABLE_QUERY_KEY = ['timetable'];

export function useGetTimetableEntries(params: GetTimetableEntriesType) {
  return useQuery({
    queryKey: [...TIMETABLE_QUERY_KEY, 'list', params],
    queryFn: () => timetableService.getEntries(getTimetableEntriesDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetTimetableEntryById(timetableEntryId: string) {
  return useQuery({
    queryKey: [...TIMETABLE_QUERY_KEY, timetableEntryId],
    queryFn: () => timetableService.getEntryById(timetableEntryId),
    enabled: Boolean(timetableEntryId),
  });
}

function applyTimetableMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: TIMETABLE_QUERY_KEY });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetableEntryType) =>
      timetableService.createEntry(createTimetableEntryDto.parse(data)),
    onSuccess: () => applyTimetableMutationResult(queryClient),
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTimetableEntryType) =>
      timetableService.updateEntry(updateTimetableEntryDto.parse(data)),
    onSuccess: () => applyTimetableMutationResult(queryClient),
  });
}

export function useSoftDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteTimetableEntryType) =>
      timetableService.deleteEntry(deleteTimetableEntryDto.parse(data)),
    onSuccess: () => applyTimetableMutationResult(queryClient),
  });
}

export function useRecoverTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timetableEntryId: string) => timetableService.recoverEntry(timetableEntryId),
    onSuccess: () => applyTimetableMutationResult(queryClient),
  });
}
