import { Box, Grid } from '@mui/material';
import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import {
  getCatalogueCategoryQuery,
  useGetCatalogueBreadcrumbs,
} from '../api/catalogueCategories';
import {
  getCatalogueItemQuery,
  useGetCatalogueItem,
} from '../api/catalogueItems';
import { getItemQuery, useGetItem } from '../api/items';
import Breadcrumbs from '../view/breadcrumbs.component';

/* Returns function that navigates to a specific catalogue category id or catalogue path (or to the root of
   all categories if given null) */
export const useNavigateToCatalogue = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newIdPath: string | null) => {
      navigate(`/catalogue${newIdPath ? `/${newIdPath}` : ''}`);
    },
    [navigate]
  );
};

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const {
      catalogue_category_id: catalogueCategoryId,
      catalogue_item_id: catalogueItemId,
      item_id: itemId,
    } = params;
    if (catalogueCategoryId) {
      await queryClient.ensureQueryData(
        getCatalogueCategoryQuery(catalogueCategoryId, true)
      );
    }
    if (catalogueItemId) {
      const catalogueItem = await queryClient.ensureQueryData(
        getCatalogueItemQuery(catalogueItemId, true)
      );

      if (catalogueItem.catalogue_category_id !== catalogueCategoryId) {
        throw new Error(
          `Catalogue item ${catalogueItemId} does not belong to category ${catalogueCategoryId}`
        );
      }
    }
    if (itemId) {
      await queryClient.ensureQueryData(getItemQuery(itemId, true));
    }

    return { ...params };
  };

function CatalogueLayout() {
  const {
    catalogue_category_id: catalogueCategoryId,
    catalogue_item_id: catalogueItemId,
    item_id: itemId,
  } = useParams();

  const location = useLocation();

  // Remove the trailing slash (if it exists) before splitting
  const cleanPath = location.pathname.replace(/\/$/, '');

  // Now split the cleaned path
  const cataloguePath = cleanPath.split('/');

  const lastSegmentOfCataloguePath = cataloguePath[cataloguePath.length - 1];

  const { data: breadcrumbs } = useGetCatalogueBreadcrumbs(catalogueCategoryId);
  const { data: catalogueItem } = useGetCatalogueItem(catalogueItemId);

  const { data: item } = useGetItem(itemId);

  const [catalogueBreadcrumbs, setCatalogueBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(breadcrumbs);
  React.useEffect(() => {
    if (breadcrumbs) {
      setCatalogueBreadcrumbs({
        ...breadcrumbs,
        trail: [
          // Catalogue categories
          ...(lastSegmentOfCataloguePath === catalogueCategoryId
            ? [...breadcrumbs.trail]
            : []),
          // Catalogue items
          ...(lastSegmentOfCataloguePath === 'items' &&
          cataloguePath.length === 4
            ? [...breadcrumbs.trail]
            : []),
          // Catalogue item landing page
          ...((catalogueItem && lastSegmentOfCataloguePath === catalogueItem.id
            ? [
                ...breadcrumbs.trail,
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}`,
                  catalogueItem.name,
                ],
              ]
            : []) satisfies BreadcrumbsInfo['trail']),
          // Items table
          ...((catalogueItem && lastSegmentOfCataloguePath === 'items'
            ? [
                ...breadcrumbs.trail,
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}`,
                  `${catalogueItem.name}`,
                ],
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}/items`,
                  'Items',
                ],
              ]
            : []) satisfies BreadcrumbsInfo['trail']),
          // Item landing page
          ...((catalogueItem && item && lastSegmentOfCataloguePath === item.id
            ? [
                ...breadcrumbs.trail,
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}`,
                  `${catalogueItem.name}`,
                ],
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}/items`,
                  'Items',
                ],
                [
                  `${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}/items/${item.id}`,
                  item?.serial_number ?? 'No serial number',
                ],
              ]
            : []) satisfies BreadcrumbsInfo['trail']),
        ],
      });
    } else {
      setCatalogueBreadcrumbs(undefined);
    }
  }, [
    breadcrumbs,
    catalogueCategoryId,
    catalogueItem,
    cataloguePath.length,
    item,
    lastSegmentOfCataloguePath,
  ]);

  const navigateToCatalogue = useNavigateToCatalogue();

  return (
    <Box height="100%">
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{
          justifyContent: 'left',
          paddingLeft: 0.5,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          <Breadcrumbs
            onChangeNode={navigateToCatalogue}
            breadcrumbsInfo={catalogueBreadcrumbs}
            onChangeNavigateHome={() => navigateToCatalogue(null)}
            homeLocation="Catalogue"
          />
        </div>
      </Grid>
      <Outlet />
    </Box>
  );
}

export default CatalogueLayout;
