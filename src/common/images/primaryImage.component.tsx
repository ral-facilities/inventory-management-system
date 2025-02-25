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
    handleCloseMenu();
    onChangePrimaryDialogOpen(true);
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
        <MenuItem onClick={handleOpenPrimary}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Set Primary Image</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export interface PrimaryImageProps {
  sx?: SxProps<Theme>;
  entityId?: string;
}

const PrimaryImage = (props: PrimaryImageProps) => {
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
      <Box sx={{ height: '20%' }}>
        <PrimaryOptionsMenu onChangePrimaryDialogOpen={setPrimaryDialogOpen} />
      </Box>
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

export default PrimaryImage;
