import { apiGet, apiPut, apiDelete } from './api';

export const getDashboardStats = () => apiGet('/admin/stats');
export const getUsers = (page = 1, limit = 20) => apiGet(`/admin/users?page=${page}&limit=${limit}`);
export const updateUserRole = (id, role) => apiPut(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => apiDelete(`/admin/users/${id}`);
export const getAllProducts = (page = 1, limit = 20) => apiGet(`/admin/products?page=${page}&limit=${limit}`);
export const updateProductStatus = (id, status) => apiPut(`/admin/products/${id}/status`, { status });
export const deleteProductAdmin = (id) => apiDelete(`/admin/products/${id}`);
export const getAllOrders = (page = 1, limit = 20) => apiGet(`/admin/orders?page=${page}&limit=${limit}`);
export const getApplications = (page = 1, limit = 20) => apiGet(`/admin/applications?page=${page}&limit=${limit}`);
export const updateApplicationStatus = (id, status) => apiPut(`/admin/applications/${id}/status`, { status });
