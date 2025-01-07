import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetCatalogueCategory } from '../api/catalogueCategories';
import { useGetCatalogueItem } from '../api/catalogueItems';
import ItemsTable from './itemsTable.component';

export function Items() {
  // Navigation
  const { catalogue_item_id: catalogueItemId } = useParams();

  const { data: catalogueItem, isLoading: catalogueItemLoading } =
    useGetCatalogueItem(catalogueItemId);
  const { data: catalogueCategory } = useGetCatalogueCategory(
    catalogueItem?.catalogue_category_id
  );

  return (
    <Grid container>
      {catalogueCategory && catalogueItem && (
        <ItemsTable
          catalogueCategory={catalogueCategory}
          catalogueItem={catalogueItem}
          dense={false}
        />
      )}

      {!catalogueItemLoading ? (
        !catalogueItem && (
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
              These items don&#39;t exist. Please click the Home button on the
              top left of your screen to navigate to the catalogue home.
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

export default Items;
