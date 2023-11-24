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
import { CatalogueCategory, CatalogueItem } from '../../app.types';

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
}

function CatalogueItemsDetailsPanel(props: CatalogueItemsDetailsPanelProps) {
  const { catalogueItemIdData, catalogueCategoryData } = props;
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
                    primary={'Obsolete'}
                    secondary={catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={1}>
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
                    primary={'Obsolete replacement link'}
                    secondary={
                      catalogueItemIdData.obsolete_replacement_catalogue_item_id ? (
                        <MuiLink
                          component={Link}
                          underline="hover"
                          target="_blank"
                          to={`/inventory-management-system/catalogue/items/${catalogueItemIdData.obsolete_replacement_catalogue_item_id}`}
                        >
                          Click here
                        </MuiLink>
                      ) : (
                        'None'
                      )
                    }
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={2}>
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
                    primary={'Obsolete reason'}
                    secondary={catalogueItemIdData.obsolete_reason ?? 'None'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={3}>
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
                    primary={'Cost (£)'}
                    secondary={catalogueItemIdData.cost_gbp ?? 'None'}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} key={4}>
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
                    primary={'Cost to rework (£)'}
                    secondary={catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={5}>
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
                    primary={'Time to replace (days)'}
                    secondary={catalogueItemIdData.days_to_replace ?? 'None'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={6}>
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
                    primary={'Time to rework (days)'}
                    secondary={catalogueItemIdData.days_to_rework ?? 'None'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={7}>
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
                    primary={'Drawing Number'}
                    secondary={catalogueItemIdData.drawing_number ?? 'None'}
                  />
                </ListItem>
              </Grid>

              <Grid item xs={12} sm={6} key={8}>
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
                    primary={'Model Number'}
                    secondary={catalogueItemIdData.item_model_number ?? 'None'}
                  />
                </ListItem>
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
            <Grid item xs={12}>
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
                  primary={'Manufacturer Name'}
                  secondary={catalogueItemIdData.manufacturer.name}
                />
              </ListItem>
            </Grid>
            <Grid item xs={12}>
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
                  primary={'Manufacturer URL'}
                  secondary={
                    <MuiLink
                      underline="hover"
                      target="_blank"
                      href={catalogueItemIdData.manufacturer.url}
                    >
                      {catalogueItemIdData.manufacturer.url}
                    </MuiLink>
                  }
                />
              </ListItem>
            </Grid>
            <Grid item xs={12}>
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
                  primary={'Manufacturer Address'}
                  secondary={catalogueItemIdData.manufacturer.address}
                />
              </ListItem>
            </Grid>
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default CatalogueItemsDetailsPanel;
