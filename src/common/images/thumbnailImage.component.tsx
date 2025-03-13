import { Box } from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { APIImage } from '../../api/api.types';

export interface ThumbnailImageProps {
  onClick?: () => void;
  image?: APIImage;
  dense: boolean;
  isPrimaryThumbnail?: boolean;
}

const ThumbnailImage = (props: ThumbnailImageProps) => {
  const { onClick, image, dense, isPrimaryThumbnail = false } = props;
  const [hasError, setHasError] = React.useState<string | undefined>(undefined);
  const imageError = !image || !!hasError;

  const [searchParams, setSearchParams] = useSearchParams();

  const handleViewPrimary = React.useCallback(() => {
    if (isPrimaryThumbnail && !imageError) {
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set('tab', 'Gallery');
      updatedParams.set('image', image.id);
      setSearchParams(updatedParams);
    }
  }, [isPrimaryThumbnail, imageError, searchParams, setSearchParams]);

  return (
    <Box
      height={!image || hasError ? '300px' : undefined}
      width={!image || hasError ? '300px' : undefined}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border={isPrimaryThumbnail && imageError ? '1px dashed' : undefined}
      borderRadius={isPrimaryThumbnail && imageError ? '8px' : undefined}
      sx={{ cursor: isPrimaryThumbnail && !imageError ? 'pointer' : undefined }}
      onClick={handleViewPrimary}
    >
      <Box
        component="img"
        src={`data:image/webp;base64,${image?.thumbnail_base64}`}
        alt={
          !image
            ? 'No Image'
            : hasError
              ? 'The image cannot be loaded'
              : (image?.description ?? 'No photo description available.')
        }
        style={{
          borderRadius: '4px',
          cursor: onClick ? 'pointer' : undefined,
          maxWidth: dense ? '200px' : undefined,
          maxHeight: dense ? '150px' : undefined,
        }}
        onClick={onClick}
        onError={() => setHasError(image?.id)}
        /*   minHeight={!image || hasError ? '300px' : undefined}
      minWidth={!image || hasError ? '300px' : undefined} */
      />
    </Box>
  );
};

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;
