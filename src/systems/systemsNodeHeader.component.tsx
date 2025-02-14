import MoreHoriz from '@mui/icons-material/MoreHoriz';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  Card,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SystemTree } from '../api/systems';
import { OverflowTip } from '../utils';

interface SystemsNodeHeaderProps {
  data: {
    title: string | React.ReactNode;
    label: string | React.ReactNode;
    direction?: 'TB' | 'LR';
    system: SystemTree;
  };
}

const SystemsNodeHeader = (props: SystemsNodeHeaderProps) => {
  const { data } = props;
  const navigate = useNavigate();
  const isHorizontal = data.direction === 'LR';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Card
        component={Grid}
        container
        direction="column"
        sx={{
          padding: 2,
          width: '100%',
        }}
      >
        {/* Header Section */}
        <Grid
          item
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{
            paddingBottom: 1,
            marginBottom: 1,
          }}
        >
          <Grid
            item
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            xs={8}
          >
            <OverflowTip sx={{ fontWeight: 'bold', typography: 'h6' }}>
              {data.title}
            </OverflowTip>
          </Grid>
          <Grid
            item
            sx={{ display: 'flex', alignItems: 'center', margin: 1 }}
            xs={2}
          >
            <Tooltip title="System tree actions">
              <span>
                <IconButton
                  onClick={handleMenuClick}
                  aria-label={`${data.system.name} system tree actions menu`}
                >
                  <MoreHoriz />
                </IconButton>
              </span>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              sx={{
                '@media print': {
                  display: 'none',
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate(`/systems/${data.system.id}`);
                  handleMenuClose();
                }}
              >
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                Navigate to system page
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <Divider />
        {/* Label Section */}
        <Grid item>
          {typeof data.label === 'string' ? (
            <OverflowTip sx={{ fontWeight: 'bold', typography: 'body2' }}>
              {data.label}
            </OverflowTip>
          ) : (
            data.label
          )}
        </Grid>
      </Card>
      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        id={data.system.id ?? ''}
      />
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        id={data.system.id ?? ''}
      />
    </>
  );
};

export default SystemsNodeHeader;
