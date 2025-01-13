import type { QueryClient } from '@tanstack/react-query';
import { Outlet, useParams, type LoaderFunctionArgs } from 'react-router-dom';
import { getSystemQuery, useGetSystemsBreadcrumbs } from '../api/systems';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';

export const SystemsErrorComponent = () => {
  return <PageNotFoundComponent homeLocation="Systems" />;
};

export const SystemsLayoutErrorComponent = () => {
  return (
    <BaseLayoutHeader homeLocation="Systems">
      <SystemsErrorComponent />
    </BaseLayoutHeader>
  );
};

export const systemsLayoutLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { system_id: systemId } = params;

    if (systemId) {
      await queryClient.ensureQueryData(getSystemQuery(systemId, true));
    }

    return { ...params };
  };

function SystemsLayout() {
  const { system_id: systemId } = useParams();

  const { data: systemsBreadcrumbs } = useGetSystemsBreadcrumbs(systemId);

  return (
    <BaseLayoutHeader
      homeLocation="Systems"
      breadcrumbsInfo={systemsBreadcrumbs}
    >
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default SystemsLayout;
