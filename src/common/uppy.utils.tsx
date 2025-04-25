import { Box, styled } from '@mui/material';
import { Body, Meta, type UppyFile } from '@uppy/core';
import { DashboardState } from '@uppy/dashboard/lib/Dashboard';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import { type StatusBarUIProps } from '@uppy/status-bar/lib/StatusBarUI';
import type { VNode } from 'preact';
import React from 'react';
import { getNameAndExtension } from '../utils';

export const StyledUppyBox = styled(Box)(({ theme }) => ({
  '& .uppy-Dashboard-inner': {
    height: '800px',
    // Matches MUI Dialog styles
    maxWidth: theme.breakpoints.values.lg,
    maxHeight: 'calc(100% - 64px)',
    width: 'calc(100% - 64px)',
  },
  // Ensures uppy dialog appears above MUI dialogs; MUI dialogs have a value of 1300.
  '& .uppy-Dashboard--modal .uppy-Dashboard-inner': { zIndex: 1300 + 1 },
  // The theme variable doesn't update as expected in the renderFields function.
  // Therefore, all CSS that depends on the theme mode is handled here.
  // The input focus styles are adapted from Uppy core styles:
  // https://github.com/transloadit/uppy/blob/3aa8d688ff4a94b52287dbf737eb5b3f10b29dda/packages/%40uppy/core/src/_common.scss#L49
  '.ims-uppy-input-div-focused-within': {
    '&:focus-within': {
      // Light mode: blue border color from Uppy variables:
      // https://github.com/transloadit/uppy/blob/3aa8d688ff4a94b52287dbf737eb5b3f10b29dda/packages/%40uppy/core/src/_variables.scss#L19
      boxShadow: 'rgba(18, 105, 207, 0.15) 0px 0px 0px 3px',
      borderColor: 'rgba(18, 105, 207, 0.6)',
    },
  },
  "[data-uppy-theme='dark'] .ims-uppy-input-div-focused-within": {
    '&:focus-within': {
      // Dark mode: gray border color from Uppy variables:
      // https://github.com/transloadit/uppy/blob/3aa8d688ff4a94b52287dbf737eb5b3f10b29dda/packages/%40uppy/core/src/_variables.scss#L32
      boxShadow: 'none',
      borderColor: 'rgb(82, 82, 82)',
    },
  },
}));

//Uppy custom type: Preact h function:
//https://github.com/transloadit/uppy/blob/dd555d83f54c6b02dce66e0e349a51204ec64004/packages/%40uppy/dashboard/src/Dashboard.tsx#L83
type PreactRender = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  params: Record<string, unknown> | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...children: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => VNode<any>;

//Uppy custom type: Render Fields default props:
//https://github.com/transloadit/uppy/blob/dd555d83f54c6b02dce66e0e349a51204ec64004/packages/%40uppy/dashboard/src/Dashboard.tsx#L75
type FieldRenderOptions = {
  value: string;
  onChange: (newVal: string) => void;
  fieldCSSClasses: { text: string };
  required: boolean;
  form: string;
};

function renderFields(
  field: FieldRenderOptions,
  h: PreactRender,
  inputEl: React.RefObject<HTMLInputElement>,
  divEl: React.RefObject<HTMLDivElement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): VNode<any> {
  const { value, onChange, fieldCSSClasses, required } = field;
  const [name, extension] = getNameAndExtension(value);
  return h(
    'div',
    {
      class: 'ims-uppy-input-div-focused-within ' + fieldCSSClasses.text,
      // Input field takes up 3/4 of textfield, the rest is div. This redirects the focus from div to input.
      onClick: () => inputEl.current && inputEl.current.focus(),
      tabIndex: 0, // Makes div clickable
      ref: divEl,
      'data-testid': 'filename-input-div-element',
      style: {
        // Styles Div to arrange label + input field
        padding: 0,
        display: 'inline-flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
    [
      h('input', {
        type: 'text',
        id: 'uppy-Dashboard-FileCard-input-name',
        value: name,
        ref: inputEl,
        class: fieldCSSClasses.text,
        placeholder: 'Enter file name',
        style: {
          // Style to make input field invisible.
          border: 0,
          'box-shadow': 'none',
          outline: 'none',
        },
        required: required,
        onChange: (event: { currentTarget: { value: string } }) =>
          onChange(event.currentTarget.value + extension),
      }),
      h(
        'label',
        {
          for: 'uppy-Dashboard-FileCard-input-name',
          style: {
            height: '31px',
            padding: '5px',
          },
        },
        extension
      ),
    ]
  );
}

export type MetaFields<M extends Meta, B extends Body> = DashboardState<
  M,
  B
>['metaFields'];

export function useMetaFields<M extends Meta, B extends Body>(): MetaFields<
  M,
  B
> {
  const inputEl = React.useRef<HTMLInputElement>(null);
  const divEl = React.useRef<HTMLDivElement>(null);
  const metaFieldsData: MetaFields<M, B> = [
    {
      id: 'name',
      name: 'File name',
      placeholder: 'Enter file name',
      render: (field: FieldRenderOptions, h: PreactRender) => {
        return renderFields(field, h, inputEl, divEl);
      },
    },
    { id: 'title', name: 'Title', placeholder: 'Enter file title' },
    {
      id: 'description',
      name: 'Description',
      placeholder: 'Enter file description',
    },
  ];

  return metaFieldsData;
}

// https://github.com/transloadit/uppy/blob/229902eb17cbb9f866921cf232d94b25eb584efd/packages/%40uppy/status-bar/src/StatusBar.tsx#L24
export function getUploadingState(
  error: unknown,
  isAllComplete: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recoveredState: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: Record<string, UppyFile<any, any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): StatusBarUIProps<any, any>['uploadState'] {
  if (error) {
    return statusBarStates.STATE_ERROR;
  }

  if (isAllComplete) {
    return statusBarStates.STATE_COMPLETE;
  }

  if (recoveredState) {
    return statusBarStates.STATE_WAITING;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let state: StatusBarUIProps<any, any>['uploadState'] =
    statusBarStates.STATE_WAITING;
  const fileIDs = Object.keys(files);
  for (let i = 0; i < fileIDs.length; i++) {
    const { progress } = files[fileIDs[i]];
    // If ANY files are being uploaded right now, show the uploading state.
    if (progress.uploadStarted && !progress.uploadComplete) {
      return statusBarStates.STATE_UPLOADING;
    }
    // If files are being preprocessed AND postprocessed at this time, we show the
    // preprocess state. If any files are being uploaded we show uploading.
    if (progress.preprocess) {
      state = statusBarStates.STATE_PREPROCESSING;
    }
    // If NO files are being preprocessed or uploaded right now, but some files are
    // being postprocessed, show the postprocess state.
    if (progress.postprocess && state !== statusBarStates.STATE_PREPROCESSING) {
      state = statusBarStates.STATE_POSTPROCESSING;
    }
  }
  return state;
}
