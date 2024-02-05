import log from 'loglevel';
import handleTransferState from './handleTransferState';
import { AnyAction } from 'redux';
import {
  InvalidateTokenType,
  NotificationType,
} from './state/actions/actions.types';
import { TransferState } from './app.types';

jest.mock('loglevel');

describe('handleTransferStates', () => {
  let transferStates: TransferState[];
  let events: CustomEvent<AnyAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
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

  it('logs an error and sends a notification to SciGateway (403)', () => {
    transferStates = [
      {
        name: 'test_dup',
        message: '403',
        state: 'error',
      },
      {
        name: 'Wavefront Sensors',
        message: 'Successfully moved to',
        state: 'success',
      },
    ];
    handleTransferState(transferStates);

    expect(log.error).toHaveBeenCalledWith('Your session has expired');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
      payload: {
        severity: 'error',
        message: 'Your session has expired, please login again',
      },
    });
  });

  it('logs an error and sends a notification to SciGateway (403) if broadcast is true', () => {
    transferStates = [
      {
        name: 'test_dup',
        message: '403',
        state: 'error',
      },
      {
        name: 'Wavefront Sensors',
        message: 'Successfully moved to',
        state: 'success',
      },
    ];
    handleTransferState(transferStates, false);

    expect(log.error).toHaveBeenCalledWith('Your session has expired');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
    });
  });
});
