import { Box } from '@mui/material';
import React from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import { useGetManufacturer } from '../api/manufacturers';
import { paths } from '../App';
import Breadcrumbs from '../view/breadcrumbs.component';

function ManufacturerLayout() {
  const { manufacturer_id: manufacturerId } = useParams();

  const { data: manufacturerData } = useGetManufacturer(manufacturerId);

  const navigate = useNavigate();
  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(id ? `${paths.manufacturers}/${id}` : paths.manufacturers);
    },
    [navigate]
  );

  const [manufacturerLandingBreadcrumbs, setManufacturerLandingBreadcrumbs] =
    React.useState<BreadcrumbsInfo | undefined>(undefined);

  React.useEffect(() => {
    if (manufacturerData) {
      setManufacturerLandingBreadcrumbs({
        full_trail: true,
        trail: [
          [
            `${paths.manufacturer}/${manufacturerData.id}`,
            manufacturerData.name,
          ],
        ],
      });
    } else {
      setManufacturerLandingBreadcrumbs({
        full_trail: true,
        trail: [],
      });
    }
  }, [manufacturerData]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box
        sx={{
          py: 2.5,
          paddingLeft: 0.5,
        }}
      >
        <Breadcrumbs
          onChangeNode={onChangeNode}
          onChangeNavigateHome={() => onChangeNode(null)}
          breadcrumbsInfo={manufacturerLandingBreadcrumbs}
          homeLocation="Manufacturers"
        />
      </Box>
      <Outlet />
    </div>
  );
}
export default ManufacturerLayout;
