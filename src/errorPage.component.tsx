//import { Grid } from '@mui/material';
import { Grid, Typography } from '@mui/material';
import { useRouteError } from 'react-router-dom';

type RouteError = {
  statusText?: string;
  message?: string;
};

function ErrorPage() {
  const error = useRouteError() as RouteError | null;

  console.log(error);

  return (
    <Grid item container flexDirection={'column'} alignContent={'center'}>
      <Typography variant="h3" sx={{ margin: 1, textAlign: 'center' }}>
        Oops!
      </Typography>
      <Typography variant="body1" sx={{ margin: 1, textAlign: 'center' }}>
        Sorry, an unexpected error has occured.
      </Typography>
      <Typography
        variant="body2"
        fontStyle={'italic'}
        sx={{ margin: 1, textAlign: 'center' }}
      >
        {error ? error.statusText || error.message : 'Unable to retrieve error'}
      </Typography>
    </Grid>
  );
}

export default ErrorPage;
