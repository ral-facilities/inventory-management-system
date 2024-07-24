import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategory,
} from '../api/catalogueCategories';
import { useCatalogueItem } from '../api/catalogueItems';
import { useNavigateToCatalogue } from '../catalogue/catalogue.component';
import Breadcrumbs from '../view/breadcrumbs.component';
import ItemsTable from './itemsTable.component';

export function Items() {
  // Navigation
  const { catalogue_item_id: catalogueItemId } = useParams();
  const navigateToCatalogue = useNavigateToCatalogue();

  const { data: catalogueItem, isLoading: catalogueItemLoading } =
    useCatalogueItem(catalogueItemId);
  const { data: catalogueCategory } = useGetCatalogueCategory(
    catalogueItem?.catalogue_category_id
  );

  const { data: catalogueBreadcrumbs } = useGetCatalogueBreadcrumbs(
    catalogueItem?.catalogue_category_id
  );

  const [itemsBreadcrumbs, setItemsBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(catalogueBreadcrumbs);

  React.useEffect(() => {
    catalogueBreadcrumbs &&
      catalogueItem &&
      setItemsBreadcrumbs({
        ...catalogueBreadcrumbs,
        trail: [
          ...catalogueBreadcrumbs.trail,
          [`item/${catalogueItem.id}`, `${catalogueItem.name}`],
          [`item/${catalogueItem.id}/items`, 'Items'],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItem]);

  return (
    <Grid container>
      <Grid
        container
        item
        sx={{
          display: 'flex',
          justifyContent: 'left',
          paddingLeft: 0.5,
          py: 2.5,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
        }}
      >
        <Breadcrumbs
          onChangeNode={navigateToCatalogue}
          breadcrumbsInfo={itemsBreadcrumbs}
          onChangeNavigateHome={() => navigateToCatalogue(null)}
          navigateHomeAriaLabel={'navigate to catalogue home'}
        />
      </Grid>

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
