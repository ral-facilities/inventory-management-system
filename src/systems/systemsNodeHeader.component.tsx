import { MoreHoriz } from '@mui/icons-material';
import { Card, Divider, Grid, IconButton } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { OverflowTip } from '../utils';

interface SystemsNodeHeaderProps {
  data: {
    title: string | React.ReactNode;
    label: string | React.ReactNode;
    direction?: 'TB' | 'LR';
    id: string;
  };
}

const SystemsNodeHeader = (props: SystemsNodeHeaderProps) => {
  const { data } = props;

  const isHorizontal = data.direction === 'LR';
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
            {/* Actions Menu */}
            <IconButton size="small">
              <MoreHoriz />
            </IconButton>
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
        id={data.id}
      />
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        id={data.id}
      />
    </>
  );
};

export default SystemsNodeHeader;
