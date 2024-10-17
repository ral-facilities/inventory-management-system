import { Box } from '@mui/material';

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

export default TabPanel;
