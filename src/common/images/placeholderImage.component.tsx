import { Box, SxProps, Theme, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { APIImageWithURL } from '../../api/api.types';
import { getImageQuery, useGetImages } from '../../api/images';
import { queryClient } from '../../App';
import handleIMS_APIError from '../../handleIMS_APIError';
import { getPageHeightCalc } from '../../utils';

export interface PlaceholderImageProps {
  sx?: SxProps<Theme>;
  entityId?: string;
}

const PlaceholderImage = (props: PlaceholderImageProps) => {
  const { sx, entityId } = props;

  const { data: imagesData } = useGetImages(entityId, true);
  console.dir(imagesData, { depth: null });

  const [imageData, setImageData] = React.useState<APIImageWithURL>();

  const primaryImageExists = imagesData && imagesData.length > 0;

  React.useEffect(() => {
    if (primaryImageExists) {
      queryClient
        .fetchQuery(
          getImageQuery(
            primaryImageExists ? imagesData[0].id : '',
            false,
            primaryImageExists
          )
        )
        .then((data: APIImageWithURL) => {
          setImageData(data);
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setImageData(undefined);
    }
  }, [primaryImageExists, imagesData, setImageData]);

  const height = getPageHeightCalc('40vh');
  console.log(height);

  return !primaryImageExists ? (
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
  ) : (
    <Box
      component="img"
      src={imageData ? imageData.download_url : undefined}
      /* alt={
            hasError
              ? 'The image cannot be loaded'
              : (image.description ?? 'No photo description available.')
          } */
      sx={{
        maxHeight: height,
        maxWidth: '100%',
        objectFit: 'contain',
        border: '1px dashed',
        padding: '2px',
        borderColor: 'text.primary',

        /*  cursor: onClick ? 'pointer' : undefined, */
      }}
      /* onClick={onClick}
          onError={() => setHasError(image.id)} */
    />
  );
};

export default PlaceholderImage;
