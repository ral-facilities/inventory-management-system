import type { QueryClient } from '@tanstack/react-query';
import { Outlet, useParams, type LoaderFunctionArgs } from 'react-router-dom';
import { getSystemQuery, useGetSystemsBreadcrumbs } from '../api/systems';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import ErrorPage from '../common/errorPage.component';

export const SystemsErrorComponent = () => {
  return (
    <ErrorPage
      boldErrorText="Invalid System Route"
      errorText="The system route you are trying to access doesn't exist. Please click the Home button to navigate back to the System Home page."
    />
  );
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
