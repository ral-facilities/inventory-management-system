import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download';
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
import { AttachmentMetadata } from '../../api/api.types';
import { useGetAttachments, usePatchAttachment } from '../../api/attachments';
import DeleteAttachmentDialog from './deleteAttachmentDialog.component';
import DownloadFileDialog from '../downloadFileDialog.component';
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
  getPageHeightCalc,
  mrtTheme,
} from '../../utils';
import { usePreservedTableState } from '../preservedTableState.component';

export interface AttachmentTableProps {
  entityId: string;
}

function AttachmentsTable(props: AttachmentTableProps) {
  const { entityId } = props;
  const { data: attachments, isLoading: attachmentIsLoading } =
    useGetAttachments(entityId);

  const [deleteAttachmentDialog, setDeleteAttachmentDialog] =
    React.useState<boolean>(false);

  const [downloadAttachmentDialog, setDownloadAttachmentDialog] =
    React.useState<boolean>(false);

  const [selectedAttachment, setSelectedAttachment] = React.useState<AttachmentMetadata>();

  const columns = React.useMemo<MRT_ColumnDef<AttachmentMetadata>[]>(() => {
    return [
      {
        header: 'File name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.file_name,
        id: 'name',
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
        size: 300,
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
    enableFullScreenToggle: true,
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

    // MRT
    mrtTheme,

    // MUI
    muiTableBodyRowProps: ({ row }) => {
      return {
        component: TableRow,
        'aria-label': `${row.original.file_name} row`,
      };
    },
    muiTablePaperProps: { sx: { maxHeight: '100%' } },
    muiTableContainerProps: ({ table }) => {
      const showAlert =
        table.getState().showAlertBanner ||
        table.getFilteredSelectedRowModel().rows.length > 0 ||
        table.getState().grouping.length > 0;
      return {
        sx: {
          height: table.getState().isFullScreen
            ? '100%'
            : getPageHeightCalc(`272px  ${showAlert ? '+ 72px' : ''}`),
        },
      };
    },
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

    renderEditRowDialogContent: ({ table, row }) => (
      <EditFileDialog
        open={true}
        onClose={() => table.setEditingRow(null)}
        fileType="Attachment"
        usePatchFile={usePatchAttachment}
        selectedFile={row.original}
      />
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
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

    renderRowActionMenuItems: ({ closeMenu, row, table }) => {
      return [
        <MenuItem
          key="edit"
          aria-label={`Edit ${row.original.file_name} attachment`}
          onClick={() => {
            table.setEditingRow(row);
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
          aria-label={`Download ${row.original.file_name} attachment`}
          onClick={() => {
            setSelectedAttachment(row.original);
            setDownloadAttachmentDialog(true);
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
          key="delete"
          aria-label={`Delete attachment ${row.original.file_name}`}
          onClick={() => {
            setSelectedAttachment(row.original);
            setDeleteAttachmentDialog(true);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
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
      <DeleteAttachmentDialog
        open={deleteAttachmentDialog}
        onClose={() => setDeleteAttachmentDialog(false)}
        attachment={selectedAttachment}
      />
      {selectedAttachment && (
        <DownloadFileDialog
          open={downloadAttachmentDialog}
          onClose={() => setDownloadAttachmentDialog(false)}
          fileType="Attachment"
          file={selectedAttachment}
        />
      )}
    </>
  );
}

export default AttachmentsTable;
