import { Box, styled } from '@mui/material';

export const StyledUppyBox = styled(Box)(({ theme }) => ({
  '& .uppy-Dashboard-inner': {
    height: '800px',
    // Matches MUI Dialog styles
    maxWidth: theme.breakpoints.values.lg,
    maxHeight: 'calc(100% - 64px)',
    width: 'calc(100% - 64px)',
  },
  '& .uppy-Dashboard--modal .uppy-Dashboard-inner': { zIndex: 1300 + 1 },
}));
