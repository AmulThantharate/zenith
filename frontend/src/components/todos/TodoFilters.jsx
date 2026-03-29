import React from 'react';
import { Input, Select } from '../ui/Input';

export default function TodoFilters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'end',
    }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <Input
          placeholder="Search todos…"
          value={filters.search}
          onChange={set('search')}
          style={{ minWidth: 0 }}
        />
      </div>
      <div style={{ flex: '1 1 140px' }}>
        <Select value={filters.priority} onChange={set('priority')}>
          <option value="all">All priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </Select>
      </div>
      <div style={{ flex: '1 1 140px' }}>
        <Select value={filters.completed} onChange={set('completed')}>
          <option value="all">All status</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </Select>
      </div>
      <div style={{ flex: '1 1 140px' }}>
        <Select value={filters.sortBy} onChange={set('sortBy')}>
          <option value="createdAt">Newest</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title A-Z</option>
        </Select>
      </div>
    </div>
  );
}
