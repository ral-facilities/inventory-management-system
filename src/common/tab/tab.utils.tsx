import { styled } from '@mui/material';
import Tab from '@mui/material/Tab';

// Base tab values
export const CATALOGUE_LANDING_PAGE_TAB_VALUES = [
  'Information',
  'Notes',
] as const;

// Type for base tab values
export type CatalogueLandingPageTabValue =
  (typeof CATALOGUE_LANDING_PAGE_TAB_VALUES)[number];

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
