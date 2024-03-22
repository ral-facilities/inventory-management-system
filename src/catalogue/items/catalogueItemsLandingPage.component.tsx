import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
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
import { Link, useParams } from 'react-router-dom';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
} from '../../api/catalogueCategory';
import { useCatalogueItem } from '../../api/catalogueItem';
import { useManufacturer } from '../../api/manufacturer';
import { BreadcrumbsInfo } from '../../app.types';
import Breadcrumbs from '../../view/breadcrumbs.component';
import { useNavigateToCatalogue } from '../catalogue.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import { formatDateTimeStrings } from '../../utils';

function CatalogueItemsLandingPage() {
  const { catalogue_item_id: catalogueItemId } = useParams();
  const navigateToCatalogue = useNavigateToCatalogue();

  const { data: catalogueItemIdData, isLoading: catalogueItemIdDataLoading } =
    useCatalogueItem(catalogueItemId);

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueItemIdData?.catalogue_category_id
  );
  const { data: catalogueCategoryData } = useCatalogueCategory(
    catalogueItemIdData?.catalogue_category_id
  );

  const [catalogueLandingBreadcrumbs, setCatalogueLandingBreadcrumbs] =
    React.useState<BreadcrumbsInfo | undefined>(catalogueBreadcrumbs);

  React.useEffect(() => {
    catalogueBreadcrumbs &&
      catalogueItemIdData &&
      setCatalogueLandingBreadcrumbs({
        ...catalogueBreadcrumbs,
        trail: [
          ...catalogueBreadcrumbs.trail,
          [`item/${catalogueItemIdData.id}`, catalogueItemIdData.name],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItemIdData]);

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
    <Grid container flexDirection="column">
      <Grid
        sx={{
          justifyContent: 'left',
          paddingLeft: '4px',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
          '@media print': {
            display: 'none',
          },
        }}
        item
        container
      >
        <Grid item sx={{ py: '20px' }}>
          <Breadcrumbs
            onChangeNode={navigateToCatalogue}
            breadcrumbsInfo={catalogueLandingBreadcrumbs}
            onChangeNavigateHome={() => navigateToCatalogue(null)}
            navigateHomeAriaLabel={'navigate to catalogue home'}
          />
        </Grid>

        {catalogueItemIdData && (
          <Grid item container sx={{ display: 'flex', py: 2 }}>
            <Button
              sx={{ mx: 0.5 }}
              variant="outlined"
              component={Link}
              to={'items'}
            >
              Items
            </Button>
            <Button
              startIcon={<EditIcon />}
              sx={{ mx: 0.5 }}
              variant="outlined"
              onClick={() => {
                setEditItemDialogOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              startIcon={<PrintIcon />}
              sx={{ mx: 0.5 }}
              variant="outlined"
              onClick={() => {
                window.print();
              }}
            >
              Print
            </Button>
          </Grid>
        )}
      </Grid>
      {catalogueItemIdData && (
        <Grid item container sx={{ px: '192px' }} xs={12} spacing={1}>
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
              color="text.secondary"
            >
              {catalogueItemIdData.description ?? 'None'}
            </Typography>
          </Grid>
          <Grid item container spacing={1} xs={12}>
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

            <Grid item container xs={12}>
              <Collapse sx={{ width: '100%' }} in={showDetails}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Obsolete
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Obsolete replacement link
                    </Typography>
                    <Typography align="left" color="text.secondary">
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
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Obsolete reason
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.obsolete_reason ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Cost (£)
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.cost_gbp ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Cost to rework (£)
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Time to replace (days)
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.days_to_replace ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Time to rework (days)
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.days_to_rework ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Drawing Number
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.drawing_number ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Drawing link
                    </Typography>
                    <Typography align="left" color="text.secondary">
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
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Model Number
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {catalogueItemIdData.item_model_number ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Last Modified
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {formatDateTimeStrings(
                        catalogueItemIdData.modified_time,
                        true
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Created
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {formatDateTimeStrings(
                        catalogueItemIdData.created_time,
                        true
                      )}
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
            <Grid container item xs={12}>
              <Collapse sx={{ width: '100%' }} in={showProperties}>
                <Grid container spacing={1}>
                  {catalogueItemIdData.properties &&
                    catalogueItemIdData.properties.map((property, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography align="left" color="text.primary">{`${
                          property.name
                        } ${
                          property.unit ? `(${property.unit})` : ''
                        }`}</Typography>
                        <Typography align="left" color="text.secondary">
                          {property.value !== null
                            ? String(property.value)
                            : 'None'}
                        </Typography>
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
              <Grid item container xs={12}>
                <Collapse sx={{ width: '100%' }} in={showManufacturer}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Name
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        URL
                      </Typography>
                      <Typography align="left" color="text.secondary">
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
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Telephone number
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.telephone ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Address
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.address.address_line}
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.address.town}
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.address.county}
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.address.country}
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {manufacturer?.address.postcode}
                      </Typography>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h6">
              Notes:
            </Typography>
            <Typography
              sx={{ margin: 1, textAlign: 'center' }}
              variant="body1"
              color="text.secondary"
            >
              {catalogueItemIdData.notes ?? 'None'}
            </Typography>
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
              This catalogue item doesn&#39;t exist. Please click the Home
              button on the top left of your screen to navigate to the catalogue
              home.
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      {catalogueCategoryData && catalogueItemIdData && (
        <CatalogueItemsDialog
          open={editItemDialogOpen}
          onClose={() => setEditItemDialogOpen(false)}
          parentInfo={catalogueCategoryData}
          selectedCatalogueItem={catalogueItemIdData}
          type="edit"
        />
      )}
    </Grid>
  );
}

export default CatalogueItemsLandingPage;
