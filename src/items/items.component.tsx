import { Box, LinearProgress } from '@mui/material';
import { useParams } from 'react-router';
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

  if (catalogueItemLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (catalogueCategory && catalogueItem) {
    return (
      <ItemsTable
        catalogueCategory={catalogueCategory}
        catalogueItem={catalogueItem}
        dense={false}
      />
    );
  }
}

export default Items;
