import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Card,
  Collapse,
  Grid,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import {
  MRT_BottomToolbar,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_RowActionMenu,
  MRT_SelectCheckbox,
  MRT_ToggleRowActionMenuButton,
  useMaterialReactTable,
} from 'material-react-table';
import PhotoSwipe, { SlideData } from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Gallery, GalleryProps, Item } from 'react-photoswipe-gallery';
import { getImage, useGetImages } from '../../api/images';
import { displayTableRowCountText, OverflowTip } from '../../utils';
import { usePreservedTableState } from '../preservedTableState.component';
import ThumbnailImage from './thumbnailImage.component';

import { MoreHoriz } from '@mui/icons-material';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { APIImage } from '../../api/api.types';
import CardViewFilters from '../cardView/cardViewFilters.component';
import ImageInformationDialog from './imageInformationDialog.component';

const MAX_HEIGHT_THUMBNAIL = 300;

export interface ImageGalleryProps {
  entityId?: string;
}

const ImageGallery = (props: ImageGalleryProps) => {
  const { entityId } = props;
  const { data: images, isLoading: imageIsLoading } = useGetImages(entityId);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [currentLightBoxImage, setCurrentLightBoxImage] = React.useState<
    string | undefined
  >(undefined);

  const [selectedImage, setSelectedImage] = React.useState<
    APIImage | undefined
  >(undefined);

  const [openMenuDialog, setOpenMenuDialog] = React.useState<
    'download' | 'edit' | 'delete' | 'information' | false
  >(false);
  const queryClient = useQueryClient();
  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 16, pageIndex: 0 },
    },
    storeInUrl: true,
    paginationOnly: true,
    urlParamName: 'imageState',
  });

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
      name: 'action-menu-button',
      ariaLabel: 'Action menu button',
      order: 9,
      isButton: true,
      html: ReactDOMServer.renderToStaticMarkup(
        <MoreHoriz
          fontSize="inherit"
          style={{ width: '32px', height: '32px' }} // Set the size
          aria-hidden="true"
          className="pswp__icn"
        />
      ),
      appendTo: 'bar' as const,
      onClick: async (e, el, pswpInstance: PhotoSwipe) => {
        e.stopPropagation();
        e.preventDefault();

        setAnchorEl(el);
        const imageId = pswpInstance.getItemData(pswpInstance.currIndex).pid;
        setCurrentLightBoxImage(imageId);
        pswpInstance.on('close', () => {
          setAnchorEl(null);
          setCurrentLightBoxImage(undefined);
        });
      },
    },
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

  const CustomActionMenu = (props: { imageId: string }) => {
    const { imageId } = props;

    const cellWithImageId = data.find(
      (cell) => cell.row.original.id === imageId
    );
    if (!cellWithImageId) return null;

    return (
      <MRT_RowActionMenu
        anchorEl={anchorEl}
        handleEdit={() => {}}
        row={cellWithImageId.row as MRT_Row<APIImage>}
        setAnchorEl={setAnchorEl}
        table={table}
        sx={{
          zIndex: 100000 + 1,
          transform: 'translateX(-10px)',
        }}
        disableEnforceFocus
      />
    );
  };

  const titles = Array.from(
    new Set(
      images
        ?.map((image) => image.title)
        .filter((title): title is string => Boolean(title))
    )
  );

  const descriptions = Array.from(
    new Set(
      images
        ?.map((image) => image.description)
        .filter((description): description is string => Boolean(description))
    )
  );
  const columns = React.useMemo<MRT_ColumnDef<APIImage>[]>(() => {
    return [
      {
        header: 'File name',
        accessorFn: (row) => row.file_name,
        id: 'name',
        size: 300,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 500,
        enableGrouping: false,
      },

      {
        header: 'Created',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'created',
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 500,
        enableGrouping: false,
      },
      {
        header: 'Title',
        accessorFn: (row) => row.title,
        id: 'title',
        size: 350,
        filterVariant: 'autocomplete',
        filterSelectOptions: titles,
        enableGrouping: false,
      },
      {
        header: 'Description',
        accessorFn: (row) => row.description,
        id: 'description',
        size: 350,
        filterVariant: 'autocomplete',
        filterSelectOptions: descriptions,
        enableGrouping: false,
      },
    ];
  }, [descriptions, titles]);
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: images ?? [],
    // Features
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableTopToolbar: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableGlobalFilter: false,
    enableRowSelection: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableTableFooter: true,
    enableColumnFilters: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    // Other settings
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      rowsPerPage: 'Images per page',
      toggleSelectRow: 'Toggle select card',
      selectedCountOfRowCountRowsSelected:
        '{selectedCount} of {rowCount} card(s) selected',
      rowActions: 'Card Actions',
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [16, 24, 32],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Functions
    ...onPreservedStatesChange,
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, images, 'Images', {
        paddingLeft: '8px',
      }),

    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key="edit"
          aria-label={`Edit ${row.original.file_name} image`}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>,
        <MenuItem
          key="download"
          aria-label={`Download ${row.original.file_name} image`}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>,
        <MenuItem
          key="info"
          aria-label={`Show ${row.original.file_name} image information`}
          onClick={() => {
            setSelectedImage(row.original);
            setOpenMenuDialog('information');
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <InfoOutlinedIcon />
          </ListItemIcon>
          <ListItemText>Information</ListItemText>
        </MenuItem>,
        <MenuItem
          key="delete"
          aria-label={`Delete catalogue item ${row.original.file_name}`}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
  });

  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };
  const data = table
    .getSortedRowModel()
    .rows.map((row) => row.getVisibleCells().map((cell) => cell)[0]);
  const displayedImages = table
    .getPaginationRowModel()
    .rows.map(
      (row) => row.getVisibleCells().map((cell) => cell.row.original)[0]
    );

  return (
    <>
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

      {images && images.length !== 0 && (
        <Grid container>
          <Grid item container mt={2} direction="column" alignItems="center">
            <Collapse in={!isCollapsed} style={{ width: '100%' }}>
              <Grid marginTop={'auto'} direction="row" item container>
                <Button
                  startIcon={<ClearIcon />}
                  sx={{ mx: 0.5, ml: 2 }}
                  variant="outlined"
                  disabled={preservedState.columnFilters.length === 0}
                  onClick={() => {
                    table.resetColumnFilters();
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
              <CardViewFilters table={table} />
            </Collapse>

            <Typography
              onClick={handleToggle}
              variant="body2"
              color="primary"
              sx={{
                cursor: 'pointer',
                marginTop: 1,
                textAlign: 'center',
                textDecoration: 'underline',
              }}
            >
              {isCollapsed ? 'Show Filters' : 'Hide Filters'}
            </Typography>
          </Grid>
          <Grid container item>
            <Gallery
              onBeforeOpen={onBeforeOpen}
              uiElements={uiElements}
              options={options}
              withCaption
            >
              <Grid
                container
                item
                mt={2}
                gap={2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                }}
              >
                {data.map((card, index) => {
                  const isUndisplayed = !displayedImages?.some(
                    (img) => img.id === card.row.original.id
                  );

                  return isUndisplayed ? (
                    <Item
                      thumbnail={`data:image/webp;base64,${card.row.original.thumbnail_base64}`}
                      id={card.row.original.id}
                      caption={card.row.original.description ?? undefined}
                      alt={
                        card.row.original.description ??
                        'No photo description available.'
                      }
                      key={`thumbnail-not-displayed-${card.row.original.id}`}
                    >
                      {({ ref }) => {
                        return <Box ref={ref} style={{ display: 'none' }} />;
                      }}
                    </Item>
                  ) : (
                    <Card
                      component={Grid}
                      item
                      container
                      xs
                      key={`thumbnail-displayed-${index}`}
                      minWidth={'350px'}
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
                          <MRT_SelectCheckbox
                            row={card.row as MRT_Row<APIImage>}
                            table={table}
                            sx={{
                              ariaLabel: `${card.row.original.file_name} checkbox`,
                              margin: 0.5,
                            }}
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
                          thumbnail={`data:image/webp;base64,${card.row.original.thumbnail_base64}`}
                          id={card.row.original.id}
                          caption={card.row.original.description ?? undefined}
                          alt={`Image: ${card.row.original.title || card.row.original.file_name || index}`}
                        >
                          {({ ref, open }) => {
                            return (
                              <ThumbnailImage
                                ref={ref}
                                open={open}
                                image={card.row.original}
                              />
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
                          <MRT_ToggleRowActionMenuButton
                            cell={card as MRT_Cell<APIImage>}
                            row={card.row as MRT_Row<APIImage>}
                            table={table}
                            sx={{
                              ariaLabel: `actions ${card.row.original.file_name} photo button`,
                              margin: 0.5,
                            }}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <OverflowTip
                            sx={{
                              fontVariant: 'body2',
                              textAlign: 'center',
                            }}
                          >
                            {card.row.original.file_name}
                          </OverflowTip>
                        </Grid>
                        <Grid item xs={2}></Grid>
                      </Grid>
                    </Card>
                  );
                })}
              </Grid>
            </Gallery>
          </Grid>
          <Grid marginTop={2} direction="row" item container>
            <MRT_BottomToolbar table={table} sx={{ width: '100%' }} />
          </Grid>
          {currentLightBoxImage && (
            <CustomActionMenu imageId={currentLightBoxImage} />
          )}
          {selectedImage && (
            <ImageInformationDialog
              open={openMenuDialog === 'information'}
              onClose={() => setOpenMenuDialog(false)}
              image={selectedImage}
            />
          )}
        </Grid>
      )}
    </>
  );
};

export default ImageGallery;
