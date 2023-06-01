export const MicroFrontendId = 'scigateway';

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface TabPanelProps {
  children?: React.ReactNode;
  value: TabValue;
  label: TabValue;
}
