import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function AdminCardView() {
  return (
    <Grid container>
      <Grid container flexDirection={'column'}>
        <Grid item container xs={12} overflow={'auto'}>
          <Grid item key={0} xs={12} sm={6}>
            <Button
              component={Link}
              to="units"
              fullWidth
              sx={{
                display: 'flex',
                width: '100%',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative', // Make the parent container relative
              }}
            >
              <Card
                sx={{
                  padding: 1,
                  width: '100%',
                  display: 'flex',
                  height: '100px', // Set a fixed height for all cards
                }}
              >
                <CardContent
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <Grid>
                    <Grid position="relative">
                      <Typography>Units</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Button>
          </Grid>
          <Grid item key={1} xs={12} sm={6}>
            <Button
              component={Link}
              to={'usage-statuses'}
              fullWidth
              sx={{
                display: 'flex',
                width: '100%',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
              }}
            >
              <Card
                sx={{
                  padding: 1,
                  width: '100%',
                  display: 'flex',
                  height: '100px',
                }}
              >
                <CardContent
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <Grid>
                    <Grid position="relative">
                      <Typography>Usage Statuses</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default AdminCardView;
