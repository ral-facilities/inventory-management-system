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
import { CatalogueItem, Item, UsageStatusType } from '../app.types';
import { useManufacturer } from '../api/manufacturer';

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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
      <Grid item container sx={{ ml: 2 }} xs={12}>
        <TabPanel value={tabValue} index={0}>
          <Grid item container spacing={0}>
            <Grid item xs={12}>
              <Typography variant="h4">{catalogueItemIdData.name}</Typography>
              <Typography sx={{ my: 1 }} variant="h6">
                Description:
              </Typography>
              <Typography sx={{ mb: 1 }} variant="body1" color="text.secondary">
                {catalogueItemIdData.description ?? 'None'}
              </Typography>
            </Grid>
            <Grid item container spacing={0} xs={12} sm={6}>
              <Grid item xs={12} sm={6} key={0}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Serial Number</Typography>
                  <Typography color="text.secondary">
                    {itemData.serial_number ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={1}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Asset Number</Typography>
                  <Typography color="text.secondary">
                    {itemData.asset_number ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={2}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Purchase Order Number
                  </Typography>
                  <Typography color="text.secondary">
                    {itemData.purchase_order_number ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={3}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Warranty End Date
                  </Typography>
                  <Typography color="text.secondary">
                    {itemData.warranty_end_date
                      ? new Date(
                          itemData.warranty_end_date
                        ).toLocaleDateString()
                      : 'None'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} key={4}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Delivered Date</Typography>
                  <Typography color="text.secondary">
                    {itemData.delivered_date
                      ? new Date(itemData.delivered_date).toLocaleDateString()
                      : 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={5}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Is Defective</Typography>
                  <Typography color="text.secondary">
                    {itemData.is_defective ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={6}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Usage Status</Typography>
                  <Typography color="text.secondary">
                    {Object.values(UsageStatusType)[itemData.usage_status]}
                  </Typography>
                </Grid>
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
                    <Typography align="left" color="text.primary">{`${
                      property.name
                    } ${
                      property.unit ? `(${property.unit})` : ''
                    }`}</Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Typography align="left" color="text.secondary">
                        {String(property.value)}
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
              <Typography color="text.secondary">
                {manufacturerData?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={1}>
              <Typography color="text.primary">Manufacturer URL</Typography>
              <Typography color="text.secondary">
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
              <Typography align="left" color="text.secondary">
                {manufacturerData?.telephone ?? 'None'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography align="left" color="text.primary">
                Address
              </Typography>
              <Typography align="left" color="text.secondary">
                {manufacturerData?.address.address_line}
              </Typography>
              <Typography align="left" color="text.secondary">
                {manufacturerData?.address.town}
              </Typography>
              <Typography align="left" color="text.secondary">
                {manufacturerData?.address.county}
              </Typography>
              <Typography align="left" color="text.secondary">
                {manufacturerData?.address.country}
              </Typography>
              <Typography align="left" color="text.secondary">
                {manufacturerData?.address.postcode}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid item container spacing={0}>
            <Grid item xs={12}>
              <Typography variant="h4">Notes</Typography>
              <Typography color="text.secondary">{itemData.notes}</Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default ItemsDetailsPanel;
