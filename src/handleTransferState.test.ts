import log from 'loglevel';
import { UnknownAction } from 'redux';
import { TransferState } from './app.types';
import handleTransferState from './handleTransferState';
import { NotificationType } from './state/actions/actions.types';

vi.mock('loglevel');

describe('handleTransferStates', () => {
  let transferStates: TransferState[];
  let events: CustomEvent<UnknownAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<UnknownAction>);
      return true;
    };

    transferStates = [];
  });

  it('logs an error and sends a notification to SciGateway if broadcast is true', () => {
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
        instant: true,
      },
    });

    expect(events[1].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'success',
        message: 'Wavefront Sensors: Successfully moved to',
        instant: true,
      },
    });
  });

  it('logs an error and sends a notification to SciGateway if broadcast is false', () => {
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
    handleTransferState(transferStates, false);

    expect(log.error).toHaveBeenCalledWith(
      'A catalogue category with the same name already exists within the parent catalogue category'
    );
    expect(events.length).toBe(0);
  });
});
