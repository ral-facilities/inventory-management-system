import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { getSystemImportanceColour, useSystem } from '../api/systems';

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useSystem(props.id);

  return systemLoading && props.id !== null ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: 200,
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
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
          <Grid
            container
            item
            direction="row"
            justifyContent="space-evenly"
            sx={{ margin: 0 }}
          >
            <Grid item container direction="column" spacing={1.5} xs={6}>
              <Grid item>
                <Typography variant="h6">Location</Typography>
                <Typography variant="body1">
                  {system.location ?? 'None'}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">Owner</Typography>
                <Typography variant="body1">
                  {system.owner ?? 'None'}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container direction="column" spacing={1.5} xs={6}>
              <Grid item sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="h6">Importance</Typography>
                <Chip
                  label={system.importance}
                  sx={{ marginLeft: 1 }}
                  color={getSystemImportanceColour(system.importance)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {system.description ?? 'None'}
            </Typography>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
