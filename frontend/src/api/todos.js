import api from './client';

const todosApi = {
  list:   (params) => api.get('/todos',       { params }).then((r) => r.data),
  getOne: (id)     => api.get(`/todos/${id}`).then((r) => r.data),
  create: (data)   => api.post('/todos',      data).then((r) => r.data),
  update: (id, data) => api.patch(`/todos/${id}`, data).then((r) => r.data),
  delete: (id)     => api.delete(`/todos/${id}`).then((r) => r.data),
  stats:  ()       => api.get('/todos/stats').then((r) => r.data),
};

export default todosApi;
