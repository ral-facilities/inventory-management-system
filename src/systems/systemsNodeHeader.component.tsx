import { MoreHoriz } from '@mui/icons-material';
import { Grid, IconButton } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { OverflowTip } from '../utils';

interface SystemsNodeHeaderProps {
  data: {
    title: string | React.ReactNode;
    label: string | React.ReactNode;
    direction?: 'TB' | 'LR';
    setNodeDimensions: (nodeId: string, width: number, height: number) => void;
    nodeId: string;
  };
}

const SystemsNodeHeader = (props: SystemsNodeHeaderProps) => {
  const { data } = props;

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      data.setNodeDimensions(data.nodeId, offsetWidth, offsetHeight);
    }
  }, [data, containerRef]);

  const isHorizontal = data.direction === 'LR';
  return (
    <Grid
      ref={containerRef}
      container
      direction="column"
      sx={{
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 1,
        width: '100%',
        padding: 2,
        backgroundColor: 'white',
      }}
    >
      {/* Header Section */}
      <Grid
        item
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{
          borderBottom: '1px solid #ddd',
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

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
      />
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
      />
    </Grid>
  );
};

export default SystemsNodeHeader;
