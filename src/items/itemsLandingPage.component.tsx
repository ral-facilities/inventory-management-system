import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

import { useCatalogueItem } from '../api/catalogueItem';
import { useManufacturer } from '../api/manufacturer';
import { useItem } from '../api/item';
import { UsageStatusType } from '../app.types';

function ItemsLandingPage() {
  const { id } = useParams();

  const { data: itemData, isLoading: itemDataIsLoading } = useItem(id);

  const { data: catalogueItemIdData } = useCatalogueItem(
    itemData?.catalogue_item_id
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
          '@media print': {
            display: 'none',
          },
        }}
        item
      >
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to={
            catalogueItemIdData && catalogueItemIdData.id
              ? `/catalogue/item/${catalogueItemIdData.id}/items`
              : '/catalogue'
          }
          sx={{ mx: 0.5 }}
          variant="outlined"
        >
          {catalogueItemIdData
            ? `Back to ${catalogueItemIdData.name} items table view`
            : 'Home'}
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
      {catalogueItemIdData && itemData && (
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

              <Grid item xs={12}>
                <Collapse in={showDetails}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Serial Number
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {itemData?.serial_number ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Asset Number
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {itemData?.asset_number ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Purchase Order Number
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {itemData?.purchase_order_number ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Warranty End Date
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {itemData?.warranty_end_date
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
                        {itemData?.delivered_date
                          ? new Date(
                              itemData.delivered_date
                            ).toLocaleDateString()
                          : 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Is Defective
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {itemData?.is_defective ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Usage Status
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {
                          Object.values(UsageStatusType)[
                            itemData?.usage_status ?? UsageStatusType.new
                          ]
                        }
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
              <Grid item xs={12}>
                <Collapse in={showProperties}>
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
                            {String(property.value)}
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
                <Grid item xs={12}>
                  <Collapse in={showManufacturer}>
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
                          Address Line
                        </Typography>
                        <Typography align="left" color="text.secondary">
                          {manufacturer?.address.address_line}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography align="left" color="text.primary">
                          Town
                        </Typography>
                        <Typography align="left" color="text.secondary">
                          {manufacturer?.address.town}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography align="left" color="text.primary">
                          County
                        </Typography>
                        <Typography align="left" color="text.secondary">
                          {manufacturer?.address.county}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography align="left" color="text.primary">
                          Country
                        </Typography>
                        <Typography align="left" color="text.secondary">
                          {manufacturer?.address.country}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography align="left" color="text.primary">
                          Post/Zip code
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
              >
                {itemData?.notes}
              </Typography>
            </Grid>
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
    </Grid>
  );
}

export default ItemsLandingPage;
