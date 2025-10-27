import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getUserRole } from '../parseTokens';

function AuthRoleStatus() {
  const role = getUserRole();

  return (
    role && (
      <Paper
        square={false}
        sx={{
          maxHeight: '40px',
          backgroundColor: '#FFA500',
          display: 'flex',
          paddingLeft: 0,
          paddingRight: 5,
          justifyContent: 'center',
          alignItems: 'center',
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
                'As a privileged user you can create/delete units and usage statuses, and bypass rules when creating, deleting, editing, or moving items.'
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
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  );
}

export default AuthRoleStatus;
