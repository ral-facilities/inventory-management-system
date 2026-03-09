import AddIcon from '@mui/icons-material/Add';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  TableCellBaseProps,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { CatalogueCategory } from '../../api/api.types';
import CriticalityTooltipIcon from '../../common/criticalityTooltipIcon.component';
import { useAppSelector } from '../../state/hook';
import { selectCriticality } from '../../state/slices/criticalitySlice';
import {
  COLUMN_FILTER_BOOLEAN_OPTIONS,
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  criticalityRowStyle,
  formatDateTimeStrings,
  generateUniqueName,
  mrtTheme,
} from '../../utils';
import { getCriticalityLabel } from './catalogueCard.component';
import { CriticalTooltipText } from './catalogueCardView.component';
import CatalogueCategoryDialog from './catalogueCategoryDialog.component';

export interface CatalogueCategoryTableViewProps {
  selectedCategories: CatalogueCategory[];
  catalogueCategoryParentId?: string;
  onChangeParentCategoryId: (catalogueCurrDirId: string | null) => void;
  requestType: 'moveTo' | 'copyTo' | 'standard';
  catalogueCategoryData: CatalogueCategory[] | undefined;
  catalogueCategoryDataLoading: boolean;
  requestOrigin: 'category' | 'item';
  catalogueItemParentCategory?: CatalogueCategory;
}

const CatalogueCategoryTableView = (props: CatalogueCategoryTableViewProps) => {
  const {
    selectedCategories,
    requestType,
    catalogueCategoryParentId,
    onChangeParentCategoryId,
    catalogueCategoryDataLoading,
    catalogueCategoryData,
    requestOrigin,
    catalogueItemParentCategory,
  } = props;
  const selectedCatalogueCategoryIds: (string | null)[] =
    selectedCategories.map((category) => {
      return category.id;
    });
  const { isCriticalMode } = useAppSelector(selectCriticality);

  const catalogueCategoryNames: string[] =
    catalogueCategoryData?.map((item) => item.name) || [];

  const noResultsTxt = 'No catalogue categories found';
  const columns = React.useMemo<MRT_ColumnDef<CatalogueCategory>[]>(() => {
    return [
      {
        header: 'Is Critical',
        Header: ({ column }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={CriticalTooltipText}>
              <InfoOutlined sx={{ mr: 1 }} fontSize="small" />
            </Tooltip>
            {column.columnDef.header}
          </Box>
        ),
        accessorFn: (row: CatalogueCategory) => (row.is_flagged ? 'Yes' : 'No'),
        id: 'is_flagged',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        enableColumnFilterModes: false,
        size: 180,
        filterSelectOptions: COLUMN_FILTER_BOOLEAN_OPTIONS,
        Cell: ({ row }) => {
          const showFlagged = row.original.is_flagged;
          return (
            <CriticalityTooltipIcon
              showFlagged={showFlagged}
              label={getCriticalityLabel(showFlagged)}
            />
          );
        },
      },
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        id: 'name',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 567.5,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 400,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.modified_time, true),
      },
    ];
  }, []);

  const table = useMaterialReactTable({
    // Data
    columns: columns, // If dense only show the name column
    data: catalogueCategoryData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
    enableColumnResizing: true,
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
      noRecordsToDisplay: noResultsTxt,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 5, pageIndex: 0 },
      columnVisibility: {
        is_flagged: isCriticalMode,
      },
    },
    state: {
      showProgressBars: catalogueCategoryDataLoading, //or showSkeletons
    },
    //MRT
    mrtTheme,
    // MUI
    muiTableBodyRowProps: ({ row }) => {
      const canPlaceHere =
        (!row.original.is_leaf &&
          (requestType !== 'moveTo' ||
            !selectedCatalogueCategoryIds.includes(row.original.id))) ||
        requestType === 'standard';
      const showFlagged = row.original.is_flagged;
      return {
        component: TableRow,
        onClick: () => {
          if (canPlaceHere) onChangeParentCategoryId(row.original.id);
        },
        'aria-label': `${row.original.name} row`,
        sx: (theme) => ({
          cursor: canPlaceHere ? 'pointer' : 'not-allowed',
          ...(isCriticalMode &&
            criticalityRowStyle({ theme, showFlagged: showFlagged })),
        }),
      };
    },
    muiTableBodyCellProps: ({ column, row }) =>
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              const canPlaceHere =
                (!row.original.is_leaf &&
                  (requestType !== 'moveTo' ||
                    !selectedCatalogueCategoryIds.includes(row.original.id))) ||
                requestType === 'standard';
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                    overFlowTipSx: {
                      width: '25vw',
                      color: canPlaceHere ? 'inherit' : 'text.secondary',
                    },
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    muiTableContainerProps: { sx: { height: '360.4px' } },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [5],
      shape: 'rounded',
      variant: 'outlined',
    },

    //Functions
    renderCreateRowDialogContent: ({ table }) => {
      return (
        <>
          <CatalogueCategoryDialog
            open={true}
            onClose={() => table.setCreatingRow(null)}
            parentId={catalogueCategoryParentId ?? null}
            requestType="post"
            duplicate={requestOrigin === 'item'}
            selectedCatalogueCategory={
              catalogueItemParentCategory
                ? {
                    ...catalogueItemParentCategory,
                    name: generateUniqueName(
                      catalogueItemParentCategory.name,
                      catalogueCategoryNames
                    ),
                  }
                : undefined
            }
            resetSelectedCatalogueCategory={() => table.setCreatingRow(null)}
          />
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<AddIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            table.setCreatingRow(true);
          }}
        >
          Add Catalogue Category
        </Button>
      </Box>
    ),
  });

  React.useEffect(() => {
    if (isCriticalMode !== table.getState().columnVisibility['is_flagged'])
      table.setColumnVisibility((prev) => ({
        ...prev,
        is_flagged: isCriticalMode,
      }));
  }, [isCriticalMode, table]);

  return <MaterialReactTable table={table} />;
};

export default CatalogueCategoryTableView;
