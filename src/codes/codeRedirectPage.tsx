import { Link, useNavigate, useSearchParams } from 'react-router';
import { CodeContentSchema } from './codeContent.schema.tsx';
import React from 'react';
import { buildRedirectUrl } from '../utils.tsx';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { House, Warning } from '@mui/icons-material';
import paths from '../paths';

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
      setErrorMessage('Failed to parse redirect values');
      setIsErrorState(true);
    }
  }, [searchParams, navigate]);

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
          <Button
            component={Link}
            to={paths.root}
            variant="contained"
            startIcon={<House />}
            sx={{ mt: 3 }}
          >
            Go Home
          </Button>
        </>
      ) : (
        <>
          <CircularProgress sx={{ mb: 4 }} />
          <Typography variant="h6">Redirecting</Typography>
        </>
      )}
    </Box>
  );
};

export default CodeRedirectPage;
