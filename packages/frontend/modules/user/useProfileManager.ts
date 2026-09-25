import { useGetMe } from './use-user';

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function useProfileManager() {
  const { data: user, isLoading, error, refetch, isFetching } = useGetMe();

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Never';
    return dateTimeFormatter.format(new Date(date));
  };

  return {
    user,
    isLoading,
    error,
    refetch,
    isFetching,
    formatDate,
  };
}
