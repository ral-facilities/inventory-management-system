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
} from '../api/catalogueCategories';
import { useCatalogueItem } from '../api/catalogueItems';
import { useItem } from '../api/items';
import { useManufacturer } from '../api/manufacturers';
import { BreadcrumbsInfo } from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';
import ItemDialog from './itemDialog.component';
import { useNavigateToCatalogue } from '../catalogue/catalogue.component';
import { formatDateTimeStrings } from '../utils';
import { useSystem } from '../api/systems';

function ItemsLandingPage() {
  // Navigation

  const { item_id: id } = useParams();
  const navigateToCatalogue = useNavigateToCatalogue();

  const { data: itemData, isLoading: itemDataIsLoading } = useItem(id);

  const { data: catalogueItemData } = useCatalogueItem(
    itemData?.catalogue_item_id
  );

  const { data: catalogueCategoryData } = useCatalogueCategory(
    catalogueItemData?.catalogue_category_id
  );

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueItemData?.catalogue_category_id
  );

  const { data: systemData } = useSystem(itemData?.system_id);

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
          [
            `item/${catalogueItemData.id}/items/${id}`,
            itemData?.serial_number ?? 'No serial number',
          ],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItemData, id, itemData?.serial_number]);

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
            onChangeNode={navigateToCatalogue}
            breadcrumbsInfo={itemLandingBreadcrumbs}
            onChangeNavigateHome={() => navigateToCatalogue(null)}
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
            <Typography
              sx={{ margin: 1, textAlign: 'center', wordWrap: 'break-word' }}
              variant="h4"
            >
              {catalogueItemData.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h6">
              Description:
            </Typography>
            <Typography
              sx={{
                margin: 1,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                wordWrap: 'break-word',
              }}
              variant="body1"
              color="text.secondary"
            >
              {catalogueItemData.description ?? 'None'}
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
                    <Typography
                      align="left"
                      color="text.secondary"
                      sx={{ wordWrap: 'break-word' }}
                    >
                      {itemData.serial_number ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Asset Number
                    </Typography>
                    <Typography
                      align="left"
                      color="text.secondary"
                      sx={{ wordWrap: 'break-word' }}
                    >
                      {itemData.asset_number ?? 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Purchase Order Number
                    </Typography>
                    <Typography
                      align="left"
                      color="text.secondary"
                      sx={{ wordWrap: 'break-word' }}
                    >
                      {itemData.purchase_order_number ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Warranty End Date
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.warranty_end_date
                        ? formatDateTimeStrings(
                            itemData.warranty_end_date,
                            false
                          )
                        : 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Delivered Date
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {itemData.delivered_date
                        ? formatDateTimeStrings(itemData.delivered_date, false)
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
                    <Typography
                      align="left"
                      color="text.secondary"
                      sx={{ wordWrap: 'break-word' }}
                    >
                      {itemData.usage_status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      System
                    </Typography>
                    <Typography
                      align="left"
                      color="text.secondary"
                      sx={{ wordWrap: 'break-word' }}
                    >
                      <MuiLink
                        underline="hover"
                        component={Link}
                        to={'/systems/' + systemData?.id}
                      >
                        {systemData?.name}
                      </MuiLink>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Last modified
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {formatDateTimeStrings(itemData.modified_time, true)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography align="left" color="text.primary">
                      Created
                    </Typography>
                    <Typography align="left" color="text.secondary">
                      {formatDateTimeStrings(itemData.created_time, true)}
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
                        <Typography
                          align="left"
                          color="text.primary"
                          sx={{ wordWrap: 'break-word' }}
                        >{`${property.name} ${
                          property.unit ? `(${property.unit})` : ''
                        }`}</Typography>
                        <Typography
                          align="left"
                          color="text.secondary"
                          sx={{ wordWrap: 'break-word' }}
                        >
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
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {manufacturer?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        URL
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
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
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {manufacturer?.telephone ?? 'None'}
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
                        {manufacturer?.address.address_line}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {manufacturer?.address.town}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {manufacturer?.address.county}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
                        {manufacturer?.address.country}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        sx={{ wordWrap: 'break-word' }}
                      >
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
              sx={{
                margin: 1,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                wordWrap: 'break-word',
              }}
              variant="body1"
              color="text.secondary"
            >
              {itemData.notes ?? 'None'}
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
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              No result found
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              This item doesn&#39;t exist. Please click the Home button to
              navigate to the catalogue home
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      {editItemDialogOpen && (
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
      )}
    </Grid>
  );
}

export default ItemsLandingPage;
