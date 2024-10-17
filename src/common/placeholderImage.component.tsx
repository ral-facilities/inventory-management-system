import { Box, SxProps, Theme, Typography } from '@mui/material';

export interface PlaceholderImageProps {
  sx?: SxProps<Theme>;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { sx } = props;
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 2,
        backgroundColor: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'text.primary',
        border: '1px dashed',
        borderColor: 'text.primary',
        ...sx,
      }}
    >
      <Typography variant="h5">No Image</Typography>
    </Box>
  );
};

export default PlaceholderImage;
