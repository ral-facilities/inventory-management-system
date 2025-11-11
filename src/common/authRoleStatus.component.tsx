import { IconButton, Paper, Theme, Tooltip, Typography } from '@mui/material';
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
          height: '100%',
          backgroundColor: (theme: Theme) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (theme as any).colours?.warning,

          display: 'flex',
          paddingRight: 5,
          justifyContent: 'center',
          alignItems: 'center',
          py: 0.5,
        }}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          aria-label="auth-role-status-info"
        >
          <Grid>
            <Tooltip
              sx={{ color: 'black' }}
              title={`The ${role} role enables extra functionality. You can create/delete units and usage statuses, and bypass rules when creating, deleting, editing, or moving items.`}
              disableHoverListener={false}
              aria-label={'auth-role-status-tooltip'}
            >
              <IconButton
                disableRipple
                sx={{ backgroundColor: 'transparent' }}
                size="large"
              >
                <InfoOutlinedIcon
                  sx={{
                    color: (theme: Theme) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (theme as any).colours?.information,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid>
            <Typography variant="h6" sx={{ fontSize: '16px' }}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  );
}

export default AuthRoleStatus;
