import { Box, Grid, SxProps, Theme, Typography } from '@mui/material';
import PrimaryOptionsMenu from './primaryOptionsButton.component';

export interface PlaceholderImageProps {
  sx?: SxProps<Theme>;
  setDialog: (arg: boolean) => void;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { sx, setDialog } = props;
  return (
    <Grid sx={{ height: '100%', width: '100%' }}>
      <Box
        sx={{
          height: '80%',
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
      <PrimaryOptionsMenu setDialog={setDialog} />
    </Grid>
  );
};

export default PlaceholderImage;
