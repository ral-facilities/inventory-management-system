import ClearIcon from '@mui/icons-material/Clear';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  MenuItem,
  TableCellBaseProps,
  TextField,
  Typography,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { CatalogueItem, Item, UsageStatus } from '../api/api.types';
import { useGetCatalogueItemIds } from '../api/catalogueItems';
import { useGetUsageStatuses } from '../api/usageStatuses';
import { usePreservedTableState } from '../common/preservedTableState.component';
import ItemsDetailsPanel from '../items/itemsDetailsPanel.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  MRT_Functions_Localisation,
  OverflowTip,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  customFilterFunctions,
  getInitialColumnFilterFnState,
  mrtTheme,
} from '../utils';
import { UsageStatusesType } from './systemItemsDialog.component';

/* Each table row needs the item and catalogue item */
interface TableRowData {
  item: Item;
  catalogueItem?: CatalogueItem;
}

export interface SystemItemsUsageStatusTableProps {
  items: Item[];
  usageStatuses?: UsageStatusesType[];
  onChangeUsageStatuses?: (usageStatuses: UsageStatusesType[]) => void;
}

export function SystemItemsUsageStatusTable(
  props: SystemItemsUsageStatusTableProps
) {
  const { items, usageStatuses, onChangeUsageStatuses } = props;

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  const [aggregatedCellUsageStatus, setAggregatedCellUsageStatus] =
    React.useState<Omit<UsageStatusesType, 'item_id'>[]>([]);

  const { data: usageStatusesData } = useGetUsageStatuses();

  // Fetch catalogue items for each item to display in the table
  const catalogueItemIdSet = React.useMemo(
    () => new Set<string>(items?.map((item) => item.catalogue_item_id) ?? []),
    [items]
  );
  let isLoading = false;

  const catalogueItemList: (CatalogueItem | undefined)[] =
    useGetCatalogueItemIds(Array.from(catalogueItemIdSet.values())).map(
      (query) => {
        isLoading = isLoading || query.isLoading;
        return query.data;
      }
    );

  // Once loading has finished - pair up all data for the table rows
  // If performance becomes a problem with this should remove find and fetch catalogue
  // item for each item/implement a fullDetails or something in backend
  React.useEffect(() => {
    if (!isLoading) {
      setTableRows(
        items.map(
          (itemData) =>
            ({
              item: itemData,
              catalogueItem: catalogueItemList?.find(
                (catalogueItem) =>
                  catalogueItem?.id === itemData.catalogue_item_id
              ),
            }) as TableRowData
        )
      );
    }
    // Purposefully leave out catalogueItemList - this will never be the same due
    // to the reference changing so instead am relying on isLoading to have changed to
    // false and then back to true again for any re-fetches that occur - only
    // alternative I can see right now requires backend changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, items]);

  React.useEffect(() => {
    if (aggregatedCellUsageStatus && aggregatedCellUsageStatus.length === 0) {
      const initialUsageStatuses: Omit<UsageStatusesType, 'item_id'>[] =
        Array.from(catalogueItemIdSet).map((catalogue_item_id) => ({
          catalogue_item_id: catalogue_item_id,
          usage_status_id: '',
        }));

      setAggregatedCellUsageStatus(initialUsageStatuses);
    }
  }, [
    aggregatedCellUsageStatus,
    catalogueItemIdSet,
    setAggregatedCellUsageStatus,
  ]);

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    return [
      {
        header: 'Catalogue Item',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem?.name,
        getGroupingValue: (row) => row.catalogueItem?.id ?? '',
        id: 'catalogueItem.name',
        filterVariant: 'multi-select',
        filterFn: 'arrIncludesSome',
        columnFilterModeOptions: ['arrIncludesSome', 'arrExcludesSome'],
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => [
          <MenuItem
            key="arrIncludesSome"
            onClick={() => onSelectFilterMode('arrIncludesSome')}
          >
            {MRT_Functions_Localisation.filterArrIncludesSome}
          </MenuItem>,
          <MenuItem
            key="arrExcludesSome"
            onClick={() => onSelectFilterMode('arrExcludesSome')}
          >
            {MRT_Functions_Localisation.filterArrExcludesSome}
          </MenuItem>,
        ],
        size: 350,
        GroupedCell: ({ row }) => {
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
                width: '100%',
              }}
            >
              <OverflowTip
                disableParagraph
                sx={{
                  fontSize: 'inherit',
                  mx: 0.5,
                  width: '14vw',
                }}
              >
                {row.original?.catalogueItem?.name}
                {`(${row.subRows?.length})`}
              </OverflowTip>
            </Box>
          );
        },
      },
      {
        header: 'Serial Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.serial_number ?? 'No serial number',
        id: 'item.serial_number',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...['betweenInclusive'],
        ],
        size: 250,
        enableGrouping: false,
      },
      {
        header: 'Usage Status',
        Header: TableHeaderOverflowTip,
        id: 'item.usage_status',
        size: 350,
        enableColumnActions: false,
        AggregatedCell: ({ row }) => {
          return (
            <FormControl size="small" fullWidth>
              <Autocomplete
                id={`usage-statuses-${row.original.catalogueItem?.name}`}
                size="small"
                value={
                  usageStatusesData?.find(
                    (usageStatus) =>
                      usageStatus.id ==
                      aggregatedCellUsageStatus?.find(
                        (status) =>
                          status.catalogue_item_id ===
                          row.original.catalogueItem?.id
                      )?.usage_status_id
                  ) ?? null
                }
                options={usageStatusesData ?? []}
                getOptionLabel={(usageStatus) => usageStatus.value}
                onChange={(_event, usageStatus: UsageStatus | null) => {
                  if (aggregatedCellUsageStatus) {
                    const itemIndex = aggregatedCellUsageStatus.findIndex(
                      (status: Omit<UsageStatusesType, 'item_id'>) =>
                        status.catalogue_item_id ===
                        row.original.catalogueItem?.id
                    );
                    const updatedAggregatedCellUsageStatus = [
                      ...aggregatedCellUsageStatus,
                    ];

                    updatedAggregatedCellUsageStatus[
                      itemIndex
                    ].usage_status_id = usageStatus?.id ?? '';

                    setAggregatedCellUsageStatus(
                      updatedAggregatedCellUsageStatus
                    );
                  }

                  if (onChangeUsageStatuses && usageStatuses) {
                    const updatedUsageStatuses = [...usageStatuses];

                    for (let i = 0; i < updatedUsageStatuses.length; i++) {
                      const status = updatedUsageStatuses[i];
                      if (
                        status.catalogue_item_id ===
                        row.original.catalogueItem?.id
                      ) {
                        // Update the usageStatus for the matching item
                        updatedUsageStatuses[i].usage_status_id =
                          usageStatus?.id ?? '';
                      }
                    }

                    onChangeUsageStatuses(updatedUsageStatuses);
                  }
                }}
                sx={{ alignItems: 'center' }}
                fullWidth
                disableClearable={
                  !!usageStatuses?.find(
                    (status) => status.item_id === row.original.item.id
                  )?.usage_status_id
                }
                renderInput={(params) => (
                  <TextField {...params} label="Usage statuses" />
                )}
              />
            </FormControl>
          );
        },
        Cell: ({ row }) => {
          return (
            <FormControl size="small" fullWidth>
              <Autocomplete
                id={`usage-statuses-${row.original.item?.serial_number ?? 'no-serial-number'}`}
                size="small"
                value={
                  usageStatusesData?.find(
                    (usageStatus) =>
                      usageStatus.id ==
                      usageStatuses?.find(
                        (status) => status.item_id === row.original.item.id
                      )?.usage_status_id
                  ) ?? null
                }
                options={usageStatusesData ?? []}
                getOptionLabel={(usageStatus) => usageStatus.value}
                onChange={(_event, usageStatus: UsageStatus | null) => {
                  if (onChangeUsageStatuses && usageStatuses) {
                    const itemIndex = usageStatuses.findIndex(
                      (status: UsageStatusesType) =>
                        status.item_id === row.original.item.id
                    );
                    const updatedUsageStatuses = [...usageStatuses];

                    updatedUsageStatuses[itemIndex].usage_status_id =
                      usageStatus?.id ?? '';

                    onChangeUsageStatuses(updatedUsageStatuses);
                  }

                  if (aggregatedCellUsageStatus) {
                    const itemIndex = aggregatedCellUsageStatus.findIndex(
                      (status: Omit<UsageStatusesType, 'item_id'>) =>
                        status.catalogue_item_id ===
                        row.original.catalogueItem?.id
                    );
                    const updatedUsageStatuses = [...aggregatedCellUsageStatus];

                    updatedUsageStatuses[itemIndex].usage_status_id = '';

                    setAggregatedCellUsageStatus(updatedUsageStatuses);
                  }
                }}
                sx={{ alignItems: 'center' }}
                fullWidth
                disableClearable={
                  !!usageStatuses?.find(
                    (status) => status.item_id === row.original.item.id
                  )?.usage_status_id
                }
                renderInput={(params) => (
                  <TextField {...params} required={true} label="Usage status" />
                )}
              />
            </FormControl>
          );
        },
      },
    ];
  }, [
    aggregatedCellUsageStatus,
    setAggregatedCellUsageStatus,
    onChangeUsageStatuses,
    usageStatuses,
    usageStatusesData,
  ]);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { 'item.created_time': false },
      grouping: ['catalogueItem.name'],
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
  });

  const initialExpanded = Object.fromEntries(
    Array.from(catalogueItemIdSet).map((id) => [
      `catalogueItem.name:${id}`,
      true,
    ])
  );

  const noResultsText = 'No items found';
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: tableRows,
    // Features
    enableColumnOrdering: false,
    enableFacetedValues: true,
    enableColumnFilterModes: true,
    enableColumnResizing: false,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: false,
    enableTopToolbar: true,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: false,
    enableRowSelection: false,
    enableGrouping: true,
    enablePagination: true,
    filterFns: customFilterFunctions,
    // Other settings
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    displayColumnDefOptions: {
      'mrt-row-expand': {
        enableResizing: true,
        size: 100,
      },
    },
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      ...MRT_Functions_Localisation,
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      expanded: initialExpanded,
    },
    state: {
      ...preservedState,
      showProgressBars: isLoading,
      rowSelection: rowSelection,
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyCellProps: ({ column }) =>
      //Ignore the usages statuses cell in the dialog as this is a
      // select component and does not need to overflow
      column.id === 'item.usage_status' ||
      // The overflow of these column groups is done manually in the column definition
      ((column.id === 'catalogueItem.name' ||
        column.id === 'item.delivered_date') &&
        column.getIsGrouped()) ||
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                    overFlowTipSx: {
                      width: '25vw',
                    },
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },

    // MUI
    muiTablePaperProps: ({ table }) => ({
      // sx doesn't work here currently - see https://www.material-react-table.com/docs/guides/full-screen-toggle
      style: {
        maxWidth: '100%',
        // SciGateway navigation drawer is 1200, modal is 1300
        zIndex: table.getState().isFullScreen ? 1210 : undefined,
      },
    }),
    muiTableContainerProps: ({ table }) => {
      return {
        sx: {
          height: table.getState().isFullScreen ? '100%' : undefined,

          maxHeight: '670px',
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
    // Fix width to ensure details panels are reasonably close together regardless of table width
    // - appears to be needed only when using enableColumnResizing, MuiCollapse is the container of
    // the details panel
    muiDetailPanelProps: {
      sx: {
        '.MuiCollapse-vertical': {
          width: '800px',
        },
      },
    },
    // Functions
    ...onPreservedStatesChange,
    getRowId: (row) => row.item.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
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
    renderBottomToolbarCustomActions: ({ table }) => (
      <Typography sx={{ paddingLeft: '8px' }}>
        {table.getFilteredRowModel().rows.length == items.length
          ? `Total Items: ${items.length}`
          : `Returned ${table.getFilteredRowModel().rows.length} out of ${items.length} Items`}
      </Typography>
    ),
    renderDetailPanel: ({ row }) =>
      row.original.catalogueItem !== undefined ? (
        <ItemsDetailsPanel
          itemData={row.original.item}
          catalogueItemIdData={row.original.catalogueItem}
        />
      ) : undefined,
  });

  return <MaterialReactTable table={table} />;
}
