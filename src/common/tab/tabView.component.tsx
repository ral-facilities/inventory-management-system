import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { Tabs } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { a11yProps, StyledTab } from '../../common/tab/tab.utils';
import TabPanel from '../../common/tab/tabPanel.component';

export interface TabViewProps<T> {
  defaultTab: T;
  ariaLabelPrefix: string;
  tabData: {
    value: T;
    icon?: React.ReactElement;
    component: React.ReactNode;
  }[];
  gallery?: boolean;
  attachments?: boolean;
}

function TabView<T>(props: TabViewProps<T>) {
  const { defaultTab, ariaLabelPrefix, tabData, gallery, attachments } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  // Retrieve the tab value from the URL or default to the passed defaultTab prop
  const urlTabValue = (searchParams.get('tab') as T) || defaultTab;
  const [tabValue, setTabValue] = React.useState<T>(urlTabValue);

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: T) => {
      setTabValue(newValue);
      if (newValue === defaultTab) {
        searchParams.delete('tab');
        setSearchParams(searchParams, { replace: true });
      } else {
        setSearchParams(
          { tab: newValue as unknown as string },
          { replace: true }
        );
      }
    },
    [defaultTab, searchParams, setSearchParams]
  );

  // Optionally add Gallery and Attachments tabs
  if (gallery) {
    tabData.push({
      value: 'Gallery' as T,
      icon: <CollectionsOutlinedIcon />,
      component: <></>,
    });
  }

  if (attachments) {
    tabData.push({
      value: 'Attachments' as T,
      icon: <AttachmentOutlinedIcon />,
      component: <></>,
    });
  }

  return (
    <Grid container flexDirection="column">
      <Grid item xs={12}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label={`${ariaLabelPrefix} view tabs`}
        >
          {tabData.map(({ value, icon }) => (
            <StyledTab
              icon={icon}
              iconPosition="start"
              value={value}
              label={value as unknown as string}
              key={value as unknown as string}
              {...a11yProps(value as unknown as string)}
            />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        {tabData.map(({ value, component }) => (
          <TabPanel<T>
            key={value as unknown as string}
            value={tabValue}
            label={value}
          >
            {component}
          </TabPanel>
        ))}
      </Grid>
    </Grid>
  );
}

export default TabView;
