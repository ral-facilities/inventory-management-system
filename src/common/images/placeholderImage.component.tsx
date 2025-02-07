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
import React from 'react';
import PrimaryImageDialog from './primaryImageDialog.component';

interface PrimaryOptionsMenuInterface {
  onChangePrimaryDialogOpen: (dialogOpen: boolean) => void;
}

const PrimaryOptionsMenu = (props: PrimaryOptionsMenuInterface) => {
  const { onChangePrimaryDialogOpen } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenPrimary = () => {
    onChangePrimaryDialogOpen(true);
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpenMenu}
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
        <MenuItem onClick={handleOpenPrimary}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Set Primary Image</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export interface PlaceholderImageProps {
  sx?: SxProps<Theme>;
  entityId?: string;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { sx, entityId } = props;
  const [primaryDialogOpen, setPrimaryDialogOpen] =
    React.useState<boolean>(false);
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
      <PrimaryOptionsMenu onChangePrimaryDialogOpen={setPrimaryDialogOpen} />
      <PrimaryImageDialog
        open={primaryDialogOpen}
        onClose={() => {
          setPrimaryDialogOpen(false);
        }}
        entityID={entityId ?? ''}
      />
    </Grid>
  );
};

export default PlaceholderImage;
