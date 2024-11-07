import { Box, Typography } from '@mui/material';
import React from 'react';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  open: (e: React.MouseEvent) => void;
  image: APIImage;
  index: number;
  maxHeightThumbnail: number;
}

const ThumbnailImage = React.forwardRef<HTMLElement, ThumbnailImageProps>(
  (props, ref) => {
    const { open, image, index, maxHeightThumbnail } = props;
    const [hasError, setHasError] = React.useState(false);

    return (
      <>
        {hasError ? (
          <Typography
            maxWidth={`${maxHeightThumbnail}px`}
            maxHeight={`${maxHeightThumbnail}px`}
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
              maxWidth: `${maxHeightThumbnail}px`,
              maxHeight: `${maxHeightThumbnail}px`,
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
