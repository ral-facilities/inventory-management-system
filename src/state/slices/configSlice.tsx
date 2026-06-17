import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  settings as IMSSettings,
  InventoryManagementSystemSettings,
} from '../../settings';
import { RootState } from '../store';

export interface ConfigState {
  loading: boolean;
  settings: InventoryManagementSystemSettings;
}

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
  maxSpreadsheetSizeBytes: 10485760,
  spreadsheetAllowedFileExtensions: ['.xlsx'],
  maxImageSizeBytes: 52428800,
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
  privilegedRoles: ['admin'],
  serialNumberPrefillEnabled: true,
  routes: [],
  pluginHost: '',
};

export const initialState: ConfigState = {
  loading: true,
  settings: initialSettings,
};

export const loadConfig = createAsyncThunk('config/load', async () => {
  const result = await IMSSettings;
  return result as InventoryManagementSystemSettings;
});

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(loadConfig.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectSettings = (state: RootState) => state.config;
export default configSlice.reducer;
