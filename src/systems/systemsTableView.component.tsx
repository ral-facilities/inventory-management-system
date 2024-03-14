import { Box, Button, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { System } from '../app.types';
import SystemDialog from './systemDialog.component';

export interface SystemsTableViewProps {
  systemsData?: System[];
  systemsDataLoading: boolean;
  systemParentId?: string;
  onChangeParentId: (systemId: string | null) => void;
  selectedSystems: System[];
  type: 'moveTo' | 'copyTo';
}

export const SystemsTableView = (props: SystemsTableViewProps) => {
  const {
    systemsData,
    systemsDataLoading,
    systemParentId,
    onChangeParentId,
    selectedSystems,
    type,
  } = props;

  const selectedSystemIds: string[] = React.useMemo(
    () => selectedSystems.map((system) => system.id),
    [selectedSystems]
  );

  const noResultsText = 'No systems found';
  const columns = React.useMemo<MRT_ColumnDef<System>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        Cell: ({ renderedCellValue, row }) => {
          const canPlaceHere =
            type === 'copyTo' || !selectedSystemIds.includes(row.original.id);
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
    ],
    [selectedSystemIds, type]
  );
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: systemsData ?? [],
    // Features
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableTopToolbar: true,
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
    autoResetPageIndex: false,
    paginationDisplayMode: 'pages',
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    state: {
      showProgressBars: systemsDataLoading,
    },
    // MUI
    muiTableBodyRowProps: ({ row }) => {
      const canPlaceHere =
        type === 'copyTo' || !selectedSystemIds.includes(row.original.id);
      return {
        component: TableRow,
        onClick: () => canPlaceHere && onChangeParentId(row.original.id),
        'aria-label': `${row.original.name} row`,
        style: {
          cursor: canPlaceHere ? 'pointer' : 'not-allowed',
        },
      };
    },
    muiTableContainerProps: { sx: { height: '360.4px' } },
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
          <SystemDialog
            open={true}
            onClose={() => table.setCreatingRow(null)}
            parentId={systemParentId}
            type="add"
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
          Add System
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};
