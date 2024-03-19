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
import SystemDialog from './systemDialog.component';
import { SystemItemsTable } from './systemItemsTable.component';
import { formatDateTimeStrings } from '../utils';

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
          {system === undefined
            ? !systemLoading && props.id !== null
              ? 'System not found'
              : 'No system selected'
            : system.name}
        </Typography>
        {system !== undefined && <EditSystemButton system={system} />}
      </Box>
      <Divider role="presentation" />
      {system === undefined ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: 1,
          }}
        >
          {!systemLoading && props.id !== null ? (
            <Typography>
              The system you searched for does not exist. Please navigate home
              by pressing the home button at the top left of your screen.
            </Typography>
          ) : (
            <Typography variant="h3">Please select a system</Typography>
          )}
        </Box>
      ) : (
        <Grid
          container
          direction="column"
          sx={{ padding: 1.5 }}
          wrap="nowrap"
          spacing={1}
        >
          <Grid
            container
            item
            direction="row"
            justifyContent="space-evenly"
            sx={{ margin: 0 }}
          >
            <Grid item container direction="column" spacing={1} xs={6}>
              <Grid item>
                <Typography variant="h6">Location</Typography>
                <Typography variant="body1" color="text.secondary">
                  {system.location ?? 'None'}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">Owner</Typography>
                <Typography variant="body1" color="text.secondary">
                  {system.owner ?? 'None'}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container direction="column" spacing={1} xs={6}>
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
              <Grid
                item
                sx={{
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Last modified</Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatDateTimeStrings(system.modified_time)}
                </Typography>
              </Grid>
              <Grid
                item
                sx={{
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Created</Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatDateTimeStrings(system.created_time)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="h6">Description</Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {system.description ?? 'None'}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ paddingTop: 2 }}>
              Items
            </Typography>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <SystemItemsTable system={system} />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
