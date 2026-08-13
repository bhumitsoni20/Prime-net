import { apiGet, apiPost, apiPut } from './api';

export const getSellerWallet = () => apiGet('/seller/wallet');
export const submitSellerApplication = (data) => apiPost('/seller/application', data);
