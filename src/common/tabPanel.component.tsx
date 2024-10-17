import { Box, styled } from '@mui/material';
import Tab from '@mui/material/Tab';

export interface TabPanelProps<T> {
  children?: React.ReactNode;
  value: T | false;
  label: T | false;
}

export function TabPanel<T>({
  children,
  value,
  label,
  ...other
}: TabPanelProps<T>) {
  return (
    <div
      role="tabpanel"
      hidden={value !== label}
      id={`${label}-tabpanel`}
      aria-labelledby={`${label}-tab`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === label && <Box height="100%">{children}</Box>}
    </div>
  );
}

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

export default TabPanel;
