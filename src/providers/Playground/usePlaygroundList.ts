import { useApp } from '@/hooks/use-app';
import QUERY_KEY from '@/lib/constants/query-key';
import { Playground } from '@/repository/playground/entity';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export const usePlaygroundList = () => {
  const context = useApp();

  const {
    data,
    error: errorLoadingPlaygroundList,
    isLoading: isLoadingPlaygroundList,
  } = useQuery({
    queryKey: [QUERY_KEY.LOAD_STORED_PLAYGROUNDS],
    queryFn: context.repository.playground.list,
  });

  useEffect(() => {
    if (errorLoadingPlaygroundList) {
      toast.error('Failed to load playground list', {
        description: errorLoadingPlaygroundList.message,
      });
    }
  }, [errorLoadingPlaygroundList]);

  const playgroundList = useMemo(() => {
    if (!data) return [];
    return data as Playground[];
  }, [data]);

  return {
    playgroundList,
    isLoadingPlaygroundList,
    errorLoadingPlaygroundList,
  };
};
