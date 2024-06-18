import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCellBaseProps, TableRow } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { CatalogueCategory } from '../../app.types';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  formatDateTimeStrings,
  generateUniqueName,
} from '../../utils';
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

  const catalogueCategoryNames: string[] =
    catalogueCategoryData?.map((item) => item.name) || [];

  const noResultsTxt = 'No catalogue categories found';
  const columns = React.useMemo<MRT_ColumnDef<CatalogueCategory>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        id: 'name',
        size: 567.5,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: 'datetime-range',
        size: 567.5,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.modified_time &&
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
    enableColumnPinning: false,
    enableTopToolbar: true,
    enableFacetedValues: true,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
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
    },
    state: {
      showProgressBars: catalogueCategoryDataLoading, //or showSkeletons
    },
    // MUI
    muiTableBodyRowProps: ({ row }) => {
      const canPlaceHere =
        (!row.original.is_leaf &&
          (requestType !== 'moveTo' ||
            !selectedCatalogueCategoryIds.includes(row.original.id))) ||
        requestType === 'standard';
      return {
        component: TableRow,
        onClick: () => {
          canPlaceHere && onChangeParentCategoryId(row.original.id);
        },
        'aria-label': `${row.original.name} row`,
        style: {
          cursor: canPlaceHere ? 'pointer' : 'not-allowed',
        },
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
                      color: canPlaceHere ? 'inherit' : 'action.disabled',
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
            type={requestOrigin === 'category' ? 'add' : 'save as'}
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

  return <MaterialReactTable table={table} />;
};

export default CatalogueCategoryTableView;
