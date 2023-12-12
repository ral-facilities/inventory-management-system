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
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCatalogueCategoryById } from '../../api/catalogueCategory';
import { useCatalogueItem } from '../../api/catalogueItem';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import { useManufacturer } from '../../api/manufacturer';

function CatalogueItemsLandingPage() {
  const location = useLocation();

  const catalogueItemId = location.pathname.replace('/catalogue/items/', '');

  const { data: catalogueItemIdData, isLoading: catalogueItemIdDataLoading } =
    useCatalogueItem(catalogueItemId);

  const { data: catalogueCategoryData } = useCatalogueCategoryById(
    catalogueItemIdData?.catalogue_category_id
  );

  const { data: manufacturer } = useManufacturer(
    catalogueItemIdData?.manufacturer_id
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
              ? `/catalogue/${catalogueCategoryData.id}`
              : '/catalogue'
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

              <Grid
                item
                xs={12}
                style={{
                  justifyContent: 'flex-start',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Collapse in={showDetails}>
                  <Grid container spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">Obsolete</Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
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
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">
                        Obsolete reason
                      </Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.obsolete_reason ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">Cost (£)</Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.cost_gbp ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">Name</Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">
                        Time to replace (days)
                      </Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.days_to_replace ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">
                        Time to rework (days)
                      </Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.days_to_rework ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">
                        Drawing Number
                      </Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.drawing_number ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">Drawing link</Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.drawing_link ? (
                          <MuiLink
                            underline="hover"
                            target="_blank"
                            href={catalogueItemIdData.drawing_link}
                          >
                            {catalogueItemIdData.drawing_link}
                          </MuiLink>
                        ) : (
                          'None'
                        )}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography color="text.primary">Model Number</Typography>
                      <Typography color="text.secondary">
                        {catalogueItemIdData.item_model_number ?? 'None'}
                      </Typography>
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
              <Grid
                item
                xs={12}
                style={{
                  justifyContent: 'flex-start',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Collapse in={showProperties}>
                  <Grid container spacing={1}>
                    {catalogueItemIdData.properties &&
                      catalogueItemIdData.properties.map((property, index) => (
                        <Grid item xs={12} sm={6} md={2} key={index}>
                          <Grid
                            item
                            xs={12}
                            style={{
                              justifyContent: 'flex-start',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px',
                            }}
                          >
                            <Typography color="text.primary">{`${
                              property.name
                            } ${
                              catalogueCategoryData
                                ?.catalogue_item_properties?.[index].unit
                                ? `(${catalogueCategoryData?.catalogue_item_properties?.[index].unit})`
                                : ''
                            }`}</Typography>
                            <Typography color="text.secondary">
                              {String(property.value)}
                            </Typography>
                          </Grid>
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

              {manufacturer && (
                <Grid item xs={12}>
                  <Collapse in={showManufacturer}>
                    <Grid
                      container
                      spacing={1}
                      style={{
                        justifyContent: 'flex-start',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Grid
                        item
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'left',
                        }}
                      >
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">Name</Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.name}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">URL</Typography>
                          <Typography color="text.secondary">
                            {manufacturer.url ? (
                              <MuiLink
                                component={Link}
                                underline="hover"
                                target="_blank"
                                to={manufacturer.url}
                              >
                                {manufacturer.url}
                              </MuiLink>
                            ) : (
                              'None'
                            )}
                          </Typography>
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">
                            Address Line
                          </Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.address.address_line}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">Town</Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.address.town}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">County</Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.address.county}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">Country</Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.address.country}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                          }}
                        >
                          <Typography color="text.primary">
                            Post/Zip code
                          </Typography>
                          <Typography color="text.secondary">
                            {manufacturer?.address.postcode}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>
              )}
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
