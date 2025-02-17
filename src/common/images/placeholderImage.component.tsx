import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { APIImageWithURL } from '../../api/api.types';
import { getImageQuery, useGetImages } from '../../api/images';
import { queryClient } from '../../App';
import handleIMS_APIError from '../../handleIMS_APIError';
import PrimaryImageDialog from './primaryImageDialog.component';
import RemovePrimaryImageDialog from './removePrimaryImageDialog.component';

interface PrimaryOptionsMenuInterface {
  onChangePrimaryDialogOpen: (dialogOpen: false | 'set' | 'remove') => void;
  disableRemovePrimary: boolean;
}

const PrimaryOptionsMenu = (props: PrimaryOptionsMenuInterface) => {
  const { onChangePrimaryDialogOpen, disableRemovePrimary } = props;
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
    setAnchorEl(null);
  };

  const handleOpenRemovePrimary = () => {
    onChangePrimaryDialogOpen('remove');
    setAnchorEl(null);
  };

  console.log(`disabled ${disableRemovePrimary}`);

  return (
    <Box sx={{ height: '100%' }}>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="primary images action menu"
        onClick={handleOpenMenu}
        sx={{ padding: { xs: '0px', sm: '8px' } }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleOpenSetPrimary}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Set Primary Image</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleOpenRemovePrimary}
          disabled={disableRemovePrimary}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Remove Primary Image</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export interface PlaceholderImageProps {
  sx?: SxProps<Theme>;
  entityId?: string;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { sx, entityId } = props;

  const { data: imagesData } = useGetImages(entityId, true);

  const [imageData, setImageData] = React.useState<APIImageWithURL>();

  const primaryImageExists = imagesData && imagesData.length > 0;

  queryClient
    .fetchQuery(
      getImageQuery(
        primaryImageExists ? imagesData[0].id : '',
        false,
        primaryImageExists
      )
    )
    .then((data: APIImageWithURL) => {
      setImageData(data);
    })
    .catch((error: AxiosError) => {
      handleIMS_APIError(error);
    });

  const [primaryDialogOpen, setPrimaryDialogOpen] = React.useState<
    false | 'set' | 'remove'
  >(false);
  return (
    <Grid sx={{ height: '100%', width: '100%' }}>
      <Box
        sx={{
          height: '80%',
          borderRadius: 2,
          backgroundColor: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'text.primary',
          border: '1px dashed',
          borderColor: 'text.primary',
          ...sx,
        }}
      >
        <Typography variant="h5">No Image</Typography>
      </Box>
      <Box sx={{ height: '20%' }}>
        <PrimaryOptionsMenu
          onChangePrimaryDialogOpen={setPrimaryDialogOpen}
          disableRemovePrimary={!primaryImageExists}
        />
      </Box>
      <PrimaryImageDialog
        open={primaryDialogOpen == 'set'}
        onClose={() => {
          setPrimaryDialogOpen(false);
        }}
        entityID={entityId ?? ''}
      />
      <RemovePrimaryImageDialog
        open={primaryDialogOpen == 'remove'}
        onClose={() => {
          setPrimaryDialogOpen(false);
        }}
        image={imageData ?? undefined}
      />
    </Grid>
  );
};

export default PlaceholderImage;
