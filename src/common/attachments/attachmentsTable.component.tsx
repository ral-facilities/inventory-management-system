import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TableCellBaseProps,
  TableRow,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { AttachmentPostMetadataResponse } from '../../api/api.types';
import { useGetAttachments, usePatchAttachment } from '../../api/attachments';
import EditFileDialog from '../editFileDialog.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
} from '../../utils';
import { usePreservedTableState } from '../preservedTableState.component';

export interface AttachmentTableProps {
  entityId?: string;
}

function AttachmentsTable(props: AttachmentTableProps) {
  const { entityId } = props;
  const { data: attachments, isLoading: attachmentIsLoading } = useGetAttachments(entityId);

  const [selectedAttachment, setSelectedAttachment] = React.useState<
    AttachmentPostMetadataResponse | undefined
  >(undefined);

  const [openMenuDialog, setOpenMenuDialog] = React.useState<
    'edit' | false
  >(false);

  const columns = React.useMemo<MRT_ColumnDef<AttachmentPostMetadataResponse>[]>(() => {
    return [
      {
        header: 'Filename',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.file_name,
        id: 'filename',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 300,
      },
      {
        header: 'Title',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.title,
        id: 'title',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size:300,
      },
      {
        header: 'Description',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.description,
        id: 'description',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 400,
      },
      {
        header: 'Created',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.created_time),
        id: 'created_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.created_time, true),
      },
      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.modified_time, true),
      },
    ];
  }, []);

  const noResultsTxt =
    'No results found: Try adding an Attachment by using the Add Attachment button on the top left of your screen';

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    // Data
    columns: columns, // If dense only show the name column
    data: attachments ?? [], // Data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
    enableColumnResizing: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    // Other settings
    manualFiltering: false,
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
    },
    state: {
        ...preservedState,
        showProgressBars: attachmentIsLoading, // or showSkeletons
    },

    // MUI
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.file_name} row` };
    },
    muiTablePaperProps: { sx: { maxHeight: '100%' } },
    muiTableContainerProps: ({ table }) => ({
      sx: {
        minHeight: '360.4px',
        height: table.getState().isFullScreen ? '100%' : undefined,
        maxHeight: '670px',
      },
    }),
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },

    muiTableBodyCellProps: ({ column }) =>
      // Ignore MRT rendered cells e.g. expand, spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },

    // Functions
    ...onPreservedStatesChange,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: '4px' }}
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
          key="edit"
          aria-label={`Edit ${row.original.file_name} attachment`}
          onClick={() => {
            setSelectedAttachment(row.original);
            setOpenMenuDialog('edit');
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      ];
    },

    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, attachments, 'Attachments', {
        paddingLeft: '8px',
      }),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      {selectedAttachment && (
        <>
          <EditFileDialog
            open={openMenuDialog === 'edit'}
            onClose={() => setOpenMenuDialog(false)}
            fileType="Attachment"
            usePatchFile={usePatchAttachment}
            selectedFile={selectedAttachment}
          />
        </>
      )}
    </>
  );
}

export default AttachmentsTable;
