import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
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
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useCatalogueItem } from '../api/catalogueItem';
import { useManufacturer } from '../api/manufacturer';
import { useItem } from '../api/item';
import { BreadcrumbsInfo, UsageStatusType } from '../app.types';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
} from '../api/catalogueCategory';
import Breadcrumbs from '../view/breadcrumbs.component';
import ItemDialog from './itemDialog.component';

function ItemsLandingPage() {
  const { item_id: id } = useParams();

  const { data: itemData, isLoading: itemDataIsLoading } = useItem(id);

  const { data: catalogueItemData } = useCatalogueItem(
    itemData?.catalogue_item_id
  );

  const { data: catalogueCategoryData } = useCatalogueCategory(
    catalogueItemData?.catalogue_category_id
  );

  const navigate = useNavigate();
  const onChangeNode = React.useCallback(
    (newIdPath: string) => {
      navigate(`/catalogue/${newIdPath}`);
    },
    [navigate]
  );

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueItemData?.catalogue_category_id ?? ''
  );

  const [itemLandingBreadcrumbs, setItemLandingBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(catalogueBreadcrumbs);

  React.useEffect(() => {
    catalogueBreadcrumbs &&
      catalogueItemData &&
      setItemLandingBreadcrumbs({
        ...catalogueBreadcrumbs,
        trail: [
          ...catalogueBreadcrumbs.trail,
          [`item/${catalogueItemData.id}`, `${catalogueItemData.name}`],
          [`item/${catalogueItemData.id}/items`, 'Items'],
          [`item/${catalogueItemData.id}/items/${id}`, id ?? ''],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItemData, id]);

  const { data: manufacturer } = useManufacturer(
    catalogueItemData?.manufacturer_id
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
          paddingLeft: 0.5,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
          '@media print': {
            display: 'none',
          },
        }}
        container
        item
      >
        <Grid item sx={{ py: 2.5 }}>
          <Breadcrumbs
            onChangeNode={onChangeNode}
            breadcrumbsInfo={itemLandingBreadcrumbs}
            onChangeNavigateHome={() => {
              navigate('/catalogue');
            }}
            navigateHomeAriaLabel={'navigate to catalogue home'}
          />
        </Grid>
        {itemData && (
          <Grid item container sx={{ display: 'flex', py: 2 }}>
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
      {catalogueItemData && itemData && (
        <Grid item container sx={{ px: '192px' }} xs={12} spacing={1}>
          <Grid item xs={12}>
            <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h4">
              {catalogueItemData.name}
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
              {catalogueItemData.description}
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
              aria-label={`${showDetails ? 'Close' : 'Show'} item details`}
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
                <Grid item container spacing={1}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Serial Number
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.serial_number ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Asset Number
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.asset_number ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Purchase Order Number
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.purchase_order_number ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Warranty End Date
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.warranty_end_date
                        ? new Date(
                            itemData.warranty_end_date
                          ).toLocaleDateString()
                        : 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Delivered Date
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.delivered_date
                        ? new Date(itemData.delivered_date).toLocaleDateString()
                        : 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Is Defective
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.is_defective ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Usage Status
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {Object.values(UsageStatusType)[itemData.usage_status]}
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
              } item properties`}
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
                <Grid container item spacing={1}>
                  {itemData.properties &&
                    itemData.properties.map((property, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography align="left" color="text.primary">{`${
                          property.name
                        } ${
                          property.unit ? `(${property.unit})` : ''
                        }`}</Typography>
                        <Typography align="left" color="text.secondary">
                          {property.value !== null ? String(property.value) : 'None'}
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
              } item manufacturer details`}
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
                  <Grid container item spacing={1} xs={12}>
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
              {itemData.notes}
            </Typography>
          </Grid>
        </Grid>
      )}
      {!itemDataIsLoading ? (
        !itemData && (
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

      <ItemDialog
        open={editItemDialogOpen}
        onClose={() => {
          setEditItemDialogOpen(false);
        }}
        type="edit"
        catalogueCategory={catalogueCategoryData}
        catalogueItem={catalogueItemData}
        selectedItem={itemData}
      />
    </Grid>
  );
}

export default ItemsLandingPage;
