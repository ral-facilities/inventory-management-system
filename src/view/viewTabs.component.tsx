import React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { TabValue } from '../app.types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Catalogue from '../catalogue/catalogue.component';
import Systems from '../systems/systems.component';
import Manufacturer from '../manufacturer/manufacturer.component';
import { Paper } from '@mui/material';

export const paths = {
  home: '/',
  catalogue: '/catalogue/*',
  systems: '/systems',
  manufacturer: '/manufacturer',
};

function a11yProps(label: TabValue) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(16),
}));

function ViewTabs() {
  const [value, setValue] = React.useState<TabValue>('Catalogue');
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    const tabValue = (
      location.pathname.charAt(1).toUpperCase() + location.pathname.substring(2)
    ).split('/')[0];
    if (tabValue !== value && tabValue !== '') {
      setValue(tabValue as TabValue);
    }
  }, [location.pathname, value]);
  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
    navigate(`/${newValue.toLowerCase()}`);
  };

  React.useEffect(() => {
    if (location.pathname === '/') {
      navigate('/catalogue');
    }
  }, [location.pathname, navigate]);
  return (
    <Paper>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="view tabs">
            <StyledTab
              value="Catalogue"
              label="Catalogue"
              {...a11yProps('Catalogue')}
            />
            <StyledTab
              value="Systems"
              label="Systems"
              {...a11yProps('Systems')}
            />
            <StyledTab
              value="Manufacturer"
              label="Manufacturer"
              {...a11yProps('Manufacturer')}
            />
          </Tabs>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Routes location={location}>
            <Route path="/" element={<Catalogue />}></Route>
            <Route path={paths.catalogue} element={<Catalogue />}></Route>
            <Route path={paths.systems} element={<Systems />}></Route>
            <Route path={paths.manufacturer} element={<Manufacturer />}></Route>
          </Routes>
        </Box>
      </Box>
    </Paper>
  );
}

export default ViewTabs;
