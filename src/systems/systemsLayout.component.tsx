import { Outlet, useParams } from 'react-router-dom';
import { useGetSystemsBreadcrumbs } from '../api/systems';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';

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
