import { AxiosError } from 'axios';
import log from 'loglevel';
import { NotificationType } from './state/actions/actions.types';
import { ErrorParsing, MicroFrontendId } from './app.types';

const handleIMS_APIError = (error: AxiosError, broadcast = true): void => {
  const message = error.response?.data
    ? (error.response.data as ErrorParsing).detail ?? error.message
    : error.message;

  log.error(message);
  if (broadcast) {
    // 403 errors should be handled by the axios intercept, so shouldnt need to be checked here
    let broadcastMessage;
    // no reponse so it's a network error
    if (!error.response)
      broadcastMessage =
        'Network Error, please reload the page or try again later';
    else if (error.status === 500)
      broadcastMessage =
        'Something went wrong, please contact the system administrator';
    else broadcastMessage = message;
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message: broadcastMessage,
          },
        },
      })
    );
  }
};

export default handleIMS_APIError;
