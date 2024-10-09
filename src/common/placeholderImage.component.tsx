import { Box, Typography } from '@mui/material';

export interface PlaceholderImageProps {
  maxWidth: string;
  maxHeight: string;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { maxHeight, maxWidth } = props;
  return (
    <Box
      sx={(theme) => ({
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        width: '100%',
        height: '100%',
        borderRadius: 2,
        backgroundColor: 'inherit', // Light gray background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center', // Center the text
        color: theme.palette.text.primary, // Text color
        border: '1px dashed',
        borderColor: theme.palette.text.primary,
      })}
    >
      <Typography variant="h5">No Image</Typography>
    </Box>
  );
};

export default PlaceholderImage;
