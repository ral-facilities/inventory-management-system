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
import { System } from '../app.types';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDialog from './systemDialog.component';

interface SystemButtonProps {
  system: System;
}

const EditSystemButton = (props: SystemButtonProps) => {
  const [editSystemDialogOpen, setEditSystemDialogOpen] =
    useState<boolean>(false);

  return (
    <>
      <Tooltip title="Edit System">
        <IconButton
          sx={{ marginLeft: 'auto', padding: 0 }}
          onClick={() => setEditSystemDialogOpen(true)}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <SystemDialog
        open={editSystemDialogOpen}
        onClose={() => setEditSystemDialogOpen(false)}
        type="edit"
        selectedSystem={props.system}
      />
    </>
  );
};

const DeleteSystemButton = (props: SystemButtonProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return (
    <>
      <Tooltip title="Delete System">
        <IconButton
          sx={{ padding: 0 }}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <DeleteSystemDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        system={props.system}
      />
    </>
  );
};

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
        {system !== undefined && (
          <>
            <EditSystemButton system={system} />
            <Box sx={{ px: 1 }} />
            <DeleteSystemButton system={system} />
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
                  sx={() => {
                    const colorName = getSystemImportanceColour(
                      system.importance
                    );
                    return {
                      marginLeft: 1,
                      bgcolor: `${colorName}.main`,
                      color: `${colorName}.contrastText`,
                    };
                  }}
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
