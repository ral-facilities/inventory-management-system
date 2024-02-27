import { AxiosError } from 'axios';

const retryIMS_APIErrors = (
  failureCount: number,
  error: AxiosError
): boolean => {
  if (error.response?.status === 403 || failureCount >= 3) return false;
  return true;
};

export default retryIMS_APIErrors;
