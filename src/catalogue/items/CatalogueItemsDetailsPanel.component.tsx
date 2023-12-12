import React from 'react';
import {
  Collapse,
  Grid,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueItem,
  Manufacturer,
} from '../../app.types';

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
  const { catalogueItemIdData, catalogueCategoryData, manufacturerData } =
    props;
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
                        to={`/catalogue/items/${catalogueItemIdData.obsolete_replacement_catalogue_item_id}`}
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
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid item container spacing={0}>
            {catalogueItemIdData.properties &&
              catalogueItemIdData.properties.map((property, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <ListItem
                    style={{
                      justifyContent: 'flex-start',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    <ListItemText
                      primary={`${property.name} ${
                        catalogueCategoryData?.catalogue_item_properties?.[
                          index
                        ].unit
                          ? `(${catalogueCategoryData?.catalogue_item_properties?.[index].unit})`
                          : ''
                      }`}
                      secondary={String(property.value)}
                    />
                  </ListItem>
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
              {manufacturerData?.url ? (
                <Grid item xs={12}>
                  <Typography color="text.primary">Manufacturer URL</Typography>
                  <Typography sx={{ margin: '8px' }} variant="body1">
                    <MuiLink underline="hover" href={manufacturerData.url}>
                      {manufacturerData.url}
                    </MuiLink>
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography color="text.primary">Manufacturer URL</Typography>
                  <Typography color="text.secondary">
                    {manufacturerData?.url ?? 'None'}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid item xs={12} sm={6} key={2}>
              <Typography color="text.primary">
                Manufacturer Address Line
              </Typography>
              <Typography color="text.secondary">
                {manufacturerData?.address.address_line}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={3}>
              <Typography color="text.primary">Manufacturer Town</Typography>
              <Typography color="text.secondary">
                {manufacturerData?.address.town ?? 'None'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={4}>
              <Typography color="text.primary">Manufacturer County</Typography>
              <Typography color="text.secondary">
                {manufacturerData?.address.county ?? 'None'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={5}>
              <Typography color="text.primary">Manufacturer Country</Typography>
              <Typography color="text.secondary">
                {manufacturerData?.address.country}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} key={6}>
              <Typography color="text.primary">
                Manufacturer Post/Zip code
              </Typography>
              <Typography color="text.secondary">
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
