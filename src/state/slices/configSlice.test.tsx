import { Action } from '@reduxjs/toolkit';
import { InventoryManagementSystemSettings } from '../../settings';
import reducer, { ConfigState, loadConfig } from './configSlice';

describe('configSlice', () => {
  const initialSettings: InventoryManagementSystemSettings = {
    imsApiUrl: '',
    osApiUrl: '',
    imsJsApiUrl: '',
    imsIngestApiUrl: '',
    maxAttachmentSizeBytes: 104857600,
    attachmentAllowedFileExtensions: [
      '.csv',
      '.doc',
      '.docx',
      '.pdf',
      '.rtf',
      '.txt',
      '.xls',
      '.xlsx',
    ],
    imageAllowedFileExtensions: [
      '.bmp',
      '.jpe',
      '.jpeg',
      '.jpg',
      '.png',
      '.tif',
      '.tiff',
      '.webp',
    ],
    maxImageSizeBytes: 52428800,
    privilegedRoles: ['admin'],
    routes: [],
    pluginHost: '',
  };

  const initialState: ConfigState = {
    loading: true,
    settings: initialSettings,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {} as Action)).toEqual(initialState);
  });

  it('should handle loadConfig.pending', () => {
    const action = { type: loadConfig.pending.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('should handle loadConfig.fulfilled', () => {
    const newSettings: InventoryManagementSystemSettings = {
      ...initialSettings,
      imsApiUrl: 'https://api.test.com',
    };
    const action = { type: loadConfig.fulfilled.type, payload: newSettings };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      loading: false,
      settings: newSettings,
    });
  });

  it('should handle loadConfig.rejected', () => {
    const action = { type: loadConfig.rejected.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      loading: false,
    });
  });
});
