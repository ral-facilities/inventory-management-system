import Grid from '@mui/material/Grid2';
import SettingsCard from './settingsCard.component';

function SettingsCardView() {
  return (
    <Grid container>
      <SettingsCard title="Units" to="units" />
      <SettingsCard title="Usage Statuses" to="usage-statuses" />
      <SettingsCard title="System Types" to="system-types" />
      <SettingsCard title="Rules" to="rules" />
    </Grid>
  );
}

export default SettingsCardView;
