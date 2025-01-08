import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Outlet,
  useLocation,
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
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import ErrorPage from '../common/errorPage.component';

export const CatalogueErrorComponent = () => (
  <ErrorPage
    boldErrorText="Invalid Catalogue Route"
    errorText="The catalogue route you are trying to access doesn't exist. Please click the Home button to navigate back to the Catalogue Home page."
  />
);

export const CatalogueLayoutErrorComponent = () => {
  return (
    <BaseLayoutHeader homeLocation="Catalogue">
      <CatalogueErrorComponent />
    </BaseLayoutHeader>
  );
};

export const catalogueLayoutLoader =
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

  return (
    <BaseLayoutHeader
      homeLocation="Catalogue"
      breadcrumbsInfo={catalogueBreadcrumbs}
    >
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default CatalogueLayout;
