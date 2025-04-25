import {
  Collapse,
  Grid,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueItem,
  Manufacturer,
} from '../../api/api.types';
import PrimaryImage from '../../common/images/primaryImage.component';
import { formatDateTimeStrings } from '../../utils';
import CatalogueLink from './catalogueLink.component';

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

export interface CatalogueItemsDetailsPanelProps {
  catalogueItemIdData: CatalogueItem;
  catalogueCategoryData: CatalogueCategory;
  manufacturerData?: Manufacturer;
}

function CatalogueItemsDetailsPanel(props: CatalogueItemsDetailsPanelProps) {
  const { catalogueItemIdData, manufacturerData } = props;
  const [tabValue, setTabValue] = React.useState(0);

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
          <Grid item>
            <Grid container spacing={0}>
              <Grid item xs="auto" padding={1}>
                <PrimaryImage
                  entityId={catalogueItemIdData.id}
                  isDetailsPanel
                />
              </Grid>
              <Grid item xs>
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
                  <Typography color="text.primary">Obsolete</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={1}>
                  <Typography color="text.primary">
                    Obsolete replacement link
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.obsolete_replacement_catalogue_item_id ? (
                      <CatalogueLink
                        catalogueItemId={
                          catalogueItemIdData.obsolete_replacement_catalogue_item_id
                        }
                      >
                        Click here
                      </CatalogueLink>
                    ) : (
                      'None'
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={2}>
                  <Typography color="text.primary">Obsolete Reason</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {catalogueItemIdData.obsolete_reason ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={3}>
                  <Typography color="text.primary">Cost (£)</Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.cost_gbp ?? 'None'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} key={4}>
                  <Typography color="text.primary">
                    Cost to rework (£)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={5}>
                  <Typography color="text.primary">
                    Time to replace (days)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.days_to_replace ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={6}>
                  <Typography color="text.primary">
                    Time to rework (days)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.days_to_rework ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={8}>
                  <Typography color="text.primary">
                    Expected Lifetime (days)
                  </Typography>
                  <Typography color="text.secondary">
                    {catalogueItemIdData.expected_lifetime_days ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={7}>
                  <Typography color="text.primary">Drawing Number</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {catalogueItemIdData.drawing_number ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={9}>
                  <Typography color="text.primary">Model Number</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {catalogueItemIdData.item_model_number ?? 'None'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={10}>
                  <Typography color="text.primary">Last Modified</Typography>
                  <Typography color="text.secondary">
                    {formatDateTimeStrings(
                      catalogueItemIdData.modified_time,
                      true
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} key={11}>
                  <Typography color="text.primary">Created</Typography>
                  <Typography color="text.secondary">
                    {formatDateTimeStrings(
                      catalogueItemIdData.created_time,
                      true
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid item container justifyContent="space-between">
            {catalogueItemIdData.properties.length === 0 ? (
              <Typography color="text.secondary">None</Typography>
            ) : (
              catalogueItemIdData.properties.map((property, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography
                    color="text.primary"
                    sx={{ wordWrap: 'break-word' }}
                  >{`${property.name} ${
                    property.unit ? `(${property.unit})` : ''
                  }`}</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {property.value !== null ? String(property.value) : 'None'}
                  </Typography>
                </Grid>
              ))
            )}
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
            <Typography
              color="text.secondary"
              whiteSpace="pre-line"
              sx={{ wordWrap: 'break-word' }}
            >
              {catalogueItemIdData.notes ?? 'None'}
            </Typography>
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default CatalogueItemsDetailsPanel;
