import { InfoOutlined } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Alert,
  AlertProps,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

export interface MRTTopTableAlertProps {
  title: string;
  clearFilters?: () => void;
  clearFiltersAriaLabel?: string;
  alertProps?: AlertProps;
  showInfoTooltip?: boolean;
  infoTooltipTitle?: React.ReactNode;
}

const MRTTopTableAlert = (props: MRTTopTableAlertProps) => {
  const {
    title,
    clearFilters,
    clearFiltersAriaLabel,
    alertProps,
    showInfoTooltip,
    infoTooltipTitle,
  } = props;
  return (
    <Alert
      color="info"
      icon={false}
      sx={() => ({
        '& .MuiAlert-message': {
          width: '100%',
        },
        borderRadius: 0,
        fontSize: '1rem',
        left: 0,
        p: 0,
        position: 'relative',
        right: 0,
        top: 0,
        width: '100%',
        zIndex: 2,
      })}
      {...alertProps}
    >
      <Grid container alignItems="center" sx={{ px: 1, py: 0.5 }}>
        <Grid size={2} />
        <Grid size={8}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="inherit" sx={{ pr: 1 }}>
              {title}
            </Typography>
            {showInfoTooltip && (
              <Tooltip title={infoTooltipTitle}>
                <InfoOutlined fontSize="small" />
              </Tooltip>
            )}
          </Box>
        </Grid>
        <Grid size={2} display="flex" justifyContent="flex-end">
          {clearFilters && (
            <Tooltip title={clearFiltersAriaLabel}>
              <span>
                <IconButton
                  size="small"
                  aria-label={clearFiltersAriaLabel}
                  onClick={() => clearFilters()}
                  sx={{ color: 'inherit' }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </Alert>
  );
};

export default MRTTopTableAlert;
