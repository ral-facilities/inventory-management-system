import { Box } from '@mui/material';
import React from 'react';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  onClick?: () => void;
  image: APIImage;
}

const ThumbnailImage = (props: ThumbnailImageProps) => {
  const { onClick, image } = props;
  const [hasError, setHasError] = React.useState<string | undefined>(undefined);
  return (
    <Box
      component="img"
      src={`data:image/webp;base64,${image.thumbnail_base64}`}
      alt={
        hasError
          ? 'The image cannot be loaded'
          : (image.description ?? 'No photo description available.')
      }
      style={{
        borderRadius: '4px',
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      onError={() => setHasError(image.id)}
    />
  );
};

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
