import { Box, LinearProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetCatalogueCategory } from '../../api/catalogueCategories';
import CatalogueItemsTable from './catalogueItemsTable.component';

const CatalogueItemsPage = () => {
  const { catalogue_category_id: catalogueCategoryId } = useParams();

  const { data: catalogueCategory, isLoading } =
    useGetCatalogueCategory(catalogueCategoryId);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (catalogueCategory) {
    return <CatalogueItemsTable parentInfo={catalogueCategory} dense={false} />;
  }
};

export default CatalogueItemsPage;
