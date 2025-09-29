import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getUserRole } from '../parseTokens';

function AuthRoleStatus() {
  const role = getUserRole();

  return (
    role && (
      <Paper
        square
        sx={{
          backgroundColor: '#FFA500',
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 0,
          paddingRight: 5,
          justifyContent: 'center',
        }}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          aria-label="admin-status-info"
        >
          <Grid>
            <Tooltip
              title={
                <h4>
                  As a privileged user, you can create/edit settings, and bypass
                  moving rules for items.
                </h4>
              }
              disableHoverListener={false}
              aria-label={'admin-status-tooltip'}
            >
              <IconButton
                disableRipple
                sx={{ backgroundColor: 'transparent' }}
                size="large"
              >
                <InfoOutlinedIcon
                  sx={{
                    color: '#003088',
                  }}
                />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid>
            <Typography
              variant="h6"
              sx={{ color: '#000000', fontSize: '16px' }}
            >
              {role}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  );
}

export default AuthRoleStatus;
