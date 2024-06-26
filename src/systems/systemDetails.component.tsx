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
import { System } from '../api/api.types';
import { getSystemImportanceColour, useGetSystem } from '../api/systems';
import { OverflowTip, formatDateTimeStrings } from '../utils';
import SystemDialog from './systemDialog.component';
import { SystemItemsTable } from './systemItemsTable.component';

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
        requestType="patch"
        selectedSystem={props.system}
      />
    </>
  );
};

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useGetSystem(props.id);

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
        <OverflowTip
          sx={{
            typography: 'h6',
            fontWeight: 'bold',
          }}
        >
          {system === undefined
            ? !systemLoading && props.id !== null
              ? 'System not found'
              : 'No system selected'
            : system.name}
        </OverflowTip>
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
            <Grid item container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Location</Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {system.location ?? 'None'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'inline-flex' }}>
                <Typography variant="h6">Importance</Typography>
                <Chip
                  label={system.importance}
                  sx={() => {
                    const colorName = getSystemImportanceColour(
                      system.importance
                    );
                    return {
                      margin: 0,
                      marginLeft: 1,
                      bgcolor: `${colorName}.main`,
                      color: `${colorName}.contrastText`,
                    };
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Owner</Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ wordWrap: 'break-word' }}
                >
                  {system.owner ?? 'None'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Last modified</Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatDateTimeStrings(system.modified_time, true)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Created</Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatDateTimeStrings(system.created_time, true)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Typography variant="h6">Description</Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
            >
              {system.description ?? 'None'}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ paddingTop: 4 }}>
              Items
            </Typography>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <SystemItemsTable system={system} type="normal" />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
