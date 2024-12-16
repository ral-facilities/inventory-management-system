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
import {
  MRT_BottomToolbar,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_SelectCheckbox,
  MRT_ToggleRowActionMenuButton,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { APIImage } from '../../api/api.types';
import { useGetImage, useGetImages } from '../../api/images';
import { displayTableRowCountText, OverflowTip } from '../../utils';
import CardViewFilters from '../cardView/cardViewFilters.component';
import { usePreservedTableState } from '../preservedTableState.component';
import GalleryLightBox from './galleryLightbox.component';
import ImageInformationDialog from './imageInformationDialog.component';
import ThumbnailImage from './thumbnailImage.component';

const MAX_HEIGHT_THUMBNAIL = 300;

export interface ImageGalleryProps {
  entityId?: string;
}

const ImageGallery = (props: ImageGalleryProps) => {
  const { entityId } = props;
  const { data: images, isLoading: imageIsLoading } = useGetImages(entityId);

  const [currentLightBoxImage, setCurrentLightBoxImage] = React.useState<
    string | undefined
  >(undefined);

  const [selectedImage, setSelectedImage] = React.useState<
    APIImage | undefined
  >(undefined);

  // State to trigger image fetching for download
  const [imageIdToDownload, setImageIdToDownload] = React.useState<
    string | null
  >(null);

  // Use hook conditionally to fetch the image for download
  const { data: imageToDownload } = useGetImage(
    imageIdToDownload || '' // Provide a fallback empty string if no ID
  );

  // Trigger the download when image data becomes available
  React.useEffect(() => {
    if (imageToDownload) {
      const link = document.createElement('a'); // Create a temporary <a> element
      console.dir(imageToDownload, { depth: null });
      link.href = imageToDownload.url; // Set the download URL
      console.log(link.href);
      link.download = imageToDownload.file_name || 'download'; // Set the file name
      document.body.appendChild(link); // Append it to the DOM
      link.click(); // Programmatically trigger the click
      document.body.removeChild(link); // Clean up the DOM
      setImageIdToDownload(null); // Reset after handling download
    }
  }, [imageToDownload]);

  const handleDownload = (imageId: string) => {
    setImageIdToDownload(imageId);
  };

  const [openMenuDialog, setOpenMenuDialog] = React.useState<
    'download' | 'edit' | 'delete' | 'information' | false
  >(false);
  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 16, pageIndex: 0 },
    },
    storeInUrl: true,
    urlParamName: 'imageState',
  });

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
      rowActions: currentLightBoxImage ? 'Image Actions' : 'Card Actions',
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
          onClick={() => {
            setSelectedImage(row.original);
            handleDownload(row.original.id);
            closeMenu();
          }}
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

                const lastPageIndex = Math.floor(
                  data.length / preservedState.pagination.pageSize
                );
                const isLastPage =
                  preservedState.pagination.pageIndex === lastPageIndex;

                return isUndisplayed ? null : (
                  <Card
                    component={Grid}
                    item
                    container
                    xs
                    key={`thumbnail-displayed-${index}`}
                    style={{
                      maxWidth:
                        data.length === 1 ||
                        (images.length % preservedState.pagination.pageSize ===
                          1 &&
                          isLastPage)
                          ? '50%'
                          : undefined,
                    }}
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
                      <ThumbnailImage
                        onClick={() =>
                          setCurrentLightBoxImage(card.row.original.id)
                        }
                        image={card.row.original}
                      />
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
          </Grid>
          <Grid marginTop={2} direction="row" item container>
            <MRT_BottomToolbar table={table} sx={{ width: '100%' }} />
          </Grid>
          {selectedImage && (
            <ImageInformationDialog
              open={openMenuDialog === 'information'}
              onClose={() => setOpenMenuDialog(false)}
              image={selectedImage}
            />
          )}
          {currentLightBoxImage && (
            <GalleryLightBox
              open={currentLightBoxImage !== undefined}
              onClose={() => setCurrentLightBoxImage(undefined)}
              currentImageId={currentLightBoxImage}
              imageCardData={data as MRT_Cell<APIImage, unknown>[]}
              table={table}
            />
          )}
        </Grid>
      )}
    </>
  );
};

export default ImageGallery;
