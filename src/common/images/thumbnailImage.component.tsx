import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  onClick?: () => void;
  image?: APIImage;
  dense: boolean;
  isPrimaryThumbnail?: boolean;
  imageLoading?: boolean;
}

const ThumbnailImage = (props: ThumbnailImageProps) => {
  const {
    onClick,
    image,
    dense,
    isPrimaryThumbnail = false,
    imageLoading = false,
  } = props;
  const [hasError, setHasError] = React.useState<string | undefined>(undefined);
  const imageError = !image || !!hasError;

  return (
    <Box
      sx={{
        height: isPrimaryThumbnail ? '300px' : undefined,
        width: isPrimaryThumbnail ? '300px' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border:
          isPrimaryThumbnail && imageError && !imageLoading
            ? '1px dashed'
            : undefined,
        borderRadius:
          isPrimaryThumbnail && imageError && !imageLoading ? '8px' : undefined,
      }}
    >
      {imageLoading && isPrimaryThumbnail ? (
        <CircularProgress />
      ) : (
        <Box
          component="img"
          key={image?.id} // Force remount when the image changes
          src={`data:image/webp;base64,${image?.thumbnail_base64 ?? ''}`}
          alt={
            !image
              ? 'No Image'
              : hasError
                ? 'The image cannot be loaded'
                : (image.description ?? 'No photo description available.')
          }
          style={{
            borderRadius: '4px',
            cursor: onClick ? 'pointer' : undefined,
            maxWidth: dense ? '200px' : undefined,
            maxHeight: dense ? '150px' : undefined,
          }}
          onClick={onClick}
          onError={() => setHasError(image?.id)}
        />
      )}
    </Box>
  );
};

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
