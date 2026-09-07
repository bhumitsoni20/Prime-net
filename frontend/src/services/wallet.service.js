import api, { apiGet, apiPost } from './api';

// Buyer Wallet Endpoints
export const getBuyerWallet = async () => {
  return await apiGet('/wallet/me');
};

export const requestTopup = async ({ amount, screenshot, upiReference }) => {
  return await apiPost('/wallet/topup', { amount, screenshot, upiReference });
};

export const requestWithdrawal = async ({ amount, upiId, beneficiaryName }) => {
  return await apiPost('/wallet/withdraw', { amount, upiId, beneficiaryName });
};

// Admin Wallet & Refund Endpoints
export const getAdminWalletTopups = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiGet(`/admin/wallet/topups${query ? `?${query}` : ''}`);
};

export const getAdminWalletTopupById = async (id) => {
  return await apiGet(`/admin/wallet/topups/${id}`);
};

export const approveWalletTopup = async (id) => {
  return await apiPost(`/admin/wallet/topups/${id}/approve`, {});
};

export const rejectWalletTopup = async (id, rejectionReason) => {
  return await apiPost(`/admin/wallet/topups/${id}/reject`, { rejectionReason });
};

export const getAdminBuyerRefunds = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiGet(`/admin/wallet/refunds${query ? `?${query}` : ''}`);
};

export const approveBuyerRefund = async (id, { transactionReference, adminNote } = {}) => {
  return await apiPost(`/admin/wallet/refunds/${id}/approve`, { transactionReference, adminNote });
};

export const rejectBuyerRefund = async (id, { rejectionReason, adminNote } = {}) => {
  return await apiPost(`/admin/wallet/refunds/${id}/reject`, { rejectionReason, adminNote });
};
