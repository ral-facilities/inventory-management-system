import Grid from '@mui/material/Grid2';
import AdminCard from './adminCard.component';

function AdminCardView() {
  return (
    <Grid container>
      <AdminCard title="Units" to="units" />
      <AdminCard title="Usage Statuses" to="usage-statuses" />
      <AdminCard title="System Types" to="system-types" />
      <AdminCard title="Rules" to="rules" />
    </Grid>
  );
}

export default AdminCardView;
