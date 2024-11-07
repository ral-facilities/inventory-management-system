import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  Collapse,
  Grid,
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
import { CatalogueCategory } from '../../api/api.types';
import CardViewFilters from '../../common/cardView/cardViewFilters.component';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import { displayTableRowCountText, getPageHeightCalc } from '../../utils';
import CatalogueCard from './catalogueCard.component';
export interface CatalogueCardViewProps {
  catalogueCategoryData: CatalogueCategory[];
  onChangeOpenDeleteCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenEditCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenDuplicateDialog: (catalogueCategory: CatalogueCategory) => void;
  handleToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  selectedCategories: CatalogueCategory[];
}

function CatalogueCardView(props: CatalogueCardViewProps) {
  const {
    catalogueCategoryData,
    onChangeOpenDeleteCategoryDialog,
    onChangeOpenEditCategoryDialog,
    onChangeOpenDuplicateDialog,
    handleToggleSelect,
    selectedCategories,
  } = props;

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 30, pageIndex: 0 },
    },
    storeInUrl: true,
    paginationOnly: true,
  });

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
        header: 'Property names',
        accessorFn: (row) =>
          row.properties.map((value) => value['name']).join(', '),
        id: 'property-names',
        size: 350,
        filterVariant: 'autocomplete',
        filterSelectOptions: propertyNames,
        enableGrouping: false,
      },
      {
        header: 'Is Leaf',
        accessorFn: (row) => (row.is_leaf === true ? 'Yes' : 'No'),
        id: 'is-leaf',
        size: 200,
        filterVariant: 'autocomplete',
      },
    ];
  }, [propertyNames]);
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: catalogueCategoryData ?? [],
    // Features
    enableColumnOrdering: false,
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
    // Other settings
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
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
    <Grid
      container
      flexDirection={'column'}
      height={cardViewHeight}
      maxHeight={cardViewHeight}
    >
      <Grid container maxHeight={cardViewCardsHeight} item overflow={'auto'}>
        <Grid item container direction="column" alignItems="center">
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
        <Grid item container>
          {data?.map((item, index) => (
            <Grid item key={index} sm={6} md={4} width={'100%'}>
              <CatalogueCard
                {...item}
                onChangeOpenDeleteDialog={onChangeOpenDeleteCategoryDialog}
                onChangeOpenEditDialog={onChangeOpenEditCategoryDialog}
                onChangeOpenDuplicateDialog={onChangeOpenDuplicateDialog}
                onToggleSelect={handleToggleSelect}
                isSelected={selectedCategories.some(
                  (selectedCategory: CatalogueCategory) =>
                    selectedCategory.id === item.id
                )}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid marginTop={'auto'} direction="row" item container>
        <MRT_BottomToolbar table={table} sx={{ width: '100%' }} />
      </Grid>
    </Grid>
  );
}

export default CatalogueCardView;
