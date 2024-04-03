import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Link as MuiLink,
  Select,
  Typography,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_RowSelectionState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItemIds } from '../api/catalogueItems';
import { useItems } from '../api/items';
import { CatalogueItem, Item, System, UsageStatusType } from '../app.types';
import ItemsDetailsPanel from '../items/itemsDetailsPanel.component';
import SystemItemsDialog, {
  UsageStatuesErrorType,
  UsageStatuesType,
} from './systemItemsDialog.component';
import { formatDateTimeStrings } from '../utils';

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
  usageStatues?: UsageStatuesType[];
  onChangeUsageStatues?: (usageStatues: UsageStatuesType[]) => void;
  usageStatuesErrors?: UsageStatuesErrorType[];
  onChangeUsageStatuesErrors?: (
    usageStatuesErrors: UsageStatuesErrorType[]
  ) => void;
  aggregatedCellUsageStatus?: Omit<UsageStatuesType, 'item_id'>[];
  onChangeAggregatedCellUsageStatus?: (
    aggregatedCellUsageStatus?: Omit<UsageStatuesType, 'item_id'>[]
  ) => void;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const {
    system,
    type,
    moveToSelectedItems,
    usageStatues,
    onChangeUsageStatues,
    usageStatuesErrors,
    onChangeUsageStatuesErrors,
    aggregatedCellUsageStatus,
    onChangeAggregatedCellUsageStatus,
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
    // false and then back to true again for any refetches that occurr - only
    // alternative I can see right now requires backend changes

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, itemsData]);

  const status = (usageStatus: UsageStatusType | undefined | '') => {
    if (typeof usageStatus !== 'number') return '';
    const status = Object.values(UsageStatusType).find(
      (value) =>
        UsageStatusType[value as keyof typeof UsageStatusType] === usageStatus
    );
    return status || '';
  };

  React.useEffect(() => {
    if (
      onChangeAggregatedCellUsageStatus &&
      aggregatedCellUsageStatus &&
      aggregatedCellUsageStatus.length === 0
    ) {
      const initialUsageStatues: Omit<UsageStatuesType, 'item_id'>[] =
        Array.from(catalogueItemIdSet).map((catalogue_item_id) => ({
          catalogue_item_id: catalogue_item_id,
          usageStatus: '', // Setting usageStatus to an empty string by default
        }));

      onChangeAggregatedCellUsageStatus(initialUsageStatues); // Using onChangeAggregatedCellUsageStatus to update state
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
          const error = usageStatuesErrors
            ? usageStatuesErrors.filter(
                (status) =>
                  status.catalogue_item_id === row.original.catalogueItem?.id &&
                  status.error === true
              ).length !== 0
            : false;

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: error ? 'error.main' : 'inherit',
              }}
            >
              {error && <ErrorIcon sx={{ color: 'error.main' }} />}
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
        filterVariant: 'select',
      },
      {
        header: 'Usage Status',
        accessorFn: (row) => {
          // Assuming row.usage_status contains the numeric value corresponding to the enum
          const status = Object.values(UsageStatusType).find(
            (value) =>
              UsageStatusType[value as keyof typeof UsageStatusType] ===
              row.item.usage_status
          );
          return status || 'Unknown';
        },
        id: 'item.usage_status',
        size: 200,
        filterVariant: 'select',
        AggregatedCell:
          type === 'usageStatus'
            ? ({ row }) => {
                return (
                  <FormControl size="small" fullWidth>
                    <InputLabel
                      id={`usage-statues-${row.original.catalogueItem?.name}`}
                    >
                      Usage statues
                    </InputLabel>
                    <Select
                      labelId={`usage-statues-${row.original.catalogueItem?.name}`}
                      size="small"
                      value={
                        aggregatedCellUsageStatus
                          ? status(
                              aggregatedCellUsageStatus.find(
                                (status) =>
                                  status.catalogue_item_id ===
                                  row.original.catalogueItem?.id
                              )?.usageStatus
                            )
                          : ''
                      }
                      onChange={(event) => {
                        if (
                          onChangeAggregatedCellUsageStatus &&
                          aggregatedCellUsageStatus
                        ) {
                          const itemIndex = aggregatedCellUsageStatus.findIndex(
                            (status: Omit<UsageStatuesType, 'item_id'>) =>
                              status.catalogue_item_id ===
                              row.original.catalogueItem?.id
                          );
                          const updatedUsageStatues = [
                            ...aggregatedCellUsageStatus,
                          ];

                          updatedUsageStatues[itemIndex].usageStatus =
                            UsageStatusType[
                              event.target.value as keyof typeof UsageStatusType
                            ];

                          onChangeAggregatedCellUsageStatus(
                            updatedUsageStatues
                          );
                        }

                        if (onChangeUsageStatues && usageStatues) {
                          const updatedUsageStatues = [...usageStatues];

                          for (let i = 0; i < updatedUsageStatues.length; i++) {
                            const status = updatedUsageStatues[i];
                            if (
                              status.catalogue_item_id ===
                              row.original.catalogueItem?.id
                            ) {
                              // Update the usageStatus for the matching item
                              updatedUsageStatues[i].usageStatus =
                                UsageStatusType[
                                  event.target
                                    .value as keyof typeof UsageStatusType
                                ];
                            }
                          }

                          onChangeUsageStatues(updatedUsageStatues);
                        }
                        if (onChangeUsageStatuesErrors && usageStatuesErrors) {
                          const updatedUsageStatuesErrors = [
                            ...usageStatuesErrors,
                          ];

                          for (
                            let i = 0;
                            i < updatedUsageStatuesErrors.length;
                            i++
                          ) {
                            const status = updatedUsageStatuesErrors[i];
                            if (
                              status.catalogue_item_id ===
                              row.original.catalogueItem?.id
                            ) {
                              updatedUsageStatuesErrors[i].error = false;
                            }
                          }
                          onChangeUsageStatuesErrors(updatedUsageStatuesErrors);
                        }
                      }}
                      label="Usage statues"
                    >
                      <MenuItem value={'new'}>New</MenuItem>
                      <MenuItem value={'inUse'}>In Use</MenuItem>
                      <MenuItem value={'used'}>Used</MenuItem>
                      <MenuItem value={'scrapped'}>Scrapped</MenuItem>
                    </Select>
                  </FormControl>
                );
              }
            : undefined,
        Cell:
          type === 'usageStatus'
            ? ({ row }) => {
                const error = usageStatuesErrors?.find(
                  (status) => status.item_id === row.original.item.id
                )?.error;
                return (
                  <FormControl size="small" fullWidth>
                    <InputLabel
                      required={true}
                      id={`usage-status-${row.original.item.id}`}
                      error={
                        usageStatuesErrors?.find(
                          (status) => status.item_id === row.original.item.id
                        )?.error
                      }
                    >
                      Usage status
                    </InputLabel>
                    <Select
                      required={true}
                      labelId={`usage-status-${row.original.item.id}`}
                      size="small"
                      value={
                        usageStatues
                          ? status(
                              usageStatues.find(
                                (status) =>
                                  status.item_id === row.original.item.id
                              )?.usageStatus
                            )
                          : ''
                      }
                      onChange={(event) => {
                        if (onChangeUsageStatues && usageStatues) {
                          const itemIndex = usageStatues.findIndex(
                            (status: UsageStatuesType) =>
                              status.item_id === row.original.item.id
                          );
                          const updatedUsageStatues = [...usageStatues];

                          updatedUsageStatues[itemIndex].usageStatus =
                            UsageStatusType[
                              event.target.value as keyof typeof UsageStatusType
                            ];

                          onChangeUsageStatues(updatedUsageStatues);
                        }
                        if (onChangeUsageStatuesErrors && usageStatuesErrors) {
                          const itemIndex = usageStatuesErrors.findIndex(
                            (status: UsageStatuesErrorType) =>
                              status.item_id === row.original.item.id
                          );
                          const updatedUsageStatues = [...usageStatuesErrors];

                          updatedUsageStatues[itemIndex].error = false;

                          onChangeUsageStatuesErrors(updatedUsageStatues);
                        }

                        if (
                          onChangeAggregatedCellUsageStatus &&
                          aggregatedCellUsageStatus
                        ) {
                          const itemIndex = aggregatedCellUsageStatus.findIndex(
                            (status: Omit<UsageStatuesType, 'item_id'>) =>
                              status.catalogue_item_id ===
                              row.original.catalogueItem?.id
                          );
                          const updatedUsageStatues = [
                            ...aggregatedCellUsageStatus,
                          ];

                          updatedUsageStatues[itemIndex].usageStatus = '';

                          onChangeAggregatedCellUsageStatus(
                            updatedUsageStatues
                          );
                        }
                      }}
                      error={error}
                      label="Usage status"
                    >
                      <MenuItem value={'new'}>New</MenuItem>
                      <MenuItem value={'inUse'}>In Use</MenuItem>
                      <MenuItem value={'used'}>Used</MenuItem>
                      <MenuItem value={'scrapped'}>Scrapped</MenuItem>
                    </Select>
                    {error && (
                      <FormHelperText error>
                        Please select a usage status
                      </FormHelperText>
                    )}
                  </FormControl>
                );
              }
            : undefined,
      },
    ];
  }, [
    aggregatedCellUsageStatus,
    onChangeAggregatedCellUsageStatus,
    onChangeUsageStatues,
    onChangeUsageStatuesErrors,
    type,
    usageStatues,
    usageStatuesErrors,
  ]);

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

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
      grouping: ['catalogueItem.name'],
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: { 'item.created_time': false },
    },
    state: {
      showProgressBars: isLoading,
      columnFilters: columnFilters,
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
    getRowId: (row) => row.item.id,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          disabled={columnFilters.length === 0}
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
    renderDetailPanel: ({ row }) =>
      type === 'usageStatus' ? undefined : row.original.catalogueItem !==
        undefined ? (
        <ItemsDetailsPanel
          itemData={row.original.item}
          catalogueItemIdData={row.original.catalogueItem}
        />
      ) : undefined,
  });

  return <MaterialReactTable table={table} />;
}
