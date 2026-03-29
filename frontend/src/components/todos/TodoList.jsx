import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from './Navbar';
import TodoCard from './TodoCard';
import TodoFilters from './TodoFilters';
import TodoForm from './TodoForm';
import ChatAssistant from '../chat/ChatAssistant';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTodos } from '../../hooks/useTodos';
import { useAuth } from '../../hooks/useAuth';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import todosApi from '../../api/todos';

const DEFAULT_FILTERS = {
  search: '', priority: 'all', completed: 'all', sortBy: 'createdAt',
};

export default function TodoList() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const { handleLogout } = useAuth();

  const {
    todos, total, isLoading, isError,
    hasNextPage, fetchNextPage, isFetchingNextPage,
    createTodo, updateTodo, deleteTodo, toggleComplete,
    isCreating, isUpdating,
  } = useTodos(filters);

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: todosApi.stats,
    staleTime: 60_000,
  });

  // Infinite scroll sentinel
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    { enabled: hasNextPage }
  );

  const handleCreate = async (data) => {
    await createTodo(data);
    setCreateOpen(false);
  };

  return (
    <>
      <Navbar stats={statsData?.data} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>My Tasks</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', fontWeight: 600 }}>
              {total} task{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: 99 }}>
            + New Task
          </Button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '1.25rem' }}>
          <TodoFilters filters={filters} onChange={setFilters} />
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 68, borderRadius: 'var(--radius)',
                background: 'var(--bg-card)', animation: 'pulse 1.5s ease infinite',
                animationDelay: `${i * 100}ms`,
              }} />
            ))}
          </div>
        ) : isError ? (
          <div style={{
            textAlign: 'center', padding: '3rem',
            color: 'var(--red)', background: 'var(--red-lo)',
            borderRadius: 'var(--radius)', border: '1px solid var(--red)',
          }}>
            Failed to load todos. Please refresh.
          </div>
        ) : todos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: 'var(--text-3)',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-2)' }}>No tasks found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {filters.search ? 'Try a different search term' : 'Create your first task above'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={toggleComplete}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                isUpdating={isUpdating}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} style={{ height: 1 }} />

            {isFetchingNextPage && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Loading more…
              </div>
            )}
          </div>
        )}
      </main>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Task">
        <TodoForm onSubmit={handleCreate} loading={isCreating} />
      </Modal>

      <ChatAssistant />
    </>
  );
}
