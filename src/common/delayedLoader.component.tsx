import { SxProps, Theme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

interface DelayedLoaderProps {
  timeMS: number;
  isLoading: boolean;
  sx: SxProps<Theme>;
}

const DelayedLoader = (props: DelayedLoaderProps) => {
  const { timeMS, isLoading, sx } = props;
  const [showLoader, setShowLoader] = React.useState(false);

  React.useEffect(() => {
    // Return type reported as number by vscode, but when built seems to use NextJS.Timeout
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoader(true);
      }, timeMS);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, timeMS]);

  if (showLoader) {
    return <CircularProgress sx={sx} />;
  } else {
    return null;
  }
};

export default DelayedLoader;
