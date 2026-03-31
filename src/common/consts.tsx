import { DialogProps } from '@mui/material/Dialog';

export const ROWS_PER_PAGE_OPTIONS = [30, 45, 60];
export const DEFAULT_ROWS_PER_PAGE_VALUE = ROWS_PER_PAGE_OPTIONS[0];

export const TABLE_DIALOG_PROPS: Omit<DialogProps, 'open'> = {
  maxWidth: 'xl',
  slotProps: {
    paper: {
      sx: {
        height: '100%',
      },
    },
  },
  fullWidth: true,
};

export const FORM_DIALOG_PROPS: Omit<DialogProps, 'open'> = {
  maxWidth: 'xl',
  slotProps: {
    paper: {
      sx: {
        maxHeight: '100%',
      },
    },
  },
  fullWidth: true,
};

export const FORM_WITH_STEPPER_DIALOG_PROPS = TABLE_DIALOG_PROPS;

export const FLEX_CONTAINER_PROPS: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

export const FLEX_TABLE_CONTAINER_PROP: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
};
