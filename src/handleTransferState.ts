import log from 'loglevel';
import { MicroFrontendId, TransferState } from './app.types';
import { NotificationType } from './state/actions/actions.types';

const handleTransferState = (
  transferStates: TransferState[],
  broadcast = true
): void => {
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
              showAllToasts: 'true',
            },
          },
        })
      );
    }
  });
};

export default handleTransferState;
