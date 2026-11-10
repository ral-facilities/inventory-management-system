import {
  Box,
  Button,
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

type TableActionMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
}

export interface TableActionMenuProps {
  ariaLabelPrefix: string;
  items: TableActionMenuItem[];
}

export const TableActionMenu = (props: TableActionMenuProps) => {
  const { ariaLabelPrefix, items } = props;

  const theme = useTheme();
  const isMenuShrunk = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {isMenuShrunk ? (
        <Tooltip title={`${ariaLabelPrefix} table actions menu`}>
          <span>
            <IconButton
              onClick={handleClick}
              aria-label={`${ariaLabelPrefix} table actions menu`}
              sx={(theme) => ({
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.common.white,
              })}
            >
              <MoreHorizIcon />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Stack
          direction="row"
          display={{ xs: 'none', md: 'flex' }}
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap' }}
        >
          {items.map((item, i) => (
            <Button
              key={`table-action-menu-${i}`}
              startIcon={item.icon}
              variant="outlined"
              onClick={item.onClick}
              disabled={item.isDisabled}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '@media print': {
            display: 'none',
          },
        }}
      >
        {items.map((item, i) => (
          <MenuItem
            key={`table-action-menu-${i}`}
            onClick={() => {
              handleClose();
              item.onClick?.();
            }}
            disabled={item.isDisabled}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}