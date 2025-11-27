import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { BreadcrumbsInfo } from '../api/api.types';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';
import paths from '../paths';

export const SettingsErrorComponent = () => {
  return <PageNotFoundComponent homeLocation="Settings" />;
};

// returns the settings function from the path (null when just on settingsPage)
export const useGetSettingsPageName = (): string | null => {
  const location = useLocation();

  return React.useMemo(() => {
    const settingsPageName: string | null = location.pathname.replace(
      paths.settings,
      ''
    );
    return settingsPageName === '' ? null : settingsPageName.replace('/', '');
  }, [location.pathname]);
};

const settingsBreadCrumbsTrails: { [key: string]: BreadcrumbsInfo['trail'] } = {
  ['units']: [['units', 'Units']],
  ['usage-statuses']: [['usage-statuses', 'Usage statuses']],
  ['system-types']: [['system-types', 'System types']],
  ['rules']: [['rules', 'Rules']],
};

function SettingsLayout() {
  const settingsPageName = useGetSettingsPageName();

  const settingsBreadCrumbs: BreadcrumbsInfo | undefined =
    settingsPageName && settingsPageName in settingsBreadCrumbsTrails
      ? {
          trail: settingsBreadCrumbsTrails[settingsPageName],
          full_trail: true,
        }
      : undefined;

  return (
    <BaseLayoutHeader
      homeLocation="Settings"
      breadcrumbsInfo={settingsBreadCrumbs}
    >
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default SettingsLayout;
