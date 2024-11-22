import { Box, Typography } from '@mui/material';
import React from 'react';
import { Image } from '../../api/api.types';

export interface ThumbnailImageProps {
  open: (e: React.MouseEvent) => void;
  image: Image;
  index: number;
}

const ThumbnailImage = React.forwardRef<HTMLElement, ThumbnailImageProps>(
  (props, ref) => {
    const { open, image, index } = props;
    const [hasError, setHasError] = React.useState(false);

    return (
      <>
        {hasError ? (
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            onClick={open}
            ref={ref}
            sx={{ cursor: 'pointer' }}
          >
            The image cannot be loaded
          </Typography>
        ) : (
          <Box
            ref={ref}
            component="img"
            src={`data:image/webp;base64,${image.thumbnail_base64}`}
            alt={`Image: ${image.title || image.file_name || index}`}
            style={{
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={open}
            onError={() => setHasError(true)}
          />
        )}
      </>
    );
  }
);

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
