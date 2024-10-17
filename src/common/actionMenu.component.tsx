import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface ActionMenuProps {
  ariaLabelPrefix: string;
  editMenuItem: { onClick: () => void; dialog: React.ReactNode };
  printMenuItem: boolean;
}
function ActionMenu(props: ActionMenuProps) {
  const { editMenuItem, printMenuItem, ariaLabelPrefix } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid
      item
      xs={12}
      sm
      container
      sx={{
        textAlign: 'right',
        justifyContent: 'flex-end',
        alignItems: 'top',
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Grid item>
        <Typography variant="body1" sx={{ display: 'inline-block', mr: 1 }}>
          Actions
        </Typography>
        <IconButton
          onClick={handleMenuClick}
          sx={{
            border: '1px solid',
            borderRadius: 1,
            padding: '6px',
          }}
          aria-label={`${ariaLabelPrefix} actions menu`}
        >
          <ExpandMoreIcon />
        </IconButton>

        {/* Menu Component */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '@media print': {
              display: 'none',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              editMenuItem.onClick();
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {printMenuItem && (
            <MenuItem
              onClick={() => {
                window.print();
                handleMenuClose();
              }}
            >
              <PrintIcon fontSize="small" sx={{ mr: 1 }} />
              Print
            </MenuItem>
          )}
        </Menu>
      </Grid>
      {editMenuItem.dialog}
    </Grid>
  );
}

export default ActionMenu;
