import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
function adminPage() {
  return (
    <Grid container>
      <Grid container>
        <Grid
          item
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{
            display: 'flex',
            height: '100%',
            width: '100%',
            padding: '8px', // Add some padding for spacing
          }}
        >
          <Grid item key={0} xs={12} sm={6}>
            <Button
              component={Link}
              to={'units'}
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
                  padding: '8px',
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
                    <Grid position={'relative'}>
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
              to={'usage-status'}
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
                  padding: '8px',
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
                    <Grid position={'relative'}>
                      <Typography>Usage Status</Typography>
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

export default adminPage;
