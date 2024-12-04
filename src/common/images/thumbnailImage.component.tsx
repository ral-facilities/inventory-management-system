import { Box, Typography } from '@mui/material';
import React from 'react';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  open?: (e: React.MouseEvent) => void;
  image: APIImage;
}

const ThumbnailImage = React.forwardRef<HTMLElement, ThumbnailImageProps>(
  (props, ref) => {
    const { open, image } = props;
    const [hasError, setHasError] = React.useState<string | undefined>(
      undefined
    );

    return (
      <>
        {hasError === image.id ? (
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            onClick={open}
            ref={ref}
            sx={{ cursor: open ? 'pointer' : undefined }}
          >
            The image cannot be loaded
          </Typography>
        ) : (
          <Box
            ref={ref}
            component="img"
            src={`data:image/webp;base64,${image.thumbnail_base64}`}
            alt={image.description ?? 'No photo description available.'}
            style={{
              borderRadius: '4px',
              cursor: open ? 'pointer' : undefined,
            }}
            onClick={open}
            onError={() => setHasError(image.id)}
          />
        )}
      </>
    );
  }
);

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
