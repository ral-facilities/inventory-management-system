import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { getSystemImportanceColour, useSystem } from '../api/systems';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDialog from './systemDialog.component';

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useSystem(props.id);

  // Dialogues
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editSystemDialogOpen, setEditSystemDialogOpen] =
    useState<boolean>(false);

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
        <Typography variant="h6">
          {systemLoading || system === undefined
            ? 'No system selected'
            : system.name}
        </Typography>
        {system !== undefined && (
          <>
            <Tooltip title="Edit System">
              <IconButton
                sx={{ marginLeft: 'auto', padding: 0 }}
                onClick={() => setEditSystemDialogOpen(true)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete System">
              <IconButton
                sx={{ padding: 0, pl: 2 }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <SystemDialog
              open={editSystemDialogOpen}
              onClose={() => setEditSystemDialogOpen(false)}
              type="edit"
              selectedSystem={system}
            />
            <DeleteSystemDialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              system={system}
            />
          </>
        )}
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
            <Typography variant="h6">Location</Typography>
            <Typography variant="body1">{system.location ?? 'None'}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6">Owner</Typography>
            <Typography variant="body1">{system.owner ?? 'None'}</Typography>
          </Grid>
          <Grid item sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h6">Importance</Typography>
            <Chip
              label={system.importance}
              sx={{ marginLeft: 1 }}
              color={getSystemImportanceColour(system.importance)}
            />
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
