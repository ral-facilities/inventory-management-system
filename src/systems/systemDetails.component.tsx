import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { System } from '../api/api.types';
import { getSystemImportanceColour, useGetSystem } from '../api/systems';
import ActionMenu from '../common/actionMenu.component';
import PrimaryImage from '../common/images/primaryImage.component';
import TabView from '../common/tab/tabView.component';
import { formatDateTimeStrings, OverflowTip } from '../utils';
import SystemDialog from './systemDialog.component';
import { SystemItemsTable } from './systemItemsTable.component';

const SystemDetailsActionMenu = (props: { system: System }) => {
  const { system } = props;

  const [editSystemDialogOpen, setEditSystemDialogOpen] =
    React.useState<boolean>(false);

  return (
    <ActionMenu
      ariaLabelPrefix="systems page"
      uploadAttachmentsEntityId={system.id}
      uploadImagesEntityId={system.id}
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
      <Grid
        container
        sx={{
          display: 'flex',
          alignItems: 'center',
          my: 0.625,
        }}
        spacing={1}
      >
        <Grid size={9}>
          <OverflowTip
            sx={{
              typography: 'h5',
              fontWeight: 'bold',
            }}
          >
            {system === undefined ? 'No system selected' : system.name}
          </OverflowTip>
        </Grid>
        {system !== undefined && <SystemDetailsActionMenu system={system} />}
      </Grid>
      <Divider role="presentation" />
      {system === undefined ? (
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
        <Grid>
          <Grid container direction="column" wrap="nowrap" spacing={1}>
            <Grid
              container
              direction="row"
              sx={{
                justifyContent: "space-evenly",
                margin: 0,
                mt: 1
              }}>
              <Grid container spacing={2}>
                <Grid size="auto">
                  <PrimaryImage entityId={system.id} />
                </Grid>
                <Grid container spacing={1} size="grow">
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Typography sx={{
                      color: "text.primary"
                    }}>Location</Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        wordWrap: 'break-word'
                      }}>
                      {system.location ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: 'inline-flex' }}
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Typography sx={{
                      color: "text.primary"
                    }}>Importance</Typography>
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
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Typography sx={{
                      color: "text.primary"
                    }}>Owner</Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        wordWrap: 'break-word'
                      }}>
                      {system.owner ?? 'None'}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Typography sx={{
                      color: "text.primary"
                    }}>Last modified</Typography>
                    <Typography variant="body1" sx={{
                      color: "text.secondary"
                    }}>
                      {formatDateTimeStrings(system.modified_time, true)}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Typography sx={{
                      color: "text.primary"
                    }}>Created</Typography>
                    <Typography variant="body1" sx={{
                      color: "text.secondary"
                    }}>
                      {formatDateTimeStrings(system.created_time, true)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid>
              <Typography sx={{
                color: "text.primary"
              }}>Description</Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  whiteSpace: 'pre-line',
                  wordWrap: 'break-word'
                }}>
                {system.description ?? 'None'}
              </Typography>
            </Grid>
            <Grid container sx={{ marginTop: 2, display: 'inline-block' }}>
              <TabView
                ariaLabelPrefix="systems page"
                defaultTab="Items"
                galleryEntityId={system.id}
                attachmentsEntityId={system.id}
                tabData={[
                  {
                    value: 'Items',
                    icon: <InventoryOutlinedIcon />,
                    component: (
                      <SystemItemsTable system={system} type="normal" />
                    ),
                    order: 0,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
