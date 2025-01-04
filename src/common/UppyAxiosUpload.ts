/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UseMutationResult } from '@tanstack/react-query';
import Uppy, {
  BasePlugin,
  Body,
  Meta,
  type State,
  type UppyFile,
} from '@uppy/core';
import type { DefinePluginOpts, PluginOpts } from '@uppy/core/lib/BasePlugin';
import EventManager from '@uppy/core/lib/EventManager';
import {
  filterFilesToEmitUploadStarted,
  filterNonFailedFiles,
} from '@uppy/utils/lib/fileFilters';
import getAllowedMetaFields from '@uppy/utils/lib/getAllowedMetaFields';
import {
  RateLimitedQueue,
  internalRateLimitedQueue,
} from '@uppy/utils/lib/RateLimitedQueue';
import type { AxiosError } from 'axios';
import { type ImageAxiosOptions, type UppyAPIImage } from '../api/images';
import UppyNetworkError from './UppyNetworkError';
//@ts-expect-error // eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface AxiosUploadOpts<M extends Meta, B extends Body>
  extends PluginOpts {
  endpoint: string;
  allowedMetaFields?: boolean | string[];
  fieldName?: string;
  limit?: number;
  timeout?: number;
  mutation: UseMutationResult<
    UppyAPIImage,
    AxiosError | Error | UppyNetworkError,
    { url: string; options: ImageAxiosOptions }
  >;
}

declare module '@uppy/utils/lib/UppyFile' {
  export interface UppyFile<M extends Meta, B extends Body> {
    axiosUpload?: AxiosUploadOpts<M, B>;
  }
}

declare module '@uppy/core' {
  export interface State<M extends Meta, B extends Body> {
    axiosUpload?: AxiosUploadOpts<M, B>;
  }
}

const defaultOptions = {
  allowedMetaFields: true,
  fieldName: 'file',
  limit: 5,
  timeout: 30 * 1000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Partial<AxiosUploadOpts<any, any>>;

type Opts<M extends Meta, B extends Body> = DefinePluginOpts<
  AxiosUploadOpts<M, B>,
  keyof typeof defaultOptions
>;

/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 */
export function setTypeInBlob<M extends Meta, B extends Body>(
  file: UppyFile<M, B>
) {
  const dataWithUpdatedType = file.data.slice(
    0,
    file.data.size,
    file.meta.type
  );
  return dataWithUpdatedType;
}

export default class AxiosUpload<
  M extends Meta,
  B extends Body,
> extends BasePlugin<Opts<M, B>, M, B> {
  getFetcher;
  requests: RateLimitedQueue;
  uploaderEvents: Record<string, EventManager<M, B> | null>;
  postImage;

  constructor(uppy: Uppy<M, B>, opts: AxiosUploadOpts<M, B>) {
    super(uppy, { ...defaultOptions, ...opts });
    this.id = opts.id || 'AxiosUpload';
    this.type = 'uploader';
    this.i18nInit();
    this.postImage = this.opts.mutation.mutateAsync;

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (internalRateLimitedQueue in this.opts) {
      this.requests = this.opts[internalRateLimitedQueue] as RateLimitedQueue;
    } else {
      this.requests = new RateLimitedQueue(this.opts.limit);
    }

    this.uploaderEvents = Object.create(null);

    this.getFetcher = (files: UppyFile<M, B>[]) => {
      return async (url: string, options: ImageAxiosOptions) => {
        try {
          const res = await this.postImage({
            url: url,
            options: {
              ...options,
              onTimeout: (timeout) => {
                const seconds = Math.ceil(timeout / 1000);
                const error = new Error(
                  this.i18n('uploadStalled', { seconds })
                );
                this.uppy.emit('upload-stalled', error, files);
              },
              onUploadProgress: (event) => {
                if (event.lengthComputable) {
                  for (const { id } of files) {
                    const file = this.uppy.getFile(id);
                    this.uppy.emit('upload-progress', file, {
                      uploadStarted: file.progress.uploadStarted ?? 0,
                      bytesUploaded: (event.loaded / event.total!) * file.size!,
                      bytesTotal: file.size,
                    });
                  }
                }
              },
            },
          });

          // Emit success events for each file
          for (const { id } of files) {
            const file = this.uppy.getFile(id);
            this.uppy.emit('upload-success', file, {
              status: res.status,
              body: res.body as unknown as B,
              uploadURL: res.uploadURL,
            });
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            return undefined;
          }
          if (error instanceof UppyNetworkError) {
            // Emit error events for each file
            for (const file of files) {
              const fileData = this.uppy.getFile(file.id);
              this.uppy.emit('upload-error', fileData, error);
            }
          }

          // Handle other errors

          throw error;
        }
      };
    };
  }

  getOptions(file: UppyFile<M, B>): Opts<M, B> {
    const overrides = this.uppy.getState().axiosUpload;

    const opts = {
      ...this.opts,
      ...(overrides || {}),
      ...(file.axiosUpload || {}),
    };

    return opts;
  }

  addMetadata(
    formData: FormData,
    meta: State<M, B>['meta'],
    opts: Opts<M, B>
  ): void {
    const allowedMetaFields = getAllowedMetaFields(
      opts.allowedMetaFields,
      meta
    );

    allowedMetaFields.forEach((item) => {
      const value = meta[item];
      if (Array.isArray(value)) {
        // In this case we don't transform `item` to add brackets, it's up to
        // the user to add the brackets so it won't be overridden.
        value.forEach((subItem) => formData.append(item, subItem));
      } else {
        formData.append(item, value as string);
      }
    });
  }

  createFormDataUpload(file: UppyFile<M, B>, opts: Opts<M, B>): FormData {
    const formPost = new FormData();

    this.addMetadata(formPost, file.meta, opts);

    const dataWithUpdatedType = setTypeInBlob(file);

    if (file.name) {
      formPost.append(opts.fieldName, dataWithUpdatedType, file.meta.name);
    } else {
      formPost.append(opts.fieldName, dataWithUpdatedType);
    }
    return formPost;
  }

  async uploadLocalFile(file: UppyFile<M, B>) {
    const events = new EventManager(this.uppy);
    const controller = new AbortController();
    const uppyFetch = this.requests.wrapPromiseFunction(async () => {
      const opts = this.getOptions(file);
      const fetch = this.getFetcher([file]);
      const body = this.createFormDataUpload(file, opts);
      return fetch(opts.endpoint, {
        ...opts,
        body,
        signal: controller.signal,
      });
    });

    events.onFileRemove(file.id, () => controller.abort());
    events.onCancelAll(file.id, () => {
      controller.abort();
    });

    try {
      await uppyFetch().abortOn(controller.signal);
    } catch (error) {
      // TODO: create formal error with name 'AbortError' (this comes from RateLimitedQueue)
      if ((error as Error).message !== 'Cancelled') {
        throw error;
      }
    } finally {
      events.remove();
    }
  }

  async uploadFiles(files: UppyFile<M, B>[]) {
    await Promise.allSettled(
      files.map((file) => {
        return this.uploadLocalFile(file);
      })
    );
  }

  handleUpload = async (fileIDs: string[]) => {
    if (fileIDs.length === 0) {
      this.uppy.log('[AxiosUpload] No files to upload!');
      return;
    }

    // No limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin
    // (basically just AwsS3) using the internal symbol
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore untyped internal
    if (this.opts.limit === 0 && !this.opts[internalRateLimitedQueue]) {
      this.uppy.log(
        '[AxiosUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues',
        'warning'
      );
    }

    this.uppy.log('[AxiosUpload] Uploading...');
    const files = this.uppy.getFilesByIds(fileIDs);
    const filesFiltered = filterNonFailedFiles(files);
    const filesToEmit = filterFilesToEmitUploadStarted(filesFiltered);
    this.uppy.emit('upload-start', filesToEmit);

    await this.uploadFiles(filesFiltered);
  };

  install(): void {
    this.uppy.addUploader(this.handleUpload);
  }

  uninstall(): void {
    this.uppy.removeUploader(this.handleUpload);
  }
}
