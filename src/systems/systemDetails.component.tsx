import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import { getSystemImportanceColour, useGetSystem } from '../api/systems';
import ActionMenu from '../common/actionMenu.component';
import PlaceholderImage from '../common/placeholderImage.component';
import TabView from '../common/tab/tabView.component';
import { formatDateTimeStrings, OverflowTip } from '../utils';
import SystemDialog from './systemDialog.component';
import { SystemItemsTable } from './systemItemsTable.component';

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useGetSystem(props.id);

  const [editSystemDialogOpen, setEditSystemDialogOpen] =
    React.useState<boolean>(false);

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
      <Grid
        container
        item
        sx={{
          display: 'flex',
          alignItems: 'center',
          my: '5px',
        }}
        spacing={1}
      >
        <Grid item xs={9}>
          <OverflowTip
            sx={{
              typography: 'h5',
              fontWeight: 'bold',
            }}
          >
            {system === undefined
              ? !systemLoading && props.id !== null
                ? 'System not found'
                : 'No system selected'
              : system.name}
          </OverflowTip>
        </Grid>
        {system !== undefined && (
          <ActionMenu
            ariaLabelPrefix="systems page"
            editMenuItem={{
              onClick: () => {
                setEditSystemDialogOpen(true);
              },
              dialog: (
                <SystemDialog
                  open={editSystemDialogOpen}
                  onClose={() => setEditSystemDialogOpen(false)}
                  requestType="patch"
                  selectedSystem={system}
                />
              ),
            }}
          />
        )}
      </Grid>
      <Grid></Grid>
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
        <Grid container item direction="column" wrap="nowrap" spacing={1}>
          <Grid
            container
            item
            direction="row"
            justifyContent="space-evenly"
            sx={{ margin: 0, mt: 1 }}
          >
            <Grid item container spacing={2}>
              <Grid item xs={12} sm={4}>
                <PlaceholderImage />
              </Grid>
              <Grid item container spacing={1} xs={12} sm={8}>
                <Grid item xs={12} sm={6}>
                  <Typography color="text.primary">Location</Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {system.location ?? 'None'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'inline-flex' }}>
                  <Typography color="text.primary">Importance</Typography>
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
                  <Typography color="text.primary">Owner</Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ wordWrap: 'break-word' }}
                  >
                    {system.owner ?? 'None'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="text.primary">Last modified</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {formatDateTimeStrings(system.modified_time, true)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography color="text.primary">Created</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {formatDateTimeStrings(system.created_time, true)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item mt={2}>
            <Typography color="text.primary">Description</Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
            >
              {system.description ?? 'None'}
            </Typography>
          </Grid>
          <Grid item container sx={{ marginTop: 2, display: 'inline-block' }}>
            <TabView
              ariaLabelPrefix="systems page"
              defaultTab="Items"
              galleryEntityId={system.id}
              attachmentsEntityId={system.id}
              tabData={[
                {
                  value: 'Items',
                  icon: <InventoryOutlinedIcon />,
                  component: <SystemItemsTable system={system} type="normal" />,
                  order: 0,
                },
              ]}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
