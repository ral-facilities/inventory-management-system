import log from 'loglevel';
import { NotificationType } from '../state/actions/actions.types';
import { CatalogueCategoryTransferState, MicroFrontendId } from '../app.types';

const handleTransferState = (
  transferStates: CatalogueCategoryTransferState[],
  broadcast = true
): void => {
  transferStates.forEach((singleTransferState) => {
    if (singleTransferState.state === 'error')
      log.error(singleTransferState.message);
    if (broadcast) {
      document.dispatchEvent(
        new CustomEvent(MicroFrontendId, {
          detail: {
            type: NotificationType, // You might want to provide a valid type here.
            payload: {
              severity: singleTransferState.state,
              message: `${singleTransferState.name}: ${singleTransferState.message}`,
            },
          },
        })
      );
    }
  });
};

export default handleTransferState;
