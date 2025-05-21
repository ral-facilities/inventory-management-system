import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { Tabs } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { a11yProps, StyledTab } from '../../common/tab/tab.utils';
import TabPanel from '../../common/tab/tabPanel.component';
import AttachmentsTable from '../attachments/attachmentsTable.component';
import ImageGallery from '../images/imageGallery.component';

type AdditionalTabValues = 'Gallery' | 'Attachments';

export interface TabViewProps<T extends string> {
  defaultTab: T | AdditionalTabValues;
  ariaLabelPrefix: string;
  tabData: {
    value: T | AdditionalTabValues;
    icon?: React.ReactElement;
    component: React.ReactNode;
    order?: number;
  }[];
  galleryEntityId?: string;
  galleryOrder?: number;
  attachmentsEntityId?: string;
  attachmentsOrder?: number;
}

function TabView<T extends string>(props: TabViewProps<T>) {
  const {
    defaultTab,
    ariaLabelPrefix,
    tabData: initialTabData,
    galleryEntityId,
    galleryOrder,
    attachmentsEntityId,
    attachmentsOrder,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const urlTabValue =
    (searchParams.get('tab') as T | AdditionalTabValues) || defaultTab;
  const [tabValue, setTabValue] = React.useState<T | AdditionalTabValues>(
    urlTabValue
  );

  React.useEffect(() => {
    setTabValue(urlTabValue);
  }, [urlTabValue]);

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: T) => {
      setTabValue(newValue);

      const updatedParams = new URLSearchParams(searchParams);

      if (newValue === defaultTab) {
        updatedParams.delete('tab');
      } else {
        updatedParams.set('tab', newValue);
      }

      setSearchParams(updatedParams);
    },
    [defaultTab, searchParams, setSearchParams]
  );

  const tabData = React.useMemo(() => {
    const updatedTabData = [...initialTabData];

    if (galleryEntityId) {
      updatedTabData.push({
        value: 'Gallery' as AdditionalTabValues,
        icon: <CollectionsOutlinedIcon />,
        component: <ImageGallery entityId={galleryEntityId} dense={false} />,
        order: galleryOrder ?? updatedTabData.length + 1,
      });
    }

    if (attachmentsEntityId) {
      updatedTabData.push({
        value: 'Attachments' as AdditionalTabValues,
        icon: <AttachmentOutlinedIcon />,
        component: <AttachmentsTable entityId={attachmentsEntityId} />,
        order: attachmentsOrder ?? updatedTabData.length + 2,
      });
    }

    // Sort the tabs by the `order` field
    return updatedTabData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [
    initialTabData,
    galleryEntityId,
    galleryOrder,
    attachmentsEntityId,
    attachmentsOrder,
  ]);

  return (
    <Grid container flexDirection="column">
      <Grid size={12}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label={`${ariaLabelPrefix} view tabs`}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabData.map(({ value, icon }) => (
            <StyledTab
              icon={icon}
              iconPosition="start"
              value={value}
              label={value}
              key={value}
              {...a11yProps(value)}
            />
          ))}
        </Tabs>
      </Grid>
      <Grid size={12}>
        {tabData.map(({ value, component }) => (
          <TabPanel key={value} value={tabValue} label={value}>
            {component}
          </TabPanel>
        ))}
      </Grid>
    </Grid>
  );
}

export default TabView;
