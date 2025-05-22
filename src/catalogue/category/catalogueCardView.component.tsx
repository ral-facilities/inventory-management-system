import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  Collapse,
  LinearProgress,
  ListItemIcon,
  MenuItem,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  MRT_BottomToolbar,
  MRT_ColumnDef,
  MRT_TopToolbar,
  useMaterialReactTable,
  type MRT_Cell,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CatalogueCategory } from '../../api/api.types';
import {
  useGetCatalogueCategories,
  useGetCatalogueCategory,
} from '../../api/catalogueCategories';
import CardViewFilters from '../../common/cardView/cardViewFilters.component';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  customFilterFunctions,
  displayTableRowCountText,
  generateUniqueName,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  MRT_Functions_Localisation,
  mrtTheme,
} from '../../utils';
import CatalogueCard from './catalogueCard.component';
import CatalogueCategoryDialog from './catalogueCategoryDialog.component';

import ErrorPage from '../../common/errorPage.component';
import CatalogueCategoryDirectoryDialog from './catalogueCategoryDirectoryDialog.component';
import DeleteCatalogueCategoryDialog from './deleteCatalogueCategoryDialog.component';

export interface AddCatalogueButtonProps {
  parentId: string | null;
  disabled?: boolean;
  type: 'add' | 'edit';
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

const AddCategoryButton = (props: AddCatalogueButtonProps) => {
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        disabled={props.disabled}
        sx={{ mx: 0.5 }}
        variant="outlined"
        onClick={() => {
          setAddCategoryDialogOpen(true);
        }}
      >
        Add Catalogue Category
      </Button>

      <CatalogueCategoryDialog
        open={addCategoryDialogOpen}
        onClose={() => setAddCategoryDialogOpen(false)}
        parentId={props.parentId}
        requestType="post"
        resetSelectedCatalogueCategory={props.resetSelectedCatalogueCategory}
      />
    </>
  );
};

const MoveCategoriesButton = (props: {
  selectedCategories: CatalogueCategory[];
  resetSelectedCategories: () => void;
  parentCategoryId: string | null;
}) => {
  const [moveToCategoryDialogOpen, setMoveToCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 0.5 }}
        variant="outlined"
        startIcon={<DriveFileMoveOutlinedIcon />}
        onClick={() => setMoveToCategoryDialogOpen(true)}
      >
        Move to
      </Button>
      <CatalogueCategoryDirectoryDialog
        open={moveToCategoryDialogOpen}
        onClose={() => setMoveToCategoryDialogOpen(false)}
        selectedCategories={props.selectedCategories}
        resetSelectedCategories={props.resetSelectedCategories}
        parentCategoryId={props.parentCategoryId}
        requestType="moveTo"
      />
    </>
  );
};

const CopyCategoriesButton = (props: {
  selectedCategories: CatalogueCategory[];
  resetSelectedCategories: () => void;
  parentCategoryId: string | null;
}) => {
  const [copyToCategoryDialogOpen, setCopyToCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 0.5 }}
        variant="outlined"
        startIcon={<FolderCopyOutlinedIcon />}
        onClick={() => setCopyToCategoryDialogOpen(true)}
      >
        Copy to
      </Button>
      <CatalogueCategoryDirectoryDialog
        open={copyToCategoryDialogOpen}
        onClose={() => setCopyToCategoryDialogOpen(false)}
        selectedCategories={props.selectedCategories}
        resetSelectedCategories={props.resetSelectedCategories}
        parentCategoryId={props.parentCategoryId}
        requestType="copyTo"
      />
    </>
  );
};

function CatalogueCardView() {
  const { catalogue_category_id: catalogueCategoryId = null } = useParams();
  const {
    data: catalogueCategoryDetail,
    isLoading: catalogueCategoryDetailLoading,
  } = useGetCatalogueCategory(catalogueCategoryId);

  const parentInfo = React.useMemo(
    () => catalogueCategoryDetail,
    [catalogueCategoryDetail]
  );
  const parentId = (parentInfo && parentInfo.id) || null;

  const isLeafNode = parentInfo ? parentInfo.is_leaf : false;

  const navigate = useNavigate();
  React.useEffect(() => {
    // If it's a leaf node, redirect to catalogue items page
    if (isLeafNode) {
      navigate('items');
    }
  }, [isLeafNode, navigate]);

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useGetCatalogueCategories(
    catalogueCategoryDetailLoading ? true : !!parentInfo && parentInfo.is_leaf,
    // String value of null for filtering root catalogue category
    !catalogueCategoryId ? 'null' : catalogueCategoryId
  );

  const catalogueCategoryNames: string[] = catalogueCategoryData
    ? catalogueCategoryData.map((item) => item.name)
    : [];

  const [menuDialogOpen, setMenuDialogOpen] = React.useState<
    false | 'delete' | 'edit' | 'duplicate'
  >();
  const [selectedCatalogueCategory, setSelectedCatalogueCategory] =
    React.useState<CatalogueCategory | undefined>(undefined);

  // useEffect hook to update selectedCatalogueCategory when catalogueCategoryData changes
  // Ensures that the edit dialog has the latest property data after a migration (add or edit) is completed
  React.useEffect(() => {
    // Extract the IDs of all categories from the catalogueCategoryData array
    const catalogueCategoryIds = catalogueCategoryData?.map(
      (category) => category.id
    );

    // Check if the selectedCatalogueCategory's ID is part of the catalogueCategoryIds array
    // This ensures that the selected category is still valid after an "add" or "edit" migration
    if (catalogueCategoryIds?.includes(selectedCatalogueCategory?.id ?? '')) {
      // Find the updated category from the catalogueCategoryData array
      const updatedCategory = catalogueCategoryData?.find(
        (category) => category.id === selectedCatalogueCategory?.id
      );

      // Update the state with the updated category, triggering a re-render of the dialog
      setSelectedCatalogueCategory(updatedCategory);
    }
    // Dependencies for this effect: it will re-run when either catalogueCategoryData or selectedCatalogueCategory changes
  }, [catalogueCategoryData, selectedCatalogueCategory]);

  const propertyNames = Array.from(
    new Set(
      catalogueCategoryData?.flatMap((category) =>
        category.properties.map((prop) => prop.name)
      )
    )
  );
  const columns = React.useMemo<MRT_ColumnDef<CatalogueCategory>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        id: 'name',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 300,
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
        header: 'Property names',
        accessorFn: (row) =>
          row.properties.map((value) => value['name']).join(', '),
        id: 'properties',
        size: 350,
        filterVariant: 'multi-select',
        filterFn: 'arrIncludesSome',
        columnFilterModeOptions: [
          'arrIncludesSome',
          'arrIncludesAll',
          'arrExcludesSome',
          'arrExcludesAll',
        ],
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => [
          <MenuItem
            key="arrIncludesSome"
            onClick={() => onSelectFilterMode('arrIncludesSome')}
          >
            {MRT_Functions_Localisation.filterArrIncludesSome}
          </MenuItem>,
          <MenuItem
            key="arrIncludesAll"
            onClick={() => onSelectFilterMode('arrIncludesAll')}
          >
            {MRT_Functions_Localisation.filterArrIncludesAll}
          </MenuItem>,
          <MenuItem
            key="arrExcludesSome"
            onClick={() => onSelectFilterMode('arrExcludesSome')}
          >
            {MRT_Functions_Localisation.filterArrExcludesSome}
          </MenuItem>,

          <MenuItem
            key="arrExcludesAll"
            onClick={() => onSelectFilterMode('arrExcludesAll')}
          >
            {MRT_Functions_Localisation.filterArrExcludesAll}
          </MenuItem>,
        ],
        filterSelectOptions: propertyNames,
        enableGrouping: false,
      },
      {
        header: 'Is Leaf',
        accessorFn: (row) => (row.is_leaf === true ? 'Yes' : 'No'),
        id: 'is-leaf',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        enableColumnFilterModes: false,
        size: 200,
      },
    ];
  }, [propertyNames]);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 30, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
    paginationOnly: true,
  });

  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: catalogueCategoryData ?? [],
    // Features
    enableColumnOrdering: false,
    enableColumnFilterModes: true,
    enableColumnPinning: false,
    enableTopToolbar: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableGlobalFilter: true,
    enableStickyHeader: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableDensityToggle: false,
    enableTableFooter: true,
    enableColumnFilters: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    filterFns: customFilterFunctions,
    // Other settings
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      ...MRT_Functions_Localisation,
      rowsPerPage: 'Categories per page',
      toggleSelectRow: 'Toggle select card',
      selectedCountOfRowCountRowsSelected:
        '{selectedCount} of {rowCount} card(s) selected',
      rowActions: 'Card Actions',
    },

    // State
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars:
        catalogueCategoryDataLoading || catalogueCategoryDetailLoading,
    },
    //MRT
    mrtTheme,
    //MUI
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [30, 45, 60],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Functions
    ...onPreservedStatesChange,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <AddCategoryButton
          parentId={parentId}
          type="add"
          resetSelectedCatalogueCategory={() =>
            setSelectedCatalogueCategory(undefined)
          }
        />
        {selectedCategories.length >= 1 && (
          <>
            <MoveCategoriesButton
              selectedCategories={selectedCategories}
              resetSelectedCategories={table.resetRowSelection}
              parentCategoryId={catalogueCategoryId}
            />
            <CopyCategoriesButton
              selectedCategories={selectedCategories}
              resetSelectedCategories={table.resetRowSelection}
              parentCategoryId={catalogueCategoryId}
            />

            <Button
              sx={{ mx: '4px' }}
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={() => table.resetRowSelection()}
            >
              {selectedCategories.length} selected
            </Button>
          </>
        )}
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

    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key={0}
          onClick={() => {
            setMenuDialogOpen('edit');
            setSelectedCatalogueCategory(row.original);
            closeMenu();
          }}
          aria-label={`edit ${row.original.name} catalogue category button`}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>,
        <MenuItem
          key={2}
          aria-label={`duplicate ${row.original.name} catalogue category button`}
          onClick={() => {
            setMenuDialogOpen('duplicate');
            setSelectedCatalogueCategory(row.original);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          Duplicate
        </MenuItem>,
        <MenuItem
          key={3}
          onClick={() => {
            setMenuDialogOpen('delete');
            setSelectedCatalogueCategory(row.original);
            closeMenu();
          }}
          aria-label={`delete ${row.original.name} catalogue category button`}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>,
      ];
    },
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, catalogueCategoryData, 'Categories', {
        paddingLeft: '8px',
      }),
  });

  const data = table
    .getRowModel()
    .rows.map((row) => row.getVisibleCells().map((cell) => cell)[0]);
  const selectedCategories = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const isLoading = table.getState().showProgressBars;
  const {
    options: {
      mrtTheme: { baseBackgroundColor },
    },
  } = table;

  const isCollapsed = table.getState().showColumnFilters;

  const cardViewHeight = getPageHeightCalc('80px');

  return (
    <Paper
      component={Grid}
      sx={{ backgroundColor: baseBackgroundColor }}
      container
    >
      {!catalogueCategoryDetailLoading ? (
        <Grid
          container
          sx={{
            flexDirection: "column",
            height: cardViewHeight,
            maxHeight: cardViewHeight,
            width: "100%"
          }}>
          <Grid
            sx={{
              width: "100%",
              flexShrink: 0
            }}>
            <MRT_TopToolbar table={table} />
          </Grid>
          <Grid
            sx={{
              width: "100%",
              flex: 1,
              overflow: 'auto'
            }}>
            <Grid container>
              <Grid
                container
                sx={{
                  alignItems: "top",
                  display: !isCollapsed ? 'none' : undefined,
                  paddingLeft: 0.5,
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'background.default',
                  zIndex: 1000,
                  width: '100%',
                  paddingTop: 2.5,
                  paddingBottom: 2.5,
                  height: 'fit-content'
                }}>
                <Collapse
                  in={isCollapsed}
                  style={{ width: '100%', height: 'fit-content' }}
                >
                  <CardViewFilters table={table} />
                </Collapse>
              </Grid>
              <Grid sx={{
                width: "100%"
              }}>
                <Grid container columns={12} sx={{
                  width: "100%"
                }}>
                  {!isLoading &&
                    (data.length !== 0 ? (
                      data.map((card, index) => (
                        <Grid
                          key={index}
                          size={{
                            sm: 6,
                            md: 4
                          }}
                          sx={{
                            width: '100%'
                          }}>
                          <CatalogueCard
                            card={card as MRT_Cell<CatalogueCategory>}
                            table={table}
                          />
                        </Grid>
                      ))
                    ) : (
                      <ErrorPage
                        sx={{ marginTop: 2 }}
                        boldErrorText="No results found"
                        errorText={
                          'There are no catalogue categories. Please add a category using the button in the top left of your screen.'
                        }
                      />
                    ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{
              width: "100%",
              flexShrink: 0
            }}>
            <MRT_BottomToolbar table={table} />
          </Grid>
          <CatalogueCategoryDialog
            open={menuDialogOpen === 'edit' || menuDialogOpen === 'duplicate'}
            onClose={() => setMenuDialogOpen(false)}
            parentId={parentId}
            requestType={menuDialogOpen === 'duplicate' ? 'post' : 'patch'}
            selectedCatalogueCategory={
              menuDialogOpen === 'duplicate'
                ? ({
                    ...selectedCatalogueCategory,
                    name: generateUniqueName(
                      selectedCatalogueCategory?.name ?? '',
                      catalogueCategoryNames
                    ),
                  } as CatalogueCategory)
                : selectedCatalogueCategory
            }
            resetSelectedCatalogueCategory={() =>
              setSelectedCatalogueCategory(undefined)
            }
          />
          <DeleteCatalogueCategoryDialog
            open={menuDialogOpen === 'delete'}
            onClose={() => setMenuDialogOpen(false)}
            catalogueCategory={selectedCatalogueCategory}
            onChangeCatalogueCategory={setSelectedCatalogueCategory}
          />
        </Grid>
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Paper>
  );
}

export default CatalogueCardView;
