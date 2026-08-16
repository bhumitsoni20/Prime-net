import { apiGet } from './api';

export const getPublicStats = () => apiGet('/admin/debug-stats');
