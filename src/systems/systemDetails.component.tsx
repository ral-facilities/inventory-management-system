import { Box, Chip, Divider, Grid, Typography } from '@mui/material';
import { getSystemImportanceColour, useSystem } from '../api/systems';

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
        <Grid container direction="column" spacing={1.5} sx={{ margin: 0 }}>
          <Grid item>
            <Typography variant="body1" fontWeight="fontWeightBold">
              Description:
            </Typography>
            <Typography variant="body1">{system.description}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" component="div">
              <Box fontWeight="fontWeightBold" display="inline">
                Location:{' '}
              </Box>
              {system.location}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" component="div">
              <Box fontWeight="fontWeightBold" display="inline">
                Owner:{' '}
              </Box>
              {system.owner}
            </Typography>
          </Grid>
          <Grid item sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight="fontWeightBold">
              Importance:{' '}
            </Typography>
            <Chip
              label={system.importance}
              sx={{ marginLeft: 1 }}
              color={getSystemImportanceColour(system.importance)}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
