import { renderHook } from '@testing-library/react';
import Uppy, { type Body, type Meta, type UppyFile } from '@uppy/core';
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePostImage } from '../api/images';
import { server } from '../mocks/server';
import { hooksWrapperWithProviders } from '../testUtils';
import AxiosUpload from './UppyAxiosUpload';

describe('AxiosUpload', () => {
  let uppy: Uppy<Meta, Body>;
  let plugin: AxiosUpload<Meta, Body>;
  let file: UppyFile<Meta, Body>;

  const { result } = renderHook(() => usePostImage(), {
    wrapper: hooksWrapperWithProviders(),
  });

  beforeEach(() => {
    uppy = new Uppy<Meta, Body>();

    uppy.use(AxiosUpload, {
      endpoint: `/images`,
      fieldName: 'upload_file',
      mutation: result.current,
    });

    plugin = uppy.getPlugin('AxiosUpload') as AxiosUpload<Meta, Body>;

    file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      meta: { type: 'text/plain', name: 'test.txt' },
      id: 'file1',
      extension: 'txt',
      isGhost: false,
      isRemote: false,
      progress: {
        uploadStarted: null,
        uploadComplete: false,
        percentage: 0,
        bytesUploaded: false,
        bytesTotal: null,
      },
      size: 11,
      type: 'text/plain',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default options', () => {
    expect(plugin?.opts).toEqual({
      endpoint: '/images',
      allowedMetaFields: true,
      fieldName: 'upload_file',
      limit: 5,
      timeout: 30000,
      mutation: expect.anything(),
    });
  });

  it('should create form data upload correctly', () => {
    const formData = plugin?.createFormDataUpload(file, plugin.opts);
    expect(formData.get('upload_file')).toBeInstanceOf(Blob);
    expect((formData.get('upload_file') as Blob)?.type).toBe('text/plain');
  });

  it('should handle upload success', async () => {
    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    await plugin.handleUpload(fileIDs);
    expect(uppy.getFile(fileIDs[0]).progress.uploadStarted).toBeDefined();
    expect(uppy.getFile(fileIDs[0]).progress.uploadComplete).toBe(true);
  });

  it('should handle upload success (array formdata)', async () => {
    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);
    const formData = new FormData();
    const meta = { tags: ['tag1', 'tag2'] };
    const opts = plugin.getOptions(uppy.getFiles()[0]);

    plugin.addMetadata(formData, meta, opts);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    await plugin.handleUpload(fileIDs);
    expect(uppy.getFile(fileIDs[0]).progress.uploadStarted).toBeDefined();
    expect(uppy.getFile(fileIDs[0]).progress.uploadComplete).toBe(true);
  });

  it('should handle upload error', async () => {
    server.use(
      http.post('/images', async () => {
        return HttpResponse.error();
      })
    );

    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    await plugin.handleUpload(fileIDs);
    expect(uppy.getFile(fileIDs[0]).error).toBeDefined();
  }, 10000);

  it('should handle upload error (limit)', async () => {
    const logSpy = vi.spyOn(uppy, 'log');

    plugin.setOptions({ limit: 0 });
    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    await plugin.handleUpload(fileIDs);
    expect(logSpy).toHaveBeenCalledWith(
      '[AxiosUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues',
      'warning'
    );
  });

  it('should handle upload when no files are present', async () => {
    const logSpy = vi.spyOn(uppy, 'log');

    await plugin.handleUpload([]);
    expect(logSpy).toHaveBeenCalledWith('[AxiosUpload] No files to upload!');
  });

  it('should handle timeout error', async () => {
    server.use(
      http.post('/images', async () => {
        return HttpResponse.json(delay(31000), { status: 200 });
      })
    );

    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    try {
      await plugin.handleUpload(fileIDs);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toContain('Request timed out after 30 seconds.');
      }
    }
  }, 35000);

  it('should handle abort error', async () => {
    server.use(
      http.post('/images', async () => {
        delay(31000);
        return HttpResponse.error();
      })
    );

    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    const uploadPromise = plugin.handleUpload(fileIDs);

    // Simulate abort
    uppy.removeFile(fileIDs[0]);

    await uploadPromise;
    expect(uppy.getFile(fileIDs[0])).toBeUndefined();
  }, 10000);

  it('should handle abort error using cancelAll', async () => {
    server.use(
      http.post('/images', async () => {
        delay(31000);
        return HttpResponse.error();
      })
    );

    const file = {
      data: new Blob(['file content'], { type: 'text/plain' }),
      name: 'file1.txt',
    };
    uppy.addFile(file);

    const fileIDs = uppy.getFiles().map((file) => file.id);
    const uploadPromise = plugin.handleUpload(fileIDs);

    // Simulate abort
    uppy.cancelAll();

    await uploadPromise;
    expect(uppy.getFile(fileIDs[0])).toBeUndefined();
  }, 10000);

  it('should uninstall the plugin correctly', () => {
    const removeUploaderSpy = vi.spyOn(uppy, 'removeUploader');

    plugin.uninstall();
    expect(removeUploaderSpy).toHaveBeenCalledWith(plugin.handleUpload);
  });
});
