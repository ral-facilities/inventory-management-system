import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Collapse,
  LinearProgress,
  Link as MuiLink,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCatalogueCategoryById } from '../../api/catalogueCategory';
import { useCatalogueItem } from '../../api/catalogueItem';
import CatalogueItemsDialog from './catalogueItemsDialog.component';

function CatalogueItemsLandingPage() {
  const location = useLocation();

  const catalogueItemId = location.pathname.replace(
    '/inventory-management-system/catalogue/items/',
    ''
  );

  const { data: catalogueItemIdData, isLoading: catalogueItemIdDataLoading } =
    useCatalogueItem(catalogueItemId);

  const { data: catalogueCategoryData } = useCatalogueCategoryById(
    catalogueItemIdData?.catalogue_category_id
  );

  const [showProperties, setShowProperties] = useState(true);

  const toggleProperties = () => {
    setShowProperties(!showProperties);
  };

  const [showManufacturer, setShowManufacturer] = useState(true);

  const toggleManufacturer = () => {
    setShowManufacturer(!showManufacturer);
  };

  const [showDetails, setShowDetails] = useState(true);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);

  return (
    <Grid container>
      <Grid
        sx={{
          display: 'flex',
          justifyContent: 'left',
          padding: 1,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
        }}
        item
      >
        <Button
          component={Link}
          to={
            catalogueCategoryData && catalogueCategoryData.id
              ? `/inventory-management-system/catalogue/${catalogueCategoryData.id}`
              : '/inventory-management-system/catalogue'
          }
          sx={{ margin: 1 }}
          variant="outlined"
        >
          {catalogueItemIdData
            ? `Back to ${catalogueCategoryData?.name} table view`
            : 'Home'}
        </Button>
        <Button
          disabled={!catalogueItemIdData}
          sx={{ margin: 1 }}
          variant="outlined"
          onClick={() => {
            setEditItemDialogOpen(true);
          }}
        >
          Edit
        </Button>
      </Grid>
      {catalogueItemIdData && (
        <Grid item xs={12}>
          <Grid container spacing={1} flexDirection="column">
            <Grid item xs={12}>
              <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h4">
                {catalogueItemIdData.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h6">
                Description:
              </Typography>
              <Typography
                sx={{ margin: 1, textAlign: 'center' }}
                variant="body1"
              >
                {catalogueItemIdData.description}
              </Typography>
            </Grid>
            <Grid container spacing={1} sx={{ px: '192px' }}>
              <Grid
                item
                xs={12}
                onClick={toggleDetails}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label={`${
                  showDetails ? 'Close' : 'Show'
                } catalogue item details`}
              >
                {showDetails ? (
                  <>
                    <Typography variant="h6">Details</Typography>
                    <ExpandLessIcon />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">Details</Typography>
                    <ExpandMoreIcon />
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Collapse in={showDetails}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Obsolete'}
                          secondary={
                            catalogueItemIdData.is_obsolete ? 'Yes' : 'No'
                          }
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
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
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Obsolete reason'}
                          secondary={
                            catalogueItemIdData.obsolete_reason ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Cost (£)'}
                          secondary={catalogueItemIdData.cost_gbp ?? 'None'}
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Cost to rework (£)'}
                          secondary={
                            catalogueItemIdData.cost_to_rework_gbp ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Time to replace (days)'}
                          secondary={
                            catalogueItemIdData.days_to_replace ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Time to rework (days)'}
                          secondary={
                            catalogueItemIdData.days_to_rework ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Drawing Number'}
                          secondary={
                            catalogueItemIdData.drawing_number ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Drawing Link'}
                          secondary={
                            catalogueItemIdData.drawing_link ? (
                              <MuiLink
                                underline="hover"
                                target="_blank"
                                href={catalogueItemIdData.drawing_link}
                              >
                                {catalogueItemIdData.drawing_link}
                              </MuiLink>
                            ) : (
                              'None'
                            )
                          }
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Model Number'}
                          secondary={
                            catalogueItemIdData.item_model_number ?? 'None'
                          }
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
              <Grid
                item
                xs={12}
                onClick={toggleProperties}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label={`${
                  showProperties ? 'Close' : 'Show'
                } catalogue item properties`}
              >
                {showProperties ? (
                  <>
                    <Typography variant="h6">Properties</Typography>
                    <ExpandLessIcon />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">Properties</Typography>
                    <ExpandMoreIcon />
                  </>
                )}
              </Grid>
              <Grid item xs={12}>
                <Collapse in={showProperties}>
                  <Grid container spacing={1}>
                    {catalogueItemIdData.properties &&
                      catalogueItemIdData.properties.map((property, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <ListItem
                            style={{
                              justifyContent: 'flex-start',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <ListItemText
                              primary={`${property.name} ${
                                catalogueCategoryData
                                  ?.catalogue_item_properties?.[index].unit
                                  ? `(${catalogueCategoryData?.catalogue_item_properties?.[index].unit})`
                                  : ''
                              }`}
                              secondary={String(property.value)}
                            />
                          </ListItem>
                        </Grid>
                      ))}
                  </Grid>
                </Collapse>
              </Grid>

              <Grid
                item
                xs={12}
                onClick={toggleManufacturer}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                aria-label={`${
                  showManufacturer ? 'Close' : 'Show'
                } catalogue item manufacturer details`}
              >
                {showManufacturer ? (
                  <>
                    <Typography variant="h6">Manufacturer</Typography>
                    <ExpandLessIcon />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">Manufacturer</Typography>
                    <ExpandMoreIcon />
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Collapse in={showManufacturer}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Manufacturer Name'}
                          secondary={catalogueItemIdData.manufacturer.name}
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
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
                    <Grid item xs={12} sm={6} md={4}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={'Manufacturer Address'}
                          secondary={catalogueItemIdData.manufacturer.address}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      {!catalogueItemIdDataLoading ? (
        !catalogueItemIdData && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 1,
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>No result found</Typography>
            <Typography>
              This item doesn't exist. Please click the Home button to navigate
              to the catalogue home
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      <CatalogueItemsDialog
        open={editItemDialogOpen}
        onClose={() => setEditItemDialogOpen(false)}
        parentInfo={catalogueCategoryData}
        selectedCatalogueItem={catalogueItemIdData}
        type="edit"
      />
    </Grid>
  );
}

export default CatalogueItemsLandingPage;
