import log from 'loglevel';
import handleTransferState from './handleTransferState';
import { AnyAction } from 'redux';
import { NotificationType } from '../state/actions/actions.types';
import { CatalogueCategoryTransferState } from '../app.types';

jest.mock('loglevel');

describe('handleTransferStates', () => {
  let transferStates: CatalogueCategoryTransferState[];
  let events: CustomEvent<AnyAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    transferStates = [];
  });

  it('logs an error and sends a notification to SciGateway', () => {
    transferStates = [
      {
        name: 'test_dup',
        message:
          'A catalogue category with the same name already exists within the parent catalogue category',
        state: 'error',
      },
      {
        name: 'Wavefront Sensors',
        message: 'Successfully moved to',
        state: 'success',
      },
    ];
    handleTransferState(transferStates);

    expect(log.error).toHaveBeenCalledWith(
      'A catalogue category with the same name already exists within the parent catalogue category'
    );
    expect(events.length).toBe(2);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message:
          'test_dup: A catalogue category with the same name already exists within the parent catalogue category',
      },
    });

    expect(events[1].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'success',
        message: 'Wavefront Sensors: Successfully moved to',
      },
    });
  });
});
