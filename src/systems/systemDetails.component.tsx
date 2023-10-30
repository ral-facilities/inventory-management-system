import { Box, Divider, Typography } from '@mui/material';
import { useSystem } from '../api/systems';

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useSystem(props.id);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: 1.5,
        }}
      >
        <Typography variant="h6">
          {systemLoading || system === undefined
            ? 'No system selected'
            : system.name}
        </Typography>
      </Box>
      <Divider role="presentation" />
      {systemLoading || system === undefined ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: 1,
          }}
        >
          <Typography variant="h3">Please select a system</Typography>
        </Box>
      ) : (
        <Typography variant="h6">
          {JSON.stringify(system, undefined, 2)}
        </Typography>
      )}
    </>
  );
}

export default SystemDetails;
