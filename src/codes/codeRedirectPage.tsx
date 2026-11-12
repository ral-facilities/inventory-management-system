import { useNavigate, useSearchParams } from 'react-router';
import { CodeContentSchema } from './codeContent.schema.tsx';
import React from 'react';
import { buildRedirectUrl } from '../utils.tsx';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Warning } from '@mui/icons-material';

const CodeRedirectPage = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isErrorState, setIsErrorState] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    const redirectData = CodeContentSchema.safeParse(
      Object.fromEntries(searchParams)
    );
    if (redirectData.success) {
      buildRedirectUrl(redirectData.data)
        .then((url) => navigate(url))
        .catch(() => {
          setErrorMessage(
            `Failed to retrieve ${redirectData.data.type} details`
          );
          setIsErrorState(true);
        });
    } else {
      setErrorMessage('Failed to parse redirect values')
      setIsErrorState(true)
    }
  }, [searchParams]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isErrorState ? (
        <>
          <Warning color="warning" sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h6">Redirect Failed</Typography>
          <Typography>{errorMessage}</Typography>
        </>
      ) : (
        <>
          <CircularProgress sx={{ mb: 4 }} />
          <Typography variant="h6">Redirecting</Typography>
        </>
      )}
    </Box>
  );
}

export default CodeRedirectPage;