import { Box, Typography } from '@mui/material';

export type ErrorPageProps =
  | { boldErrorText: string; errorText?: string }
  | { boldErrorText?: string; errorText: string };

const ErrorPage = (props: ErrorPageProps) => {
  const { boldErrorText, errorText } = props;
  return (
    <Box
      sx={{
        width: '100%',
        justifyContent: 'center',
        marginTop: 1,
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
