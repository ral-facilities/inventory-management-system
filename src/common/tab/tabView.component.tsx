import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { Tabs } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { a11yProps, StyledTab } from '../../common/tab/tab.utils';
import TabPanel from '../../common/tab/tabPanel.component';

type AdditionalTabValues = 'Gallery' | 'Attachments';

export interface TabViewProps<T> {
  defaultTab: T | AdditionalTabValues;
  ariaLabelPrefix: string;
  tabData: {
    value: T | AdditionalTabValues;
    icon?: React.ReactElement;
    component: React.ReactNode;
    order?: number;
  }[];
  gallery?: boolean;
  galleryOrder?: number;
  attachments?: boolean;
  attachmentsOrder?: number;
}

function TabView<T>(props: TabViewProps<T>) {
  const {
    defaultTab,
    ariaLabelPrefix,
    tabData: initialTabData,
    gallery,
    galleryOrder,
    attachments,
    attachmentsOrder,
  } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTabValue =
    (searchParams.get('tab') as T | AdditionalTabValues) || defaultTab;
  const [tabValue, setTabValue] = React.useState<T | AdditionalTabValues>(
    urlTabValue
  );

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: T) => {
      setTabValue(newValue);

      const updatedParams = new URLSearchParams(searchParams);

      if (newValue === defaultTab) {
        updatedParams.delete('tab');
      } else {
        updatedParams.set('tab', newValue as unknown as string);
      }

      setSearchParams(updatedParams, { replace: true });
    },
    [defaultTab, searchParams, setSearchParams]
  );

  const tabData = React.useMemo(() => {
    const updatedTabData = [...initialTabData];

    if (gallery) {
      updatedTabData.push({
        value: 'Gallery' as AdditionalTabValues,
        icon: <CollectionsOutlinedIcon />,
        component: <></>,
        order: galleryOrder ?? updatedTabData.length + 1,
      });
    }

    if (attachments) {
      updatedTabData.push({
        value: 'Attachments' as AdditionalTabValues,
        icon: <AttachmentOutlinedIcon />,
        component: <></>,
        order: attachmentsOrder ?? updatedTabData.length + 2,
      });
    }

    // Sort the tabs by the `order` field
    return updatedTabData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [initialTabData, gallery, galleryOrder, attachments, attachmentsOrder]);

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
          <TabPanel<T | AdditionalTabValues>
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
