import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Box,
  Button,
  Card,
  Collapse,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  MRT_BottomToolbar,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_RowData,
  MRT_RowSelectionState,
  MRT_SelectCheckbox,
  MRT_ToggleRowActionMenuButton,
  MRT_TopToolbar,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { APIImage } from '../../api/api.types';
import { useGetImages, usePatchImage } from '../../api/images';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  displayTableRowCountText,
  FULL_SCREEN_STYLES,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
  OverflowTip,
} from '../../utils';
import CardViewFilters from '../cardView/cardViewFilters.component';
import DownloadFileDialog from '../downloadFileDialog.component';
import EditFileDialog from '../editFileDialog.component';
import ErrorPage from '../errorPage.component';
import { usePreservedTableState } from '../preservedTableState.component';
import { StyledUppyBox } from '../uppy.utils';
import DeleteImageDialog from './deleteImageDialog.component';
import GalleryLightBox from './galleryLightbox.component';
import ImageInformationDialog from './imageInformationDialog.component';
import ThumbnailImage from './thumbnailImage.component';
import UploadImagesDialog from './uploadImagesDialog.component';

export interface ImageGalleryProps {
  entityId: string;
  dense: boolean;
  setSelectedPrimaryID?: (selectedPrimaryId: string) => void;
}

const ImageGallery = (props: ImageGalleryProps) => {
  const { entityId, dense, setSelectedPrimaryID } = props;

  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );

  const handleRowSelection = React.useCallback(
    (row: MRT_RowData) => {
      if (setSelectedPrimaryID) {
        if (rowSelection[row.id]) {
          setSelectedPrimaryID('');
        } else {
          setSelectedPrimaryID(row.id);
        }
      }
      setRowSelection((prev) => ({
        [row.id]: !prev[row.id],
      }));
    },
    [setSelectedPrimaryID, setRowSelection, rowSelection]
  );

  const maxHeightThumbnail = dense ? 150 : 300;

  const { data: images, isLoading: imageIsLoading } = useGetImages(entityId);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentLightBoxImage = React.useMemo(
    () => searchParams.get('image'),
    [searchParams]
  );

  const onChangeCurrentLightBoxImage = React.useCallback(
    (imageId: string | null) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (imageId) {
          newParams.set('image', imageId);
        } else {
          newParams.delete('image');
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const [selectedImage, setSelectedImage] = React.useState<
    APIImage | undefined
  >(undefined);

  const [openMenuDialog, setOpenMenuDialog] = React.useState<
    'download' | 'edit' | 'delete' | 'information' | false
  >(false);

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
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 500,
        enableGrouping: false,
      },

      {
        header: 'Created',
        accessorFn: (row) => new Date(row.created_time),
        id: 'created',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 500,
        enableGrouping: false,
      },
      {
        header: 'Title',
        accessorFn: (row) => row.title,
        id: 'title',
        size: 350,
        filterVariant: 'autocomplete',
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        filterSelectOptions: titles,
        enableGrouping: false,
      },
      {
        header: 'Description',
        accessorFn: (row) => row.description,
        id: 'description',
        size: 350,
        filterVariant: 'autocomplete',
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        filterSelectOptions: descriptions,
        enableGrouping: false,
      },
    ];
  }, [descriptions, titles]);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: dense ? 18 : 16, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: !dense,
    urlParamName: 'imageState',
  });

  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: images ?? [],
    // Features
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableTopToolbar: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableRowActions: !dense,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableMultiRowSelection: !dense,
    enableTableFooter: true,
    enableColumnFilters: true,
    enableHiding: false,
    enableFullScreenToggle: !dense,
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
      showColumnFilters: false,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      rowSelection,
      showProgressBars: imageIsLoading,
    },
    //MRT
    mrtTheme,
    //MUI
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiSelectCheckboxProps: dense
      ? ({ row }) => {
          return {
            onClick: () => {
              handleRowSelection(row);
            },
          };
        }
      : undefined,
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: dense ? [18, 24, 30] : [16, 24, 32],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Functions
    ...onPreservedStatesChange,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<UploadIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            setOpenUploadDialog(true);
          }}
        >
          Upload Images
        </Button>

        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          disabled={preservedState.columnFilters.length === 0}
          onClick={() => {
            table.resetColumnFilters();
          }}
        >
          Clear Filters
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, images, 'Images', {
        paddingLeft: '8px',
      }),

    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key="edit"
          aria-label={`Edit ${row.original.file_name} image`}
          onClick={() => {
            setSelectedImage(row.original);
            setOpenMenuDialog('edit');
            closeMenu();
          }}
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
            setOpenMenuDialog('download');
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
          aria-label={`Delete image ${row.original.file_name}`}
          onClick={() => {
            setSelectedImage(row.original);
            setOpenMenuDialog('delete');
            closeMenu();
          }}
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

  const data = table
    .getSortedRowModel()
    .rows.map((row) => row.getVisibleCells().map((cell) => cell)[0]);
  const displayedImages = table
    .getRowModel()
    .rows.map((row) => row.getVisibleCells().map((cell) => cell)[0]);
  const selectedImages = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const {
    options: {
      mrtTheme: { baseBackgroundColor, selectedRowBackgroundColor },
    },
  } = table;

  const isCollapsed = table.getState().showColumnFilters;

  const [openUploadDialog, setOpenUploadDialog] =
    React.useState<boolean>(false);

  const cardViewHeight = getPageHeightCalc('150px');

  return (
    <Paper
      component={Grid}
      container
      flexDirection={'column'}
      height={dense ? '100%' : cardViewHeight}
      maxHeight={dense ? '100%' : cardViewHeight}
      sx={{
        backgroundColor: baseBackgroundColor,
        ...(table.getState().isFullScreen && FULL_SCREEN_STYLES),
      }}
    >
      <Grid item width="100%" sx={{ flexShrink: 0 }}>
        <MRT_TopToolbar table={table} />
      </Grid>
      <Grid item width="100%" sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container>
          <Grid
            item
            container
            display={!isCollapsed ? 'none' : undefined}
            direction="column"
            alignItems="center"
            sx={{
              justifyContent: 'left',
              paddingLeft: 0.5,
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.default',
              zIndex: 1000,
              width: '100%',
              paddingTop: 2.5,
              height: 'fit-content',
            }}
          >
            <Collapse
              in={isCollapsed}
              style={{ width: '100%', height: 'fit-content' }}
            >
              <CardViewFilters table={table} />
            </Collapse>
          </Grid>
          <Grid container item padding={1}>
            {images &&
              (images.length === 0 ? (
                <ErrorPage
                  sx={{ marginTop: 2 }}
                  boldErrorText="No images available"
                  errorText={`Please add an image by  clicking the Upload Images button.`}
                />
              ) : (
                <Grid
                  container
                  item
                  mt={2}
                  gap={2}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: dense
                      ? 'repeat(auto-fit, minmax(200px, 1fr))'
                      : 'repeat(auto-fit, minmax(350px, 1fr))',
                  }}
                >
                  {displayedImages.map((card, index) => {
                    const lastPageIndex = Math.floor(
                      displayedImages.length /
                        preservedState.pagination.pageSize
                    );
                    const isLastPage =
                      preservedState.pagination.pageIndex === lastPageIndex;
                    const isSelected = selectedImages.some(
                      (image) => image.id === card.row.original.id
                    );
                    return (
                      <Grid key={`thumbnail-displayed-${index}`} item>
                        <Card
                          component={Grid}
                          container
                          style={{
                            maxWidth:
                              data.length === 1 ||
                              (images.length %
                                preservedState.pagination.pageSize ===
                                1 &&
                                isLastPage)
                                ? '50%'
                                : undefined,
                            backgroundColor: isSelected
                              ? selectedRowBackgroundColor
                              : undefined,
                            cursor: dense ? 'pointer' : undefined,
                          }}
                          minWidth={dense ? '175px' : '350px'}
                          onClick={
                            dense
                              ? () => {
                                  handleRowSelection(card.row);
                                }
                              : undefined
                          }
                        >
                          <Grid
                            display="flex"
                            justifyContent="flex-start"
                            alignItems="center"
                            item
                            container
                            height="fit-content"
                            pt={!dense ? 5.25 : undefined}
                            xs={12}
                          >
                            <Grid item xs={2}>
                              {dense && (
                                <MRT_SelectCheckbox
                                  row={card.row as MRT_Row<APIImage>}
                                  table={table}
                                  sx={{
                                    margin: 0.5,
                                  }}
                                />
                              )}
                            </Grid>
                          </Grid>

                          <Grid
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            item
                            minHeight={`${maxHeightThumbnail}px`}
                            xs
                          >
                            <ThumbnailImage
                              onClick={
                                !dense
                                  ? () =>
                                      onChangeCurrentLightBoxImage(
                                        card.row.original.id
                                      )
                                  : undefined
                              }
                              image={card.row.original}
                              dense={dense}
                            />
                          </Grid>

                          <Grid
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            item
                            height="fit-content"
                            container
                            xs={12}
                          >
                            {!dense && (
                              <Grid xs={2} item>
                                <MRT_ToggleRowActionMenuButton
                                  cell={card as MRT_Cell<APIImage>}
                                  row={card.row as MRT_Row<APIImage>}
                                  table={table}
                                  sx={{
                                    margin: 0.5,
                                  }}
                                />
                              </Grid>
                            )}
                            <Grid item xs={dense ? 12 : 8}>
                              <OverflowTip
                                sx={{
                                  fontVariant: 'body2',
                                  textAlign: 'center',
                                  pb: dense ? 1 : undefined,
                                  px: dense ? 1 : undefined,
                                }}
                              >
                                {card.row.original.file_name}
                              </OverflowTip>
                            </Grid>
                            {/*Adds an item for spacing, to centre the file name in the card. */}
                            {!dense && <Grid item xs={2}></Grid>}
                          </Grid>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
      <Grid item width="100%" sx={{ flexShrink: 0 }}>
        <MRT_BottomToolbar
          table={table}
          sx={{ width: '100%', bottom: undefined, position: 'relative' }}
        />
      </Grid>
      <StyledUppyBox>
        <UploadImagesDialog
          open={openUploadDialog}
          onClose={() => setOpenUploadDialog(false)}
          entityId={entityId}
        />
      </StyledUppyBox>
      {selectedImage && !dense && (
        <>
          <ImageInformationDialog
            open={openMenuDialog === 'information'}
            onClose={() => setOpenMenuDialog(false)}
            image={selectedImage}
          />
          <EditFileDialog
            open={openMenuDialog === 'edit'}
            onClose={() => setOpenMenuDialog(false)}
            fileType="Image"
            usePatchFile={usePatchImage}
            selectedFile={selectedImage}
          />
          <DeleteImageDialog
            open={openMenuDialog === 'delete'}
            onClose={() => {
              setOpenMenuDialog(false);
              onChangeCurrentLightBoxImage(null);
            }}
            image={selectedImage}
          />
          <DownloadFileDialog
            open={openMenuDialog === 'download'}
            onClose={() => setOpenMenuDialog(false)}
            fileType="Image"
            file={selectedImage}
          />
        </>
      )}
      {currentLightBoxImage && !imageIsLoading && (
        <GalleryLightBox
          open={currentLightBoxImage !== undefined}
          onClose={() => onChangeCurrentLightBoxImage(null)}
          currentImageId={currentLightBoxImage}
          onChangeCurrentLightBoxImage={onChangeCurrentLightBoxImage}
          imageCardData={data as MRT_Cell<APIImage, unknown>[]}
          table={table}
        />
      )}
    </Paper>
  );
};

export default ImageGallery;
