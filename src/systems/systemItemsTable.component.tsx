import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Link as MuiLink,
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
import { Link } from 'react-router-dom';
import { useCatalogueItemIds } from '../api/catalogueItems';
import { useItems } from '../api/items';
import { CatalogueItem, Item, System, UsageStatus } from '../app.types';
import { usePreservedTableState } from '../common/preservedTableState.component';
import ItemsDetailsPanel from '../items/itemsDetailsPanel.component';
import SystemItemsDialog, {
  ItemUsageStatusesErrorStateType,
  UsageStatusesType,
} from './systemItemsDialog.component';
import { formatDateTimeStrings } from '../utils';
import { useUsageStatuses } from '../api/usageStatuses';

const MoveItemsButton = (props: {
  selectedItems: Item[];
  system: System;
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
}) => {
  const [moveItemsDialogOpen, setMoveItemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        startIcon={<DriveFileMoveOutlinedIcon />}
        sx={{ mx: 0.5 }}
        variant="outlined"
        disabled={props.selectedItems.length === 0}
        onClick={() => setMoveItemsDialogOpen(true)}
      >
        Move to
      </Button>
      <SystemItemsDialog
        open={moveItemsDialogOpen}
        onClose={() => setMoveItemsDialogOpen(false)}
        selectedItems={props.selectedItems}
        onChangeSelectedItems={props.onChangeSelectedItems}
        parentSystemId={props.system.id}
      />
    </>
  );
};

/* Each table row needs the item and catalogue item */
interface TableRowData {
  item: Item;
  catalogueItem?: CatalogueItem;
}

export interface SystemItemsTableProps {
  system?: System;
  type: 'normal' | 'usageStatus';
  moveToSelectedItems?: Item[];
  usageStatuses?: UsageStatusesType[];
  onChangeUsageStatuses?: (usageStatuses: UsageStatusesType[]) => void;
  aggregatedCellUsageStatus?: Omit<UsageStatusesType, 'item_id'>[];
  onChangeAggregatedCellUsageStatus?: (
    aggregatedCellUsageStatus: Omit<UsageStatusesType, 'item_id'>[]
  ) => void;
  itemUsageStatusesErrorState?: ItemUsageStatusesErrorStateType;
  onChangeItemUsageStatusesErrorState?: (
    itemUsageStatusesErrorState: ItemUsageStatusesErrorStateType
  ) => void;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const {
    system,
    type,
    moveToSelectedItems,
    usageStatuses,
    onChangeUsageStatuses,
    aggregatedCellUsageStatus,
    onChangeAggregatedCellUsageStatus,
    itemUsageStatusesErrorState,
    onChangeItemUsageStatusesErrorState,
  } = props;

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  // Data
  const { data: itemsData, isLoading: isLoadingItems } = useItems(
    system?.id,
    undefined
  );

  const { data: usageStatusesData } = useUsageStatuses();

  // Obtain the selected system data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedItems =
    type === 'normal'
      ? itemsData?.filter((item) => selectedRowIds.includes(item.id)) ?? []
      : moveToSelectedItems?.filter((item) =>
          selectedRowIds.includes(item.id)
        ) ?? [];

  // Fetch catalogue items for each item to display in the table
  const catalogueItemIdSet = React.useMemo(
    () =>
      type === 'normal'
        ? new Set<string>(
            itemsData?.map((item) => item.catalogue_item_id) ?? []
          )
        : new Set<string>(
            moveToSelectedItems?.map((item) => item.catalogue_item_id) ?? []
          ),
    [itemsData, moveToSelectedItems, type]
  );
  let isLoading = type === 'normal' ? isLoadingItems : false;

  const catalogueItemList: (CatalogueItem | undefined)[] = useCatalogueItemIds(
    Array.from(catalogueItemIdSet.values())
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  // Once loading has finished - pair up all data for the table rows
  // If performance becomes a problem with this should remove find and fetch catalogue
  // item for each item/implement a fullDetails or something in backend
  React.useEffect(() => {
    if (!isLoading && itemsData) {
      setTableRows(
        itemsData.map(
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
    } else if (!isLoading && moveToSelectedItems) {
      setTableRows(
        moveToSelectedItems.map(
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
  }, [isLoading, itemsData, moveToSelectedItems]);

  React.useEffect(() => {
    if (
      onChangeAggregatedCellUsageStatus &&
      aggregatedCellUsageStatus &&
      aggregatedCellUsageStatus.length === 0
    ) {
      const initialUsageStatuses: Omit<UsageStatusesType, 'item_id'>[] =
        Array.from(catalogueItemIdSet).map((catalogue_item_id) => ({
          catalogue_item_id: catalogue_item_id,
          usage_status_id: '',
        }));

      onChangeAggregatedCellUsageStatus(initialUsageStatuses);
    }
  }, [
    aggregatedCellUsageStatus,
    catalogueItemIdSet,
    onChangeAggregatedCellUsageStatus,
  ]);

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    return [
      {
        header: 'Catalogue Item',
        accessorFn: (row) => row.catalogueItem?.name,
        id: 'catalogueItem.name',
        Cell:
          type === 'normal'
            ? ({ renderedCellValue, row }) => (
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`/catalogue/item/${row.original.item.catalogue_item_id}`}
                  // For ensuring space when grouping
                  sx={{ marginRight: 0.5 }}
                >
                  {renderedCellValue}
                </MuiLink>
              )
            : undefined,
        size: 250,
        GroupedCell: ({ row, table }) => {
          const { grouping } = table.getState();
          const nameGroupedCellError = itemUsageStatusesErrorState
            ? Object.values(itemUsageStatusesErrorState).filter(
                (errorState) =>
                  errorState.catalogue_item_id ===
                  row.original.item.catalogue_item_id
              ).length !== 0
            : false;

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: nameGroupedCellError ? 'error.main' : 'inherit',
              }}
            >
              {nameGroupedCellError && (
                <ErrorIcon sx={{ color: 'error.main' }} />
              )}
              {type === 'normal' ? (
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`/catalogue/item/${row.original.item.catalogue_item_id}`}
                  // For ensuring space when grouping
                  sx={{ mx: 0.5 }}
                >
                  {row.getValue(grouping[grouping.length - 1])}
                </MuiLink>
              ) : (
                <Box sx={{ mx: 0.5 }}>
                  {row.getValue(grouping[grouping.length - 1])}
                </Box>
              )}

              {`(${row.subRows?.length})`}
            </Box>
          );
        },
      },
      {
        header: 'Serial Number',
        accessorFn: (row) => row.item.serial_number ?? 'No serial number',
        id: 'item.serial_number',
        size: 250,
        Cell:
          type === 'normal'
            ? ({ row }) => (
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`/catalogue/item/${row.original.item.catalogue_item_id}/items/${row.original.item.id}`}
                >
                  {row.original.item.serial_number ?? 'No serial number'}
                </MuiLink>
              )
            : undefined,
        enableGrouping: false,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.item.modified_time),
        id: 'item.modified_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.item.modified_time &&
          formatDateTimeStrings(row.original.item.modified_time, true),
      },
      {
        header: 'Created',
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'item.created_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
      },
      {
        header: 'Delivered Date',
        accessorFn: (row) => new Date(row.item.delivered_date ?? ''),
        id: 'item.delivered_date',
        filterVariant: 'date-range',
        size: 350,
        Cell: ({ row }) => (
          <Typography
            // For ensuring space when grouping
            sx={{ marginRight: 0.5, fontSize: 'inherit' }}
          >
            {row.original.item.delivered_date &&
              formatDateTimeStrings(row.original.item.delivered_date, false)}
          </Typography>
        ),
      },
      {
        header: 'Is Defective',
        accessorFn: (row) => (row.item.is_defective === true ? 'Yes' : 'No'),
        id: 'item.is_defective',
        size: 200,
        filterVariant: 'autocomplete',
      },
      {
        header: 'Usage Status',
        accessorFn:
          type === 'usageStatus' ? undefined : (row) => row.item.usage_status,
        id: 'item.usage_status',
        size: 200,
        filterVariant: 'autocomplete',
        AggregatedCell:
          type === 'usageStatus'
            ? ({ row }) => {
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
                        if (
                          onChangeAggregatedCellUsageStatus &&
                          aggregatedCellUsageStatus
                        ) {
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

                          onChangeAggregatedCellUsageStatus(
                            updatedAggregatedCellUsageStatus
                          );
                        }

                        if (onChangeUsageStatuses && usageStatuses) {
                          const updatedUsageStatuses = [...usageStatuses];

                          for (
                            let i = 0;
                            i < updatedUsageStatuses.length;
                            i++
                          ) {
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

                        if (
                          itemUsageStatusesErrorState &&
                          onChangeItemUsageStatusesErrorState
                        ) {
                          const updatedItemUsageStatusesErrorState = {
                            ...itemUsageStatusesErrorState,
                          };
                          Object.entries(itemUsageStatusesErrorState).forEach(
                            ([item_id, status]) => {
                              if (
                                status.catalogue_item_id ===
                                row.original.item.catalogue_item_id
                              ) {
                                delete updatedItemUsageStatusesErrorState[
                                  item_id
                                ];
                              }
                            }
                          );

                          onChangeItemUsageStatusesErrorState(
                            updatedItemUsageStatusesErrorState
                          );
                        }
                      }}
                      sx={{ alignItems: 'center' }}
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required={true}
                          label="Usage statuses"
                        />
                      )}
                    />
                  </FormControl>
                );
              }
            : undefined,
        Cell:
          type === 'usageStatus'
            ? ({ row }) => {
                const usageStatusCellError = !!(
                  itemUsageStatusesErrorState &&
                  itemUsageStatusesErrorState[row.original.item.id]
                );
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
                              (status) =>
                                status.item_id === row.original.item.id
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

                        if (
                          itemUsageStatusesErrorState &&
                          onChangeItemUsageStatusesErrorState
                        ) {
                          const updatedItemUsageStatusesErrorState = {
                            ...itemUsageStatusesErrorState,
                          };
                          delete updatedItemUsageStatusesErrorState[
                            row.original.item.id
                          ];
                          onChangeItemUsageStatusesErrorState(
                            updatedItemUsageStatusesErrorState
                          );
                        }

                        if (
                          onChangeAggregatedCellUsageStatus &&
                          aggregatedCellUsageStatus
                        ) {
                          const itemIndex = aggregatedCellUsageStatus.findIndex(
                            (status: Omit<UsageStatusesType, 'item_id'>) =>
                              status.catalogue_item_id ===
                              row.original.catalogueItem?.id
                          );
                          const updatedUsageStatuses = [
                            ...aggregatedCellUsageStatus,
                          ];

                          updatedUsageStatuses[itemIndex].usage_status_id = '';

                          onChangeAggregatedCellUsageStatus(
                            updatedUsageStatuses
                          );
                        }
                      }}
                      sx={{ alignItems: 'center' }}
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required={true}
                          label="Usage statuses"
                          error={usageStatusCellError}
                          helperText={
                            usageStatusCellError &&
                            itemUsageStatusesErrorState[row.original.item.id]
                              .message
                          }
                        />
                      )}
                    />
                  </FormControl>
                );
              }
            : undefined,
      },
    ];
  }, [
    aggregatedCellUsageStatus,
    itemUsageStatusesErrorState,
    onChangeAggregatedCellUsageStatus,
    onChangeItemUsageStatusesErrorState,
    onChangeUsageStatuses,
    type,
    usageStatuses,
    usageStatusesData,
  ]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { 'item.created_time': false },
      grouping: ['catalogueItem.name'],
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: type === 'normal',
  });

  const noResultsText = 'No items found';
  const table = useMaterialReactTable({
    // Data
    columns:
      type === 'normal'
        ? columns
        : [
            { ...columns[0], size: 200 },
            { ...columns[1], size: 200 },
            { ...columns[6], size: 200 },
          ],
    data: tableRows,
    // Features
    enableColumnOrdering: type === 'normal' ? true : false,
    enableFacetedValues: true,
    enableColumnResizing: type === 'normal' ? true : false,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: type === 'normal' ? true : false,
    enableTopToolbar: true,
    enableRowVirtualization: false,
    enableFullScreenToggle: type === 'normal' ? true : false,
    enableColumnVirtualization: false,
    enableRowSelection: type === 'normal' ? true : false,
    enableGrouping: true,
    enablePagination: true,
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
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: isLoading,
      rowSelection: rowSelection,
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
    muiTableContainerProps: ({ table }) => ({
      sx: {
        minHeight: '360.4px',
        height: table.getState().isFullScreen ? '100%' : undefined,
        maxHeight: type === 'usageStatus' ? '670px' : undefined,
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
        {system && type === 'normal' && (
          <MoveItemsButton
            selectedItems={selectedItems}
            system={system}
            onChangeSelectedItems={setRowSelection}
          />
        )}
      </Box>
    ),
    renderBottomToolbarCustomActions: ({ table }) => (
      <Typography sx={{ paddingLeft: '8px' }}>
        {table.getFilteredRowModel().rows.length ==
        (type == 'normal' ? itemsData : moveToSelectedItems)?.length
          ? `Total Items: ${(type == 'normal' ? itemsData : moveToSelectedItems)?.length}`
          : `Returned ${table.getFilteredRowModel().rows.length} out of ${(type == 'normal' ? itemsData : moveToSelectedItems)?.length} Items`}
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
