import { Box, LinearProgress } from '@mui/material';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetCatalogueCategory } from '../../api/catalogueCategories';
import CatalogueItemsTable from './catalogueItemsTable.component';

const CatalogueItemsPage = () => {
  const { catalogue_category_id: catalogueCategoryId } = useParams();

  const { data: catalogueCategory, isLoading } =
    useGetCatalogueCategory(catalogueCategoryId);

  const navigate = useNavigate();

  React.useEffect(() => {
    // If it's a non leaf node, redirect to catalogue categories page page
    if (!isLoading && !catalogueCategory?.is_leaf) {
      navigate(`/catalogue/${catalogueCategoryId}`);
    }
  }, [catalogueCategory?.is_leaf, catalogueCategoryId, isLoading, navigate]);

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
