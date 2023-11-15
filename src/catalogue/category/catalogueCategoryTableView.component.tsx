import { Box, Typography } from '@mui/material';
import React from 'react';
import { CatalogueCategory } from '../../app.types';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

export interface CatalogueCategoryTableViewProps {
  selectedCategories: CatalogueCategory[];
  onChangeCatalogueCurrDirId: (catalogueCurrDirId: string | null) => void;
  requestType: 'moveTo' | 'copyTo' | 'standard';
  catalogueCategoryData: CatalogueCategory[] | undefined;
  catalogueCategoryDataLoading: boolean;
}

const CatalogueCategoryTableView = (props: CatalogueCategoryTableViewProps) => {
  const {
    selectedCategories,
    requestType,
    onChangeCatalogueCurrDirId,
    catalogueCategoryDataLoading,
    catalogueCategoryData,
  } = props;
  const selectedCatalogueCategoryIds: (string | null)[] =
    selectedCategories.map((category) => {
      return category.id;
    });
  const columns = React.useMemo<MRT_ColumnDef<CatalogueCategory>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        size: 1135,
        Cell: ({ renderedCellValue, row }) => {
          const canPlaceHere =
            !row.original.is_leaf &&
            (requestType !== 'moveTo' ||
              !selectedCatalogueCategoryIds.includes(row.original.id));
          return (
            <Box
              key={row.original.id}
              onClick={() => {
                if (
                  !row.original.is_leaf &&
                  (!selectedCatalogueCategoryIds.includes(row.original.id) ||
                    requestType === 'copyTo')
                ) {
                  onChangeCatalogueCurrDirId(row.original.id);
                } else if (requestType === 'standard') {
                  onChangeCatalogueCurrDirId(row.original.id);
                }
              }}
              sx={{
                cursor:
                  canPlaceHere || requestType === 'standard'
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              <Typography
                sx={{
                  color:
                    canPlaceHere || requestType === 'standard'
                      ? 'inherit'
                      : 'action.disabled',
                }}
              >
                {renderedCellValue}
              </Typography>
            </Box>
          );
        },
      },
    ];
  }, [onChangeCatalogueCurrDirId, requestType, selectedCatalogueCategoryIds]);

  const table = useMaterialReactTable({
    columns: columns, // If dense only show the name column
    data: catalogueCategoryData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
    muiTableContainerProps: { sx: { height: '360.4px' } },
    enablePagination: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    state: {
      showProgressBars: catalogueCategoryDataLoading, //or showSkeletons
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
