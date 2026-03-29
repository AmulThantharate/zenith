import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import todosApi from '../api/todos';

const LIMIT = 20;

export function useTodos(filters = {}) {
  const queryClient = useQueryClient();

  // ─── Infinite Query ────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['todos', filters],
    queryFn: ({ pageParam = 1 }) =>
      todosApi.list({ ...filters, page: pageParam, limit: LIMIT }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Flatten pages into a single array
  const todos = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => { invalidate(); toast.success('Todo created!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create todo'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => todosApi.update(id, data),
    onMutate: async ({ id, data: patch }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const prev = queryClient.getQueryData(['todos', filters]);
      queryClient.setQueryData(['todos', filters], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          })),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['todos', filters], ctx.prev);
      toast.error('Failed to update todo');
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: todosApi.delete,
    onSuccess: () => { invalidate(); toast.success('Todo deleted'); },
    onError: () => toast.error('Failed to delete todo'),
  });

  const toggleComplete = useCallback(
    (todo) => updateMutation.mutate({ id: todo.id, data: { completed: !todo.completed } }),
    [updateMutation]
  );

  return {
    todos,
    total,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    createTodo: createMutation.mutateAsync,
    updateTodo: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteTodo: deleteMutation.mutate,
    toggleComplete,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
