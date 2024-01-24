import { AxiosError } from 'axios';
import log from 'loglevel';
import handleIMS_APIError from './handleIMS_APIError';
import { UnknownAction } from 'redux';
import {
  NotificationType,
  InvalidateTokenType,
} from './state/actions/actions.types';

jest.mock('loglevel');

describe('handleIMS_APIError', () => {
  let error: AxiosError;
  let events: CustomEvent<UnknownAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<UnknownAction>);
      return true;
    };

    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: { detail: 'Test error message (response data)' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs an error and sends a notification to SciGateway', () => {
    handleIMS_APIError(error);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message (response data)',
      },
    });
  });

  it('logs fallback error.message if there is no response message', () => {
    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };

    handleIMS_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Test error message');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message',
      },
    });
  });

  it('logs network error message if there is no response', () => {
    error = {
      isAxiosError: true,
      config: {},
      name: 'Test error name',
      message: 'Network Error',
      toJSON: jest.fn(),
    };

    handleIMS_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Network Error');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Network Error, please reload the page or try again later',
      },
    });
  });

  it('just logs an error if broadcast is false', () => {
    handleIMS_APIError(error, false);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(0);
  });

  describe('sends messages to SciGateway on authentication error', () => {
    const localStorageGetItemMock = jest.spyOn(
      window.localStorage.__proto__,
      'getItem'
    );

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('just sends invalidate token message if broadcast is false', () => {
      error.response.status = 403;
      handleIMS_APIError(error, false);

      expect(log.error).toHaveBeenCalledWith(
        'Test error message (response data)'
      );
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
      });
    });

    describe('sends invalidate token message and notifies user to reload the page if autoLogin true', () => {
      beforeEach(() => {
        localStorageGetItemMock.mockImplementation(() => 'true');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('if error code is 403', () => {
        error.response.status = 403;
        handleIMS_APIError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Test error message (response data)'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(1);
        expect(events[0].detail).toEqual({
          type: InvalidateTokenType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please reload the page',
          },
        });
      });
    });

    describe('sends invalidate token message and notifies user to login again if autoLogin false', () => {
      beforeEach(() => {
        localStorageGetItemMock.mockImplementation(() => 'false');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('if error code is 403', () => {
        error.response.status = 403;
        handleIMS_APIError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Test error message (response data)'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(1);
        expect(events[0].detail).toEqual({
          type: InvalidateTokenType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please login again',
          },
        });
      });
    });
  });
});
