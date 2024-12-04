import { MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Card,
  Checkbox,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import PhotoSwipe, { SlideData } from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import React from 'react';
import { Gallery, GalleryProps, Item } from 'react-photoswipe-gallery';
import { getImage, useGetImages } from '../../api/images';
import { OverflowTip } from '../../utils';
import ThumbnailImage from './thumbnailImage.component';

const MAX_HEIGHT_THUMBNAIL = 300;

export interface ImageGalleryProps {
  entityId?: string;
}

const ImageGallery = (props: ImageGalleryProps) => {
  const { entityId } = props;
  const { data: images, isLoading: imageIsLoading } = useGetImages(entityId);
  const queryClient = useQueryClient();

  const onBeforeOpen = React.useCallback(
    (pswpInstance: PhotoSwipe) => {
      let isFetching = false;
      const slideInitHandler = async () => {
        pswpInstance.addFilter('isContentLoading', () => {
          return true;
        });
        if (isFetching) return;
        isFetching = true;

        const imageId = pswpInstance.getItemData(pswpInstance.currIndex).pid;
        const slide = (pswpInstance.options.dataSource as SlideData[])[
          pswpInstance.currIndex
        ];

        try {
          const imageData = await queryClient.fetchQuery({
            queryKey: ['Image', imageId],
            queryFn: async () => {
              const image = await getImage(imageId);
              const img = new Image();
              img.src = image.url;

              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });

              return {
                ...image,
                src: img.src,
                width: img.naturalWidth,
                height: img.naturalHeight,
              };
            },
            staleTime: 300000, // Cache for 5 minutes
          });

          Object.assign(slide, {
            src: imageData.src,
            width: imageData.width,
            height: imageData.height,
          });
          pswpInstance.refreshSlideContent(pswpInstance.currIndex);
        } catch {
          Object.assign(slide, {
            src: 'data:image/jpeg;base64,invalidBase64data',
          });
          pswpInstance.refreshSlideContent(pswpInstance.currIndex);
        } finally {
          isFetching = false;
          pswpInstance.addFilter('isContentLoading', () => false);
        }
      };
      pswpInstance.on('slideInit', slideInitHandler);

      return () => {
        pswpInstance.off('slideInit', slideInitHandler);
      };
    },
    [queryClient]
  );

  const options: GalleryProps['options'] = {
    showHideAnimationType: 'zoom',
  };
  const uiElements: GalleryProps['uiElements'] = [
    {
      name: 'info-title',
      ariaLabel: 'Image Title and File Name',
      order: 9,
      html: '<div class="image-title"></div>',
      appendTo: 'wrapper' as const,
      onInit: (el, pswpInstance) => {
        const updateTitle = () => {
          const currentIndex = pswpInstance.currIndex;

          const slideData = (pswpInstance.options.dataSource as SlideData[])[
            currentIndex
          ];

          const imageData = images?.find((image) => image.id === slideData.pid);
          if (slideData) {
            const titleElement = el.querySelector('.image-title');
            if (titleElement) {
              titleElement.innerHTML = `
              <div style="text-align: center; align-items: center;">
                ${imageData?.title ? `<h4 style="color: var(--pswp-icon-color);margin: 8px;">Title: ${imageData.title}</h4>` : ''}
                <span style="color: var(--pswp-icon-color);">File Name: ${imageData?.file_name}</span>
              </div>
            `;
            }
          }
        };

        pswpInstance.on('slideInit', updateTitle);
      },
    },
  ];

  return (
    <>
      {images && (
        <Gallery
          onBeforeOpen={onBeforeOpen}
          uiElements={uiElements}
          options={options}
          withCaption
        >
          <Grid
            container
            mt={2}
            gap={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            }}
          >
            {images.map((image) => {
              return (
                <Card
                  component={Grid}
                  item
                  container
                  xs
                  key={`thumbnail-displayed-${image.id}`}
                  style={{
                    maxWidth: images.length === 1 ? '50%' : undefined,
                  }}
                >
                  <Grid
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    item
                    container
                    xs={12}
                  >
                    <Grid item xs={2}>
                      <Checkbox
                        checked={false}
                        inputProps={{
                          'aria-label': 'controlled',
                        }}
                        aria-label={`${image.file_name} checkbox`}
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    item
                    minHeight={`${MAX_HEIGHT_THUMBNAIL}px`}
                    xs
                  >
                    <Item
                      thumbnail={`data:image/webp;base64,${image.thumbnail_base64}`}
                      id={image.id}
                      caption={image.description ?? undefined}
                      alt={
                        image.description ?? 'No photo description available.'
                      }
                    >
                      {({ ref, open }) => {
                        return (
                          <ThumbnailImage ref={ref} open={open} image={image} />
                        );
                      }}
                    </Item>
                  </Grid>

                  <Grid
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    item
                    container
                    xs={12}
                  >
                    <Grid xs={2} item>
                      <IconButton
                        aria-label={`actions ${image.file_name} photo button`}
                      >
                        <MoreHoriz />
                      </IconButton>
                    </Grid>
                    <Grid item xs={8}>
                      <OverflowTip
                        sx={{
                          fontVariant: 'body2',
                          textAlign: 'center',
                        }}
                      >
                        {image.file_name}
                      </OverflowTip>
                    </Grid>
                    <Grid item xs={2}></Grid>
                  </Grid>
                </Card>
              );
            })}
          </Grid>
        </Gallery>
      )}
      {!imageIsLoading ? (
        (!images || images.length === 0) && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="300px"
            flexDirection="column"
            textAlign="center"
          >
            <Typography variant="h6" fontWeight="bold">
              No images available
            </Typography>
            <Typography variant="body1">
              Please add an image by opening the Action Menu and clicking the
              Upload Images menu item.
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </>
  );
};

export default ImageGallery;
