import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCatalogueItem } from '../../api/catalogueItem';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Box, Button, Collapse } from '@mui/material';
import { useCatalogueCategoryById } from '../../api/catalogueCategory';

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

  return (
    <Grid container>
      <Grid sx={{ padding: '8px' }} item>
        <Button
          component={Link}
          to={`/inventory-management-system/catalogue${
            catalogueCategoryData?.path ?? ''
          }`}
          sx={{ margin: '8px' }}
          variant="outlined"
        >
          {catalogueItemIdData
            ? `Back to ${catalogueCategoryData?.name} table view`
            : 'Home'}
        </Button>
        <Button
          disabled={!catalogueItemIdData}
          sx={{ margin: '8px' }}
          variant="outlined"
        >
          Edit
        </Button>
      </Grid>
      {catalogueItemIdData && (
        <Grid item xs={12}>
          <Box
            sx={{
              padding: '20px',
              textAlign: 'left', // Left-align text
              mx: '192px',
            }}
          >
            <Typography
              sx={{ margin: '8px', textAlign: 'center' }}
              variant="h4"
            >
              {catalogueItemIdData.name}
            </Typography>
            <Typography sx={{ margin: '8px' }} variant="h6">
              Description:
            </Typography>
            <Typography sx={{ margin: '8px' }} variant="body1">
              {catalogueItemIdData.description}
            </Typography>
            <Box
              onClick={toggleProperties}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                cursor: 'pointer',
                margin: '8px',
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
            </Box>
            <Collapse in={showProperties}>
              <Grid container spacing={1}>
                {catalogueItemIdData.properties &&
                  catalogueItemIdData.properties.map((property, index) => (
                    <Grid item xs={6} key={index}>
                      <ListItem
                        style={{
                          justifyContent: 'flex-start',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={property.name}
                          secondary={String(property.value)}
                        />
                      </ListItem>
                    </Grid>
                  ))}
              </Grid>
            </Collapse>
          </Box>
        </Grid>
      )}
      {!catalogueItemIdData && !catalogueItemIdDataLoading && (
        <Box
          sx={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>No result found</Typography>
          <Typography>
            This item doesn't exist. Please click the Home button to navigate to
            the catalogue home
          </Typography>
        </Box>
      )}
    </Grid>
  );
}

export default CatalogueItemsLandingPage;
