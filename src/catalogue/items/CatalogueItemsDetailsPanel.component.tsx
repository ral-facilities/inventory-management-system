import React from 'react';
import {
  Collapse,
  Grid,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueItem,
  Manufacturer,
} from '../../app.types';
import { formatDateTimeStrings } from '../../utils';

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

export interface CatalogueItemsDetailsPanelProps {
  catalogueItemIdData: CatalogueItem;
  catalogueCategoryData: CatalogueCategory;
  manufacturerData?: Manufacturer;
}

function CatalogueItemsDetailsPanel(props: CatalogueItemsDetailsPanelProps) {
  const { catalogueItemIdData, manufacturerData } = props;
  const [tabValue, setTabValue] = React.useState(0);

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
              <Typography sx={{ mb: 1 }} variant="body1">
                {catalogueItemIdData.description}
              </Typography>
            </Grid>
            <Grid item container spacing={0} xs={12} sm={6}>
              <Grid item xs={12} sm={6} key={0}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Obsolete</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={1}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Obsolete replacement link
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.obsolete_replacement_catalogue_item_id ? (
                      <MuiLink
                        component={Link}
                        underline="hover"
                        target="_blank"
                        to={`/catalogue/item/${catalogueItemIdData.obsolete_replacement_catalogue_item_id}`}
                      >
                        Click here
                      </MuiLink>
                    ) : (
                      'None'
                    )}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={2}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Obsolete Reason</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.obsolete_reason ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={3}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Cost (£)</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.cost_gbp ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} key={4}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Cost to rework (£)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={5}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Time to replace (days)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.days_to_replace ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={6}>
                <Grid item xs={12}>
                  <Typography color="text.primary">
                    Time to rework (days)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.days_to_rework ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={7}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Drawing Number</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.drawing_number ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={8}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Model Number</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.item_model_number ?? 'None'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={9}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Last Modified</Typography>
                  <Typography color="text.secondary">
                    {formatDateTimeStrings(
                      catalogueItemIdData.modified_time ?? ''
                    )}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6} key={10}>
                <Grid item xs={12}>
                  <Typography color="text.primary">Created</Typography>
                  <Typography color="text.secondary">
                    {formatDateTimeStrings(catalogueItemIdData.created_time)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ my: 1 }} variant="h6">
                Notes:
              </Typography>
              <Typography sx={{ mb: 1 }} variant="body1">
                {catalogueItemIdData.notes ?? 'None'}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid item container spacing={0}>
            {catalogueItemIdData.properties &&
              catalogueItemIdData.properties.map((property, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography color="text.primary">{`${property.name} ${
                    property.unit ? `(${property.unit})` : ''
                  }`}</Typography>
                  <Typography color="text.secondary">
                    {property.value !== null ? String(property.value) : 'None'}
                  </Typography>
                </Grid>
              ))}
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
      </Grid>
    </Grid>
  );
}

export default CatalogueItemsDetailsPanel;
