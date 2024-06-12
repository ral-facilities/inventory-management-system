import React from 'react';
import {
  Box,
  Collapse,
  Grid,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { CatalogueItem, Item } from '../app.types';
import { useManufacturer } from '../api/manufacturers';
import { formatDateTimeStrings } from '../utils';
import { useSystem } from '../api/systems';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      <Collapse in={value === index}>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </Collapse>
    </div>
  );
}

export interface ItemsDetailsPanelProps {
  itemData: Item;
  catalogueItemIdData: CatalogueItem;
}

function ItemsDetailsPanel(props: ItemsDetailsPanelProps) {
  const { catalogueItemIdData, itemData } = props;
  const [tabValue, setTabValue] = React.useState(0);
  const { data: manufacturerData } = useManufacturer(
    catalogueItemIdData.manufacturer_id
  );
  const { data: systemData } = useSystem(itemData.system_id);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Grid
      container
      spacing={0}
      flexDirection="column"
      // Stop any further propagation to prevent a table select from being triggered
      // by clicks inside this grid
      onClick={(e) => e.stopPropagation()}
    >
      <Grid item sx={{ mb: 4 }} xs={12}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Properties" />
          <Tab label="Manufacturer" />
          <Tab label="Notes" />
        </Tabs>
      </Grid>
      <Grid item sx={{ ml: 2 }} xs={12}>
        <TabPanel value={tabValue} index={0}>
          <Grid item container spacing={0}>
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ wordWrap: 'break-word' }}>
                {catalogueItemIdData.name}
              </Typography>
              <Typography sx={{ my: 1 }} variant="h6">
                Description:
              </Typography>
              <Typography
                sx={{ mb: 1, whiteSpace: 'pre-line', wordWrap: 'break-word' }}
                variant="body1"
                color="text.secondary"
              >
                {catalogueItemIdData.description ?? 'None'}
              </Typography>
            </Grid>
            <Grid item container spacing={0}>
              <Grid item xs={12} sm={6} key={0}>
                <Typography color="text.primary">Serial Number</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {itemData.serial_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={1}>
                <Typography color="text.primary">Asset Number</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {itemData.asset_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={2}>
                <Typography color="text.primary">
                  Purchase Order Number
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {itemData.purchase_order_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={3}>
                <Typography color="text.primary">Warranty End Date</Typography>
                <Typography color="text.secondary">
                  {itemData.warranty_end_date
                    ? formatDateTimeStrings(itemData.warranty_end_date, false)
                    : 'None'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} key={4}>
                <Typography color="text.primary">Delivered Date</Typography>
                <Typography color="text.secondary">
                  {itemData.delivered_date
                    ? formatDateTimeStrings(itemData.delivered_date, false)
                    : 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={5}>
                <Typography color="text.primary">Is Defective</Typography>
                <Typography color="text.secondary">
                  {itemData.is_defective ? 'Yes' : 'No'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={6}>
                <Typography color="text.primary">Usage Status</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {itemData.usage_status}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={7}>
                <Typography color="text.primary">System</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  <MuiLink
                    component={Link}
                    underline="hover"
                    target="_blank"
                    to={'/systems/' + systemData?.id}
                  >
                    {systemData?.name}
                  </MuiLink>
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={8}>
                <Typography color="text.primary">Last Modified</Typography>
                <Typography color="text.secondary">
                  {formatDateTimeStrings(itemData.modified_time, true)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} key={9}>
                <Typography color="text.primary">Created</Typography>
                <Typography color="text.secondary">
                  {formatDateTimeStrings(itemData.created_time, true)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid item container spacing={0}>
            {itemData.properties &&
              itemData.properties.map((property, index) => {
                return (
                  <Grid item xs={12} sm={6} key={index}>
                    <Typography
                      align="left"
                      color="text.primary"
                      sx={{ wordWrap: 'break-word' }}
                    >{`${property.name} ${
                      property.unit ? `(${property.unit})` : ''
                    }`}</Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {property.value !== null
                          ? String(property.value)
                          : 'None'}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid item container spacing={0}>
            <Grid item xs={12} sm={6} key={0}>
              <Typography color="text.primary">Manufacturer Name</Typography>
              <Typography
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`/manufacturers/${manufacturerData?.id}`}
                >
                  {manufacturerData?.name}
                </MuiLink>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={1}>
              <Typography color="text.primary">Manufacturer URL</Typography>
              <Typography
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.url ? (
                  <MuiLink
                    component={Link}
                    underline="hover"
                    target="_blank"
                    to={manufacturerData.url}
                  >
                    {manufacturerData.url}
                  </MuiLink>
                ) : (
                  'None'
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography align="left" color="text.primary">
                Telephone number
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.telephone ?? 'None'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography align="left" color="text.primary">
                Address
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.address.address_line}
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.address.town}
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.address.county}
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.address.country}
              </Typography>
              <Typography
                align="left"
                color="text.secondary"
                sx={{ wordWrap: 'break-word' }}
              >
                {manufacturerData?.address.postcode}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid item xs={12}>
            <Typography color="text.secondary" whiteSpace="pre-line">
              {itemData.notes ?? 'None'}
            </Typography>
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default ItemsDetailsPanel;
