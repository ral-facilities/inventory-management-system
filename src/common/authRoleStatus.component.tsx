import {
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getUserRole } from '../parseTokens';

function AuthRoleStatus() {
  const role = getUserRole();
  const theme = useTheme();

  return (
    role && (
      <Paper
        square
        sx={{
          height: '100%',
          backgroundColor: theme.palette?.warning.light,
          display: 'flex',
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
          aria-label="auth-role-status-info"
        >
          <Grid>
            <Tooltip
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
                    color: theme.palette?.info.dark,
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
