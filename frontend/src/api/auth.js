import api from './client';

const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login:    (data) => api.post('/auth/login',    data).then((r) => r.data),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout:   (refreshToken) => api.post('/auth/logout',  { refreshToken }).then((r) => r.data),
  me:       () => api.get('/auth/me').then((r) => r.data),
};

export default authApi;
