import { QueryClient } from '@tanstack/react-query';
import { getHistoryEntriesQuery, useGetHistoryEntries } from '../api/history';
import { LoaderFunctionArgs, Outlet, useParams } from 'react-router';
import React from 'react';
import { BreadcrumbsInfo } from '../api/api.types';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import { capitalize } from '@mui/material';
import { RoutesHomeLocationType } from '../app.types';

export const historyLayoutLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { collection, element_id } = params;

    if (element_id && collection) {
      await queryClient.ensureQueryData(
        getHistoryEntriesQuery(collection, element_id, true)
      );
    }

    return { ...params };
  };

function HistoryLayout() {
  const { collection, element_id } = useParams();

  const { data: historyData } = useGetHistoryEntries(collection!, element_id!);

  const [historyBreadcrumbs, setHistoryBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(undefined);

  React.useEffect(() => {
    if (historyData) {
      console.log(historyData);
      setHistoryBreadcrumbs({
        full_trail: true,
        trail: [
          [
            `${collection}/${element_id}`,
            (historyData[historyData.length - 1].updated_fields[
              'name'
            ] as string) ?? 'Unknown',
          ],
          ['history', 'History'],
        ],
      });
    } else {
      setHistoryBreadcrumbs({
        full_trail: true,
        trail: [],
      });
    }
  }, [collection, element_id, historyData]);

  return (
    <BaseLayoutHeader
      homeLocation={capitalize(collection!) as RoutesHomeLocationType}
      breadcrumbsInfo={historyBreadcrumbs}
    >
      <Outlet />
    </BaseLayoutHeader>
  );
}
export default HistoryLayout;
