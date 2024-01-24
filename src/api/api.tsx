import axios from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';

export const imsApi = axios.create();

imsApi.interceptors.request.use(async (config) => {
  const apiUrl = (await settings)?.apiUrl || '';
  config.baseURL = apiUrl;
  config.headers['Authorization'] = `Bearer ${readSciGatewayToken()}`;
  return config;
});
