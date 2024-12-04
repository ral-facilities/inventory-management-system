import { Box, Typography } from '@mui/material';
import React from 'react';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  onClick?: () => void;
  image: APIImage;
  index: number;
}

const ThumbnailImage = (props: ThumbnailImageProps) => {
  const { onClick, image, index } = props;
  const [hasError, setHasError] = React.useState<string | undefined>(undefined);

  return (
    <>
      {hasError === image.id ? (
        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          onClick={onClick}
          sx={{ cursor: onClick ? 'pointer' : undefined }}
        >
          The image cannot be loaded
        </Typography>
      ) : (
        <Box
          component="img"
          src={`data:image/webp;base64,${image.thumbnail_base64}`}
          alt={`Image: ${image.title || image.file_name || index}`}
          style={{
            borderRadius: '4px',
            cursor: onClick ? 'pointer' : undefined,
          }}
          onClick={onClick}
          onError={() => setHasError(image.id)}
        />
      )}
    </>
  );
};

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
