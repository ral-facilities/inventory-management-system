import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import { useCatalogueItem } from '../api/catalogueItem';
import { Link, useParams } from 'react-router-dom';
import { useCatalogueCategory } from '../api/catalogueCategory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ItemsTable from './itemsTable.component';

export function Items() {
  const { id: catalogueItemId } = useParams();
  const { data: catalogueItem } = useCatalogueItem(catalogueItemId);
  const { data: catalogueCategory } = useCatalogueCategory(
    catalogueItem?.catalogue_category_id
  );

  return (
    <Grid container>
      <Grid
        container
        item
        style={{
          display: 'flex',
          justifyContent: 'left',
          padding: 22,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
        }}
      >
        <Button
          sx={{ mx: 0.5 }}
          component={Link}
          startIcon={
            <Box sx={{ alignItems: 'center', display: 'flex' }}>
              <ArrowBackIcon fontSize="small" />{' '}
              <ArrowBackIcon fontSize="small" />
            </Box>
          }
          to={
            catalogueCategory
              ? `/catalogue/${catalogueCategory.id}`
              : '/catalogue'
          }
          variant="outlined"
        >
          {catalogueCategory
            ? `Back to ${catalogueCategory?.name} table view`
            : 'Home'}
        </Button>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mx: 0.5 }}
          component={Link}
          to={
            catalogueItem ? `/catalogue/item/${catalogueItem.id}` : '/catalogue'
          }
          variant="outlined"
        >
          Back to {`${catalogueItem?.name} landing page`}
        </Button>
      </Grid>
      {catalogueCategory && catalogueItem && (
        <ItemsTable
          catalogueCategory={catalogueCategory}
          catalogueItem={catalogueItem}
        />
      )}
    </Grid>
  );
}

export default Items;
