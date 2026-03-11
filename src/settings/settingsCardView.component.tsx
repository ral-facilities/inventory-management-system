import Grid from '@mui/material/Grid2';
import LZString from 'lz-string';
import type { MRT_ColumnFiltersState } from 'material-react-table';
import React from 'react';
import { APISettingsContext } from '../apiConfigProvider.component';
import CriticalityJobDialog from './criticality/criticalityJobDialog.component';
import SettingsCard from './settingsCard.component';

function SettingsCardView() {
  const [openCriticalityDialog, setOpenCriticalityDialog] =
    React.useState<boolean>(false);

  const apiSettings = React.useContext(APISettingsContext);
  const isSparesDefinitionDefined = !!apiSettings.spares;

  const sparesFilter: { cF: MRT_ColumnFiltersState } = {
    cF: [
      {
        id: 'isSpare',
        value: { type: 'string', value: 'Yes' },
      },
    ],
  };
  const sparesFilterState = `?state=${LZString.compressToEncodedURIComponent(JSON.stringify(sparesFilter))}`;

  return (
    <Grid container>
      <SettingsCard title="Units" to="units" />
      <SettingsCard title="Usage Statuses" to="usage-statuses" />
      <SettingsCard title="System Types" to="system-types" />
      <SettingsCard title="Rules" to="rules" />
      <SettingsCard
        title="Spares Definition"
        to={`system-types${sparesFilterState}`}
      />
      <SettingsCard
        title="Criticality"
        onOpen={() => setOpenCriticalityDialog(true)}
      />
      {isSparesDefinitionDefined && (
        <CriticalityJobDialog
          open={openCriticalityDialog}
          onClose={() => setOpenCriticalityDialog(false)}
        />
      )}
    </Grid>
  );
}

export default SettingsCardView;
