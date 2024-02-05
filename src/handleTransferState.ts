import log from 'loglevel';
import {
  InvalidateTokenType,
  NotificationType,
} from './state/actions/actions.types';
import { TransferState, MicroFrontendId } from './app.types';

const handleTransferState = (
  transferStates: TransferState[],
  broadcast = true
): void => {
  const has403Error =
    transferStates.filter((state) => state.message === '403').length >= 1;
  if (has403Error) {
    log.error('Your session has expired');
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: InvalidateTokenType,
          ...(broadcast
            ? {
                payload: {
                  severity: 'error',
                  message: 'Your session has expired, please login again',
                },
              }
            : {}),
        },
      })
    );
  } else {
    transferStates.forEach((singleTransferState) => {
      if (singleTransferState.state === 'error')
        log.error(singleTransferState.message);
      if (broadcast) {
        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, {
            detail: {
              type: NotificationType,
              payload: {
                severity: singleTransferState.state,
                message: `${singleTransferState.name}: ${singleTransferState.message}`,
              },
            },
          })
        );
      }
    });
  }
};

export default handleTransferState;
