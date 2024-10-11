import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Typography,
} from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { System } from '../api/api.types';
import { getSystemImportanceColour, useGetSystem } from '../api/systems';
import PlaceholderImage from '../common/placeholderImage.component';
import {
  OverflowTip,
  StyledTab,
  TabPanel,
  a11yProps,
  formatDateTimeStrings,
} from '../utils';
import SystemDialog from './systemDialog.component';
import { SystemItemsTable } from './systemItemsTable.component';

export const SYSTEM_LANDING_PAGE_TAB_VALUES = [
  'Items',
  'Gallery',
  'Attachments',
] as const;

// Type for base tab values
export type SystemLandingPageTabValue =
  (typeof SYSTEM_LANDING_PAGE_TAB_VALUES)[number];

export const systemLandingPageIconMapping: Record<
  SystemLandingPageTabValue,
  React.ReactElement
> = {
  Items: <InventoryOutlinedIcon />,
  Gallery: <CollectionsOutlinedIcon />,
  Attachments: <AttachmentOutlinedIcon />,
};

interface SystemButtonProps {
  system: System;
}

const SystemActionsMenu = (props: SystemButtonProps) => {
  const [editSystemDialogOpen, setEditSystemDialogOpen] =
    React.useState<boolean>(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid item xs sx={{ marginLeft: 'auto', padding: 0, textAlign: 'right' }}>
      <Typography variant="body1" sx={{ display: 'inline-block', mr: 1 }}>
        Actions
      </Typography>
      <IconButton
        onClick={handleMenuClick}
        sx={{
          border: '1px solid',
          borderRadius: 1,
          padding: '6px',
        }}
        aria-label="systems page actions menu"
      >
        <ExpandMoreIcon />
      </IconButton>

      {/* Menu Component */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '@media print': {
            display: 'none',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setEditSystemDialogOpen(true);
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
      </Menu>
      <SystemDialog
        open={editSystemDialogOpen}
        onClose={() => setEditSystemDialogOpen(false)}
        requestType="patch"
        selectedSystem={props.system}
      />
    </Grid>
  );
};

export interface SystemDetailsProps {
  id: string | null;
}

function SystemDetails(props: SystemDetailsProps) {
  const { data: system, isLoading: systemLoading } = useGetSystem(props.id);

  const [searchParams, setSearchParams] = useSearchParams();

  // Retrieve the tab value from the URL or default to "Information"
  const urlTabValue =
    (searchParams.get('tab') as SystemLandingPageTabValue) || 'Items';
  const [tabValue, setTabValue] =
    React.useState<SystemLandingPageTabValue>(urlTabValue);

  React.useEffect(() => {
    const value = searchParams.get('tab');
    if (!value && system) setSearchParams({ tab: 'Items' }, { replace: true });
  }, [searchParams, setSearchParams, system]);

  React.useEffect(() => {
    setTabValue(urlTabValue);
  }, [urlTabValue]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: SystemLandingPageTabValue
  ) => {
    setTabValue(newValue);
    setSearchParams({ tab: newValue }, { replace: true });
  };

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
        {system !== undefined && <SystemActionsMenu system={system} />}
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
          <Grid item>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="systems page view tabs"
            >
              {SYSTEM_LANDING_PAGE_TAB_VALUES.map((value) => (
                <StyledTab
                  icon={systemLandingPageIconMapping[value]}
                  iconPosition="start"
                  value={value}
                  label={value}
                  key={value}
                  {...a11yProps(value)}
                />
              ))}
            </Tabs>
          </Grid>

          <Grid item>
            <TabPanel<SystemLandingPageTabValue> value={tabValue} label="Items">
              <SystemItemsTable system={system} type="normal" />
            </TabPanel>
            <TabPanel<SystemLandingPageTabValue>
              value={tabValue}
              label="Gallery"
            ></TabPanel>
            <TabPanel<SystemLandingPageTabValue>
              value={tabValue}
              label="Attachments"
            ></TabPanel>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SystemDetails;
