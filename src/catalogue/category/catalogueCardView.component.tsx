import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import {
  Box,
  Button,
  Collapse,
  Grid,
  LinearProgress,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  MRT_BottomToolbar,
  MRT_ColumnDef,
  useMaterialReactTable,
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
} from '../../utils';
import CatalogueCard from './catalogueCard.component';
import CatalogueCategoryDialog from './catalogueCategoryDialog.component';

import ErrorPage from '../../common/errorPage.component';
import CatalogueCategoryDirectoryDialog from './catalogueCategoryDirectoryDialog.component';
import DeleteCatalogueCategoryDialog from './deleteCatalogueCategoryDialog.component';

export interface AddCatalogueButtonProps {
  parentId: string | null;
  disabled: boolean;
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
        sx={{ mx: 0.5, ml: 2 }}
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
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
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
        onChangeSelectedCategories={props.onChangeSelectedCategories}
        parentCategoryId={props.parentCategoryId}
        requestType="moveTo"
      />
    </>
  );
};

const CopyCategoriesButton = (props: {
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
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
        onChangeSelectedCategories={props.onChangeSelectedCategories}
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

  const onChangeOpenDeleteCategoryDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setMenuDialogOpen('delete');
    setSelectedCatalogueCategory(catalogueCategory);
  };

  const onChangeOpenEditCategoryDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setMenuDialogOpen('edit');
    setSelectedCatalogueCategory(catalogueCategory);
  };

  const onChangeOpenDuplicateDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setMenuDialogOpen('duplicate');
    setSelectedCatalogueCategory(catalogueCategory);
  };

  const [selectedCategories, setSelectedCategories] = React.useState<
    CatalogueCategory[]
  >([]);

  const handleToggleSelect = (catalogueCategory: CatalogueCategory) => {
    if (
      selectedCategories.some(
        (category: CatalogueCategory) => category.id === catalogueCategory.id
      )
    ) {
      // If the category is already selected, remove it
      setSelectedCategories(
        selectedCategories.filter(
          (category: CatalogueCategory) => category.id !== catalogueCategory.id
        )
      );
    } else {
      // If the category is not selected, add it
      setSelectedCategories([...selectedCategories, catalogueCategory]);
    }
  };

  // Clears the selected categories when the user navigates to a different page
  React.useEffect(() => {
    setSelectedCategories([]);
  }, [parentId]);

  // Display total and pagination on separate lines if on a small screen
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const cardViewHeight = getPageHeightCalc('80px');
  const cardViewCardsHeight = getPageHeightCalc(
    `100px + ${smallScreen ? '128px' : '72px'}`
  );

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
        accessorFn: (row) => new Date(row.modified_time),
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
    enableRowActions: false,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    enableRowSelection: false,
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
      rowsPerPageOptions: [30, 45, 60],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Functions
    ...onPreservedStatesChange,
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, catalogueCategoryData, 'Categories', {
        paddingLeft: '8px',
      }),
  });
  const data = table
    .getRowModel()
    .rows.map(
      (row) => row.getVisibleCells().map((cell) => cell.row.original)[0]
    );

  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {!catalogueCategoryDataLoading && catalogueCategoryData ? (
        <Grid
          container
          flexDirection={'column'}
          height={cardViewHeight}
          maxHeight={cardViewHeight}
        >
          <Grid
            container
            maxHeight={cardViewCardsHeight}
            item
            overflow={'auto'}
          >
            <Grid marginTop={'auto'} direction="row" item container>
              <AddCategoryButton
                parentId={parentId}
                type="add"
                disabled={catalogueCategoryDetailLoading}
                resetSelectedCatalogueCategory={() =>
                  setSelectedCatalogueCategory(undefined)
                }
              />
              {selectedCategories.length >= 1 && (
                <Box>
                  <MoveCategoriesButton
                    selectedCategories={selectedCategories}
                    onChangeSelectedCategories={setSelectedCategories}
                    parentCategoryId={catalogueCategoryId}
                  />
                  <CopyCategoriesButton
                    selectedCategories={selectedCategories}
                    onChangeSelectedCategories={setSelectedCategories}
                    parentCategoryId={catalogueCategoryId}
                  />

                  <Button
                    sx={{ mx: '4px' }}
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => setSelectedCategories([])}
                  >
                    {selectedCategories.length} selected
                  </Button>
                </Box>
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
            </Grid>
            <Grid item container direction="column" alignItems="center">
              <Collapse in={!isCollapsed} style={{ width: '100%' }}>
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
            <Grid item container>
              {data.length !== 0 ? (
                data.map((item, index) => (
                  <Grid item key={index} sm={6} md={4} width={'100%'}>
                    <CatalogueCard
                      {...item}
                      onChangeOpenDeleteDialog={
                        onChangeOpenDeleteCategoryDialog
                      }
                      onChangeOpenEditDialog={onChangeOpenEditCategoryDialog}
                      onChangeOpenDuplicateDialog={onChangeOpenDuplicateDialog}
                      onToggleSelect={handleToggleSelect}
                      isSelected={selectedCategories.some(
                        (selectedCategory: CatalogueCategory) =>
                          selectedCategory.id === item.id
                      )}
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
              )}
            </Grid>
          </Grid>
          <Grid marginTop={'auto'} direction="row" item container>
            <MRT_BottomToolbar
              table={table}
              sx={{ width: '100%', backgroundColor: 'background.default' }}
            />
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
    </>
  );
}

export default CatalogueCardView;
