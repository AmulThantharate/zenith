import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from '../ui/Modal';
import TodoForm from './TodoForm';
import { Button } from '../ui/Button';

const PRIORITY_META = {
  high:   { color: 'var(--red)',    bg: 'var(--red-lo)',    label: 'High'   },
  medium: { color: 'var(--yellow)', bg: 'var(--yellow-lo)', label: 'Medium' },
  low:    { color: 'var(--green)',  bg: 'var(--green-lo)',  label: 'Low'    },
};

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dueDate, completed) {
  return !completed && dueDate && new Date(dueDate) < new Date();
}

export default function TodoCard({ todo, onToggle, onUpdate, onDelete, isUpdating }) {
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pm = PRIORITY_META[todo.priority] || PRIORITY_META.medium;
  const overdue = isOverdue(todo.due_date, todo.completed);

  const handleUpdate = async (data) => {
    await onUpdate(todo.id, data);
    setEditOpen(false);
  };

  return (
    <>
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${todo.completed ? 'var(--border)' : 'var(--border-hi)'}`,
          borderRadius: 'var(--radius)',
          padding: '1rem 1.1rem',
          transition: 'border-color var(--transition), opacity var(--transition)',
          opacity: todo.completed ? 0.55 : 1,
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = todo.completed ? 'var(--border)' : 'var(--border-hi)'}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo)}
            style={{
              width: 20, height: 20, flexShrink: 0, marginTop: 2,
              borderRadius: 6,
              border: `2px solid ${todo.completed ? 'var(--green)' : 'var(--border-hi)'}`,
              background: todo.completed ? 'var(--green-lo)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition)',
              color: 'var(--green)', fontSize: '0.7rem',
            }}
          >
            {todo.completed && '✓'}
          </button>

          {/* Title + meta */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                fontWeight: 600, fontSize: '0.9rem',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'var(--text-3)' : 'var(--text-1)',
                wordBreak: 'break-word',
              }}>
                {todo.title}
              </span>
              {/* Priority badge */}
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                padding: '0.15rem 0.5rem', borderRadius: 99,
                background: pm.bg, color: pm.color,
              }}>
                {pm.label}
              </span>
            </div>

            {/* Due date */}
            {todo.due_date && (
              <div style={{
                fontSize: '0.75rem', marginTop: '0.25rem',
                color: overdue ? 'var(--red)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {overdue ? '⚠ Overdue · ' : '📅 '}
                {formatDate(todo.due_date)}
              </div>
            )}

            {/* Tags */}
            {todo.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {todo.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.7rem', padding: '0.1rem 0.5rem',
                    borderRadius: 99, background: 'var(--accent-lo)',
                    color: 'var(--accent)', border: '1px solid var(--accent)',
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description preview */}
            {todo.description && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => setExpanded((v) => !v)}
                  style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {expanded ? '▲ Hide' : '▼ Show'} description
                </button>
                {expanded && (
                  <div style={{
                    marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-2)',
                    lineHeight: 1.65, fontFamily: 'inherit',
                  }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ node, inline, ...props }) => (
                          <code style={{
                            fontFamily: 'var(--mono)', fontSize: '0.8rem',
                            background: 'var(--bg)', padding: inline ? '0.1rem 0.3rem' : '0.75rem',
                            borderRadius: 6, display: inline ? 'inline' : 'block',
                          }} {...props} />
                        ),
                        a: ({ ...props }) => <a style={{ color: 'var(--accent)' }} target="_blank" rel="noreferrer" {...props} />,
                      }}
                    >
                      {todo.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: 'auto' }}>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(todo.id)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Del</Button>
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Todo">
        <TodoForm
          initial={todo}
          onSubmit={handleUpdate}
          loading={isUpdating}
        />
      </Modal>
    </>
  );
}
