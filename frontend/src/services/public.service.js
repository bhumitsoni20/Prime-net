import { apiGet } from './api';

export const getPublicStats = () => apiGet('/public/stats');
