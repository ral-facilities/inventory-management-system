import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import { styled } from '@mui/material';
import Tab from '@mui/material/Tab';

// Base tab values
export const CATALOGUE_LANDING_PAGE_TAB_VALUES = [
  'Information',
  'Gallery',
  'Attachments',
  'Notes',
] as const;

// Type for base tab values
export type CatalogueLandingPageTabValue =
  (typeof CATALOGUE_LANDING_PAGE_TAB_VALUES)[number];

// Default icons for the base values
export const defaultCatalogueLandingPageIconMapping: Record<
  CatalogueLandingPageTabValue,
  React.ReactElement
> = {
  Information: <InfoOutlinedIcon />,
  Gallery: <CollectionsOutlinedIcon />,
  Attachments: <AttachmentOutlinedIcon />,
  Notes: <NotesIcon />,
};

export function a11yProps<T>(label: T) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(16),
}));
