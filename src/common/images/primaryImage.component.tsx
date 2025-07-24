import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router';
import { useGetImages } from '../../api/images';
import PrimaryImageDialog from './primaryImageDialog.component';
import RemovePrimaryImageDialog from './removePrimaryImageDialog.component';
import ThumbnailImage from './thumbnailImage.component';

interface PrimaryOptionsMenuInterface {
  onChangePrimaryDialogOpen: (dialogOpen: false | 'set' | 'remove') => void;
  primaryImageExists: boolean;
}

const PrimaryOptionsMenu = (props: PrimaryOptionsMenuInterface) => {
  const { onChangePrimaryDialogOpen, primaryImageExists } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenSetPrimary = () => {
    onChangePrimaryDialogOpen('set');
    handleCloseMenu();
  };

  const handleOpenRemovePrimary = () => {
    onChangePrimaryDialogOpen('remove');
    handleCloseMenu();
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Tooltip title="Primary Image Actions">
        <span>
          <IconButton
            aria-label="primary images action menu"
            onClick={handleOpenMenu}
            sx={{ padding: { xs: '0px', sm: '8px' } }}
          >
            <MoreHorizIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem onClick={handleOpenSetPrimary}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Set Primary Image</ListItemText>
        </MenuItem>
        {primaryImageExists && (
          <MenuItem onClick={handleOpenRemovePrimary}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Remove Primary Image</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export interface PrimaryImageProps {
  entityId: string;
  isDetailsPanel?: boolean;
}

const PrimaryImage = (props: PrimaryImageProps) => {
  const { entityId, isDetailsPanel = false } = props;

  const { data: imagesData, isLoading: imageLoading } = useGetImages(
    entityId,
    true
  );

  const primaryImageExists = !!imagesData && imagesData.length > 0;

  const [searchParams, setSearchParams] = useSearchParams();

  const handleViewPrimary = React.useCallback(() => {
    if (imagesData?.[0]) {
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set('tab', 'Gallery');
      updatedParams.set('image', imagesData?.[0].id);
      setSearchParams(updatedParams);
    }
  }, [searchParams, setSearchParams, imagesData]);

  const [primaryDialogOpen, setPrimaryDialogOpen] = React.useState<
    false | 'set' | 'remove'
  >(false);

  return (
    <>
      {!imageLoading && (
        <ThumbnailImage
          image={imagesData?.[0]}
          dense={isDetailsPanel}
          isPrimaryThumbnail
          imageLoading={imageLoading}
          onClick={isDetailsPanel ? undefined : handleViewPrimary}
        />
      )}
      {!isDetailsPanel && (
        <>
          <Box sx={{ height: '20%' }}>
            <PrimaryOptionsMenu
              onChangePrimaryDialogOpen={setPrimaryDialogOpen}
              primaryImageExists={primaryImageExists}
            />
          </Box>
          <PrimaryImageDialog
            open={primaryDialogOpen == 'set'}
            onClose={() => {
              setPrimaryDialogOpen(false);
            }}
            entityID={entityId}
          />
          {primaryImageExists && (
            <RemovePrimaryImageDialog
              open={primaryDialogOpen == 'remove'}
              onClose={() => {
                setPrimaryDialogOpen(false);
              }}
              image={imagesData[0]}
            />
          )}
        </>
      )}
    </>
  );
};

export default PrimaryImage;
