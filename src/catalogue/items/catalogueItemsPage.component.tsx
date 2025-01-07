import { Box, LinearProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetCatalogueCategory } from '../../api/catalogueCategories';
import ErrorPage from '../../common/errorPage.component';
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

  if (!catalogueCategory) {
    return (
      <ErrorPage
        sx={{ marginTop: 2 }}
        boldErrorText="No results found"
        errorText={
          'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
        }
      />
    );
  }
  return <CatalogueItemsTable parentInfo={catalogueCategory} dense={false} />;
};

export default CatalogueItemsPage;
