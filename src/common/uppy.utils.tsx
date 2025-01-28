import { Box, styled, Theme } from '@mui/material';
import type { VNode } from 'preact';
import React, { MutableRefObject } from 'react';
import { getSeparatedFilename } from '../utils';

export const StyledUppyBox = styled(Box)(({ theme }) => ({
  '& .uppy-Dashboard-inner': {
    height: '800px',
    // Matches MUI Dialog styles
    maxWidth: theme.breakpoints.values.lg,
    maxHeight: 'calc(100% - 64px)',
    width: 'calc(100% - 64px)',
  },
  '& .uppy-Dashboard--modal .uppy-Dashboard-inner': { zIndex: 1300 },
}));

type PreactRender = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  params: Record<string, unknown> | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...children: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => VNode<any>;

type FieldRenderOptions = {
  value: string;
  onChange: (newVal: string) => void;
  fieldCSSClasses: { text: string };
  required: boolean;
  form: string;
};

function RenderFields(
  field: FieldRenderOptions,
  h: PreactRender,
  inputEl: React.RefObject<HTMLInputElement>,
  divEl: React.RefObject<HTMLDivElement>,
  themeRef: Theme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): VNode<any> {
  const { value, onChange, fieldCSSClasses, required } = field;
  const [name, extension] = getSeparatedFilename(value);
  const modeIsDark = themeRef.palette.mode === 'dark';
  return h(
    'div',
    {
      class: fieldCSSClasses.text,
      // Input field takes up 3/4 of textfield, the rest is div. This redirects the focus from div to input.
      onClick: () => inputEl.current && inputEl.current.focus(),
      tabIndex: 0, // Makes div clickable
      ref: divEl,
      'data-testid': 'filename-input-div-element',
      style: {
        // Styles Div to arrange label + input field
        padding: 0,
        display: 'inline-flex',
        colorScheme: 'light dark',
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
        onFocus: () => {
          // Styles the whole div element (TextField) to look focussed, when input is focussed.
          if (divEl.current) {
            if (modeIsDark) {
              // Toggles dark/light mode colouring
              divEl.current.style['boxShadow'] = 'none';
              divEl.current.style['borderColor'] = 'rgb(82, 82, 82)';
            } else {
              divEl.current.style['boxShadow'] =
                'rgba(18, 105, 207, 0.15) 0px 0px 0px 3px';
              divEl.current.style['borderColor'] = 'rgba(18, 105, 207, 0.6)';
            }
          }
        },
        onBlur: () => {
          if (divEl.current) {
            // Remove div "focus styling" when input is blurred.
            divEl.current.style['boxShadow'] = '';
            divEl.current.style['borderColor'] = '';
          }
        },
        onChange: (event: { currentTarget: { value: string } }) =>
          onChange(event.currentTarget.value + extension),
      }),
      h(
        'label',
        {
          for: 'uppy-Dashboard-FileCard-input-name',
          style: {
            color: modeIsDark ? 'rgb(117, 117, 117)' : 'rgb(82, 82, 82)',
            height: '31px',
            padding: '5px',
          },
        },
        extension
      ),
    ]
  );
}

interface MetaField {
  id: string;
  name: string;
  placeholder?: string;
  render?: (field: FieldRenderOptions, h: PreactRender) => VNode<any>;
}

export function useMetaFields(
  inputEl: React.RefObject<HTMLInputElement>,
  divEl: React.RefObject<HTMLDivElement>,
  themeRef: MutableRefObject<Theme>
): MetaField[] {
  const metaFieldsData: MetaField[] = [
    {
      id: 'name',
      name: 'File name',
      placeholder: 'Enter file name',
      render: (field, h) => {
        return RenderFields(field, h, inputEl, divEl, themeRef.current);
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
