import { Box, SxProps, Theme, Typography } from '@mui/material';

export type ErrorPageProps =
  | { boldErrorText: string; errorText?: string }
  | { boldErrorText?: string; errorText: string };

const ErrorPage = (props: ErrorPageProps & { sx?: SxProps<Theme> }) => {
  const { boldErrorText, errorText, sx } = props;
  return (
    <Box
      sx={{
        width: '100%',
        justifyContent: 'center',
        marginTop: '8px',
        ...sx,
      }}
    >
      {boldErrorText && (
        <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {boldErrorText}
        </Typography>
      )}
      {errorText && (
        <Typography sx={{ textAlign: 'center' }}>{errorText}</Typography>
      )}
    </Box>
  );
};

export default ErrorPage;
