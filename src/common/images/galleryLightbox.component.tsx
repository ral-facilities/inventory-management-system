import { ArrowBack, ArrowForward, Close } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MRT_Cell,
  MRT_Row,
  MRT_TableInstance,
  MRT_ToggleRowActionMenuButton,
} from 'material-react-table';
import React from 'react';
import { APIImage } from '../../api/api.types';
import { useGetImage } from '../../api/images';
import { OverflowTip } from '../../utils';
import DelayedLoader from '../delayedLoader.component';

interface GalleryLightBoxProps {
  open: boolean;
  onClose: () => void;
  currentImageId: string;
  onChangeCurrentLightBoxImage: (imageId: string) => void;
  imageCardData: MRT_Cell<APIImage, unknown>[];
  table: MRT_TableInstance<APIImage>;
}

const GalleryLightBox = (props: GalleryLightBoxProps) => {
  const {
    open,
    onClose,
    imageCardData,
    table,
    currentImageId,
    onChangeCurrentLightBoxImage,
  } = props;

  const [hasError, setHasError] = React.useState<string | undefined>(undefined);

  const images = imageCardData.map((val) => val.row.original);

  const { data, isLoading } = useGetImage(currentImageId);

  const currentImageCardData = imageCardData.find(
    (cell) => cell.row.original.id === currentImageId
  );

  const currentIndex = images.findIndex((image) => image.id === currentImageId);

  const handleNext = React.useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    onChangeCurrentLightBoxImage(images[nextIndex].id);
    if (hasError) setHasError(undefined);
  }, [currentIndex, hasError, images, onChangeCurrentLightBoxImage]);

  const handlePrevious = React.useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    onChangeCurrentLightBoxImage(images[prevIndex].id);
    if (hasError) setHasError(undefined);
  }, [currentIndex, hasError, images, onChangeCurrentLightBoxImage]);

  return (
    <Backdrop
      sx={{
        color: 'white',
        // SciGateway navigation drawer is 1200, 1201 is the gallery lightbox
        zIndex: 1210 + 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      data-testid="galleryLightBox"
      open={open}
    >
      <Stack
        direction="column"
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxHeight: '5%',
            height: '5%',
          }}
        >
          <Typography variant="body1" color="inherit">
            {currentIndex + 1} / {images.length}
          </Typography>
          <Box>
            {currentImageCardData && (
              <MRT_ToggleRowActionMenuButton
                cell={currentImageCardData as MRT_Cell<APIImage>}
                row={currentImageCardData?.row as MRT_Row<APIImage>}
                table={table}
                sx={{
                  ariaLabel: `actions ${currentImageCardData?.row.original.file_name} photo button`,
                  margin: 0.5,
                  color: 'inherit',
                }}
              />
            )}
            <Tooltip title="Close">
              <span>
                <IconButton
                  onClick={onClose}
                  aria-label="Close"
                  sx={{
                    color: 'inherit',
                  }}
                >
                  <Close />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: '10%',
            height: '10%',
          }}
        >
          {!isLoading && (
            <Box
              sx={{
                textAlign: 'center',
                width: '100%',
              }}
            >
              {(data?.title || currentImageCardData?.row.original.title) && (
                <OverflowTip
                  sx={{ typography: 'h6', color: 'inherit' }}
                >{`Title: ${data?.title || currentImageCardData?.row.original.title}`}</OverflowTip>
              )}
              <OverflowTip
                sx={{ typography: 'h6', color: 'inherit' }}
              >{`File name: ${
                data?.file_name || currentImageCardData?.row.original.file_name
              }`}</OverflowTip>
            </Box>
          )}
        </Box>
        <Stack
          direction="row"
          sx={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            maxHeight: '70%',
          }}
        >
          <Tooltip title="Previous">
            <span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous"
                sx={{
                  color: 'inherit',
                }}
              >
                <ArrowBack />
              </IconButton>
            </span>
          </Tooltip>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <DelayedLoader
              isLoading={isLoading}
              timeMS={1000}
              sx={{ color: 'inherit', fontSize: 'large' }}
            />
            {(hasError === data?.id || !data) && !isLoading && (
              <Typography variant="h6" color="inherit">
                The image cannot be loaded
              </Typography>
            )}
            {!isLoading && data?.view_url && !(hasError === data?.id) && (
              <img
                // The key forces React to remount the <img> tag when hasError changes.
                // This is necessary because, without remounting, the <img> tag doesn't
                // refetch the image when navigating to the next image after an error.
                key={hasError}
                src={data.view_url}
                alt={data.description ?? 'No photo description available.'}
                style={{
                  objectFit: 'contain',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
                onError={() => setHasError(data.id)}
              />
            )}
          </Box>
          <Tooltip title="Next">
            <span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next"
                sx={{
                  color: 'inherit',
                }}
              >
                <ArrowForward />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: '15%',
            height: '15%',
            px: 2,
            extAlign: 'center',
            width: '100%',
          }}
        >
          <OverflowTip
            sx={{ mt: 2, typography: 'subtitle1', color: 'inherit' }}
          >
            {!isLoading &&
              (data?.description ||
                currentImageCardData?.row.original.description ||
                'No description available')}
          </OverflowTip>
        </Box>
      </Stack>
    </Backdrop>
  );
};

export default GalleryLightBox;
