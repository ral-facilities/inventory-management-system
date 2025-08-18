import Grid from '@mui/material/Grid2';
import LZString from 'lz-string';
import type { MRT_ColumnFiltersState } from 'material-react-table';
import AdminCard from './adminCard.component';

function AdminCardView() {
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
      <AdminCard title="Units" to="units" />
      <AdminCard title="Usage Statuses" to="usage-statuses" />
      <AdminCard title="System Types" to="system-types" />
      <AdminCard title="Rules" to="rules" />
      <AdminCard
        title="Spares Definition"
        to={`system-types${sparesFilterState}`}
      />
    </Grid>
  );
}

export default AdminCardView;
