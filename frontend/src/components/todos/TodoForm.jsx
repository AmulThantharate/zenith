import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';

const empty = { title: '', description: '', priority: 'medium', dueDate: '', tags: '' };

export default function TodoForm({ onSubmit, initial = {}, loading }) {
  const [form, setForm] = useState({ ...empty, ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
    dueDate: initial.due_date ? initial.due_date.slice(0, 16) : '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        label="Title *"
        placeholder="What needs to be done?"
        value={form.title}
        onChange={set('title')}
        error={errors.title}
        autoFocus
      />
      <Textarea
        label="Description"
        placeholder="Add details… (supports **Markdown**)"
        value={form.description}
        onChange={set('description')}
        rows={4}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </Select>
        <Input
          label="Due Date"
          type="datetime-local"
          value={form.dueDate}
          onChange={set('dueDate')}
        />
      </div>
      <Input
        label="Tags"
        placeholder="work, personal, urgent"
        value={form.tags}
        onChange={set('tags')}
        hint="Comma-separated"
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button type="submit" loading={loading}>
          {initial.id ? 'Save Changes' : 'Create Todo'}
        </Button>
      </div>
    </form>
  );
}
