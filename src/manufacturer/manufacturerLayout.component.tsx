import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { Outlet, useParams, type LoaderFunctionArgs } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import { getManufacturerQuery, useGetManufacturer } from '../api/manufacturers';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';
import paths from '../paths';

export const ManufacturerErrorComponent = () => {
  return <PageNotFoundComponent homeLocation="Manufacturers" />;
};

export const ManufacturerLayoutErrorComponent = () => {
  return (
    <BaseLayoutHeader homeLocation="Manufacturers">
      <ManufacturerErrorComponent />
    </BaseLayoutHeader>
  );
};

export const manufacturerLayoutLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { manufacturer_id: manufacturerId } = params;

    if (manufacturerId) {
      await queryClient.ensureQueryData(
        getManufacturerQuery(manufacturerId, true)
      );
    }

    return { ...params };
  };

function ManufacturerLayout() {
  const { manufacturer_id: manufacturerId } = useParams();

  const { data: manufacturerData } = useGetManufacturer(manufacturerId);

  const [manufacturerBreadcrumbs, setManufacturerBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(undefined);

  React.useEffect(() => {
    if (manufacturerData) {
      setManufacturerBreadcrumbs({
        full_trail: true,
        trail: [
          [
            `${paths.manufacturer}/${manufacturerData.id}`,
            manufacturerData.name,
          ],
        ],
      });
    } else {
      setManufacturerBreadcrumbs({
        full_trail: true,
        trail: [],
      });
    }
  }, [manufacturerData]);

  return (
    <BaseLayoutHeader
      homeLocation="Manufacturers"
      breadcrumbsInfo={manufacturerBreadcrumbs}
    >
      <Outlet />
    </BaseLayoutHeader>
  );
}
export default ManufacturerLayout;
