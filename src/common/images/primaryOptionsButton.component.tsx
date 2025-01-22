import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ListItemIcon } from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';

export interface PrimaryOptionsInterface {
  setDialog: (arg: boolean) => void;
}

const PrimaryOptionsMenu = (props: PrimaryOptionsInterface) => {
  const { setDialog } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setDialog(true);
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <ListItemIcon>
          <MoreVertIcon />
        </ListItemIcon>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Set Primary</MenuItem>
      </Menu>
    </div>
  );
};

export default PrimaryOptionsMenu;
