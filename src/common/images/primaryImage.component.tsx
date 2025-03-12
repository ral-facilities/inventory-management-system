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
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useGetImages } from '../../api/images';
import PrimaryImageDialog from './primaryImageDialog.component';
import RemovePrimaryImageDialog from './removePrimaryImageDialog.component';

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
  sx?: SxProps<Theme>;
  entityId: string;
}

const PrimaryImage = (props: PrimaryImageProps) => {
  const { sx, entityId } = props;

  const { data: imagesData } = useGetImages(entityId, true);

  const primaryImageExists = !!imagesData && imagesData.length > 0;

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
    </Grid>
  );
};

export default PrimaryImage;
