import { Grid } from '@mui/material';
import React from 'react';
import AdminCard from './adminCard.component';
import SparesDefinitionDialog from './sparesDefinitionDialog.component';

function AdminCardView() {
  const [openAdminDialog, setOpenAdminDialog] = React.useState<
    false | 'sparesDefinition'
  >(false);

  return (
    <Grid container flexDirection={'column'}>
      <Grid item container xs={12} overflow={'auto'}>
        <Grid item key={0} xs={12} sm={6}>
          <AdminCard link={'units'} label={'Units'} type="page" />
        </Grid>
        <Grid item key={1} xs={12} sm={6}>
          <AdminCard
            link={'usage-statuses'}
            label={'Usage Statuses'}
            type="page"
          />
        </Grid>
        <Grid item key={2} xs={12} sm={6}>
          <AdminCard
            label={'Spares definition'}
            type="dialog"
            onClick={() => setOpenAdminDialog('sparesDefinition')}
          />
        </Grid>
      </Grid>
      <SparesDefinitionDialog
        open={openAdminDialog === 'sparesDefinition'}
        onClose={() => setOpenAdminDialog(false)}
      />
    </Grid>
  );
}

export default AdminCardView;
