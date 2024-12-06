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
    let timeout: NodeJS.Timeout | null = null;

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

  return <>{showLoader && <CircularProgress sx={sx} />}</>;
};

export default DelayedLoader;
