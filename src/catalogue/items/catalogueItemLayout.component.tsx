import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Outlet, useLocation, useParams } from 'react-router';
import { useGetCatalogueItem } from '../../api/catalogueItems';
import CriticalityTooltipIcon from '../../common/criticalityTooltipIcon.component';
import { useAppSelector } from '../../state/hook';
import { selectCriticality } from '../../state/slices/criticalitySlice';

function CatalogueItemLayout() {
  const { catalogue_item_id: catalogueItemId, item_id: itemId } = useParams();

  const { data: catalogueItem } = useGetCatalogueItem(catalogueItemId);
  const location = useLocation();
  const { isCriticalMode } = useAppSelector(selectCriticality);

  const showFlagged = catalogueItem?.is_flagged;

  const getPageSubtitle = () => {
    // Check for individual item detail page (has item_id param)
    if (itemId) {
      return 'Item Details';
    }
    // Check for items list page (ends with /items or /items/)
    if (location.pathname.match(/\/items\/?$/)) {
      return 'Items';
    }
    return null;
  };

  const subtitle = getPageSubtitle();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          gap: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCriticalMode && (
            <CriticalityTooltipIcon
              label={'Items are running low in this catalogue item'}
              showFlagged={showFlagged}
            />
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              wordWrap: 'break-word',
            }}
          >
            {catalogueItem?.name}
          </Typography>
          {subtitle && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 'bold',
              }}
            >
              ({subtitle})
            </Typography>
          )}
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}

export default CatalogueItemLayout;
