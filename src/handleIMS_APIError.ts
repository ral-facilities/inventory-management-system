import { AxiosError } from 'axios';
import log from 'loglevel';
import { NotificationType } from './state/actions/actions.types';
import { ErrorParsing, MicroFrontendId } from './app.types';

const handleIMS_APIError = (error: AxiosError, broadcast = true): void => {
  const status = error.response?.status;
  const message = error.response?.data
    ? (error.response.data as ErrorParsing).detail ?? error.message
    : error.message;

  log.error(message);
  // Don't broadcast any error for an authentication issue - navigating via homepage links causes
  // a split second render of the page when not logged in. This would otherwise display an error
  // that is not displayed if navigating via SciGateway's navigation drawer instead (presumably
  // due to the plugin its routing from being different). It is assumed that errors of this nature
  // should not be possible due to SciGateway verifying the user itself, so we follow DataGateway's
  // approach and don't display any of these errors.
  if (broadcast && status !== 403) {
    let broadcastMessage;
    if (!error.response)
      // No response so it's a network error
      broadcastMessage =
        'Network Error, please reload the page or try again later';
    else if (status === 500)
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
