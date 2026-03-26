import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Outlet,
  useLocation,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router';
import { BreadcrumbsInfo } from '../api/api.types';
import { getManufacturerQuery, useGetManufacturer } from '../api/manufacturers';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';

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
    const { manufacturer_id: manufacturerId, element_id: element_id } = params;

    if (manufacturerId || element_id) {
      await queryClient.ensureQueryData(
        getManufacturerQuery(manufacturerId ?? element_id, true)
      );
    }

    return { ...params };
  };

function ManufacturerLayout() {
  const { manufacturer_id: manufacturerId, element_id: element_id } =
    useParams();

  const { data: manufacturerData } = useGetManufacturer(
    manufacturerId ?? element_id
  );

  const [manufacturerBreadcrumbs, setManufacturerBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(undefined);

  const location = useLocation();

  React.useEffect(() => {
    console.log('MAN DATA');
    console.log(manufacturerData);
    if (manufacturerData) {
      setManufacturerBreadcrumbs({
        full_trail: true,
        trail: [
          [`/${manufacturerData.id}`, manufacturerData.name],
          ...((location.pathname.includes('history')
            ? [['/history', 'History']]
            : []) satisfies BreadcrumbsInfo['trail']),
        ],
      });
    } else {
      setManufacturerBreadcrumbs({
        full_trail: true,
        trail: [],
      });
    }
  }, [element_id, location.pathname, manufacturerData]);

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
