import { TableRow, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { CatalogueCategory } from '../../app.types';

export interface CatalogueCategoryTableViewProps {
  selectedCategories: CatalogueCategory[];
  onChangeParentCategoryId: (catalogueCurrDirId: string | null) => void;
  requestType: 'moveTo' | 'copyTo' | 'standard';
  catalogueCategoryData: CatalogueCategory[] | undefined;
  catalogueCategoryDataLoading: boolean;
}

const CatalogueCategoryTableView = (props: CatalogueCategoryTableViewProps) => {
  const {
    selectedCategories,
    requestType,
    onChangeParentCategoryId,
    catalogueCategoryDataLoading,
    catalogueCategoryData,
  } = props;
  const selectedCatalogueCategoryIds: (string | null)[] =
    selectedCategories.map((category) => {
      return category.id;
    });

  const noResultsTxt = 'No catalogue categories found';
  const columns = React.useMemo<MRT_ColumnDef<CatalogueCategory>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        size: 1135,
        Cell: ({ renderedCellValue, row }) => {
          const canPlaceHere =
            (!row.original.is_leaf &&
              (requestType !== 'moveTo' ||
                !selectedCatalogueCategoryIds.includes(row.original.id))) ||
            requestType === 'standard';
          return (
            <Typography
              sx={{
                color: canPlaceHere ? 'inherit' : 'action.disabled',
              }}
            >
              {renderedCellValue}
            </Typography>
          );
        },
      },
    ];
  }, [requestType, selectedCatalogueCategoryIds]);

  const table = useMaterialReactTable({
    // Data
    columns: columns, // If dense only show the name column
    data: catalogueCategoryData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableTopToolbar: false,
    enableColumnResizing: false,
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
  });

  return <MaterialReactTable table={table} />;
};

export default CatalogueCategoryTableView;
