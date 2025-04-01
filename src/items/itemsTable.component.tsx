import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  TableCellBaseProps,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueItem,
  Item,
  System,
} from '../api/api.types';
import { useGetItems } from '../api/items';
import { useGetSystemIds } from '../api/systems';
import { findPropertyValue } from '../catalogue/items/catalogueItemsTable.component';
import { usePreservedTableState } from '../common/preservedTableState.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  customFilterFunctions,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  MRT_Functions_Localisation,
  mrtTheme,
  OPTIONAL_FILTER_MODE_OPTIONS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
} from '../utils';
import DeleteItemDialog from './deleteItemDialog.component';
import ItemDialog from './itemDialog.component';
import ItemsDetailsPanel from './itemsDetailsPanel.component';

export interface ItemTableProps {
  catalogueCategory: CatalogueCategory;
  catalogueItem: CatalogueItem;
  dense: boolean;
}

interface TableRowData {
  item: Item;
  system?: System;
}

export function ItemsTable(props: ItemTableProps) {
  const { catalogueCategory, catalogueItem, dense } = props;

  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const noResultsText =
    'No results found: Try adding an item by using the Add Item button on the top left of your screen';
  const { data: itemsData, isLoading: isLoadingItems } = useGetItems(
    undefined,
    catalogueItem.id
  );

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [selectedItem, setSelectedItem] = React.useState<Item | undefined>(
    undefined
  );

  const systemIdSet = new Set<string>(
    itemsData?.map((item) => item.system_id) ?? []
  );

  let isLoading = isLoadingItems;
  const systemList: (System | undefined)[] = useGetSystemIds(
    Array.from(systemIdSet.values())
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  //Once loading finished - use same logic as catalogueItemsTable to pair up data
  React.useEffect(() => {
    if (!isLoading && itemsData) {
      setTableRows(
        itemsData.map((itemData) => ({
          item: itemData,
          system: systemList?.find(
            (system) => system?.id === itemData.system_id
          ),
        }))
      );
    }
    //Purposefully leave out systemList from dependencies for same reasons as catalogueItemsTable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsData, isLoading]);

  const [itemDialogType, setItemsDialogType] = React.useState<
    'create' | 'duplicate' | 'edit'
  >('create');

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');
  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    const viewCatalogueItemProperties = catalogueCategory?.properties ?? [];
    return [
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
        size: 225,
        Cell: ({ row }) => (
          <MuiLink underline="hover" component={Link} to={row.original.item.id}>
            {row.original.item.serial_number ?? 'No serial number'}
          </MuiLink>
        ),
        enableGrouping: false,
      },

      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.item.modified_time),
        id: 'item.modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.modified_time, true),
        enableGrouping: false,
      },
      {
        header: 'Created',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'item.created_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
        enableGrouping: false,
      },

      {
        header: 'Asset Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.asset_number ?? '',
        id: 'item.asset_number',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 225,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Purchase Order Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.purchase_order_number ?? '',
        id: 'item.purchase_order_number',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 275,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Warranty End Date',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.item.warranty_end_date
            ? new Date(row.item.warranty_end_date)
            : '',
        id: 'item.warranty_end_date',
        filterVariant: COLUMN_FILTER_VARIANTS.date,
        filterFn: COLUMN_FILTER_FUNCTIONS.date,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.date,
        size: 350,
        Cell: ({ row }) =>
          row.original.item.warranty_end_date &&
          formatDateTimeStrings(row.original.item.warranty_end_date, false),
        GroupedCell: (props) =>
          TableGroupedCell({
            ...props,
            outputType: 'Date',
          }),
      },
      {
        header: 'Delivered Date',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.item.delivered_date ? new Date(row.item.delivered_date) : '',
        id: 'item.delivered_date',
        filterVariant: COLUMN_FILTER_VARIANTS.date,
        filterFn: COLUMN_FILTER_FUNCTIONS.date,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.date,
        size: 350,
        Cell: ({ row }) =>
          row.original.item.delivered_date &&
          formatDateTimeStrings(row.original.item.delivered_date, false),
        GroupedCell: (props) =>
          TableGroupedCell({
            ...props,
            outputType: 'Date',
          }),
      },
      {
        header: 'Expected Lifetime (Days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.expected_lifetime_days ?? '',
        id: 'item.expected_lifetime_days',
        size: 300,
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.number,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Is Defective',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.item.is_defective === true ? 'Yes' : 'No'),
        id: 'item.is_defective',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        enableColumnFilterModes: false,
        size: 200,
      },
      {
        header: 'Usage Status',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.usage_status,
        id: 'item.usage_status',
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
      },
      {
        header: 'System',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.system?.name ?? '',
        getGroupingValue: (row) => row.system?.id ?? '',
        id: 'system.name',
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
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={'/systems/' + row.original.system?.id}
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {row.original.system?.name}
          </MuiLink>
        ),
      },
      {
        header: 'Notes',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.notes ?? '',
        id: 'item.notes',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 200,
        enableGrouping: false,
      },

      ...viewCatalogueItemProperties.map((property) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        Header: TableHeaderOverflowTip,
        id: `item.properties.${property.id}`,
        GroupedCell: TableGroupedCell,
        accessorFn: (row: TableRowData) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const propertyValue: any = findPropertyValue(
            row.item.properties,
            property.id
          );
          if (property.type === 'boolean') {
            if (typeof propertyValue === 'boolean') {
              return propertyValue ? 'Yes' : 'No';
            } else {
              return '';
            }
          } else if (property.type === 'number') {
            return typeof propertyValue === 'number' ? propertyValue : '';
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable

            return propertyValue ?? '';
          }
        },
        size: 250,
        filterVariant:
          COLUMN_FILTER_VARIANTS[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],
        filterFn:
          COLUMN_FILTER_FUNCTIONS[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],
          ...(property.mandatory ? [] : OPTIONAL_FILTER_MODE_OPTIONS),
        ],
        enableColumnFilterModes:
          (property.type as 'string' | 'boolean' | 'number' | 'null') ===
          'boolean'
            ? property.mandatory
              ? false
              : true
            : true,
        filterSelectOptions: ['Yes', 'No'],
      })),
    ];
  }, [catalogueCategory]);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { created_time: false },
      pagination: { pageSize: dense ? 5 : 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: !dense,
  });

  const table = useMaterialReactTable({
    // Data
    columns: dense
      ? [
          { ...columns[0], size: 400 },
          { ...columns[1], size: 400 },
          { ...columns[2], size: 400 },
          { ...columns[5], size: 400 },
          { ...columns[6], size: 400 },
          { ...columns[7], size: 400 },
        ]
      : columns,
    data: tableRows, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: dense ? false : true,
    enableFacetedValues: true,
    enableColumnResizing: dense ? false : true,
    enableColumnFilterModes: true,
    enableRowActions: dense ? false : true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: dense ? false : true,
    enableTopToolbar: dense ? false : true,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: dense ? false : true,
    enableGrouping: !dense,
    enablePagination: true,
    filterFns: customFilterFunctions,
    // Other settings
    columnVirtualizerOptions: dense
      ? undefined
      : {
          overscan: 4,
          estimateSize: () => 200,
        },
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    displayColumnDefOptions: dense
      ? undefined
      : {
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
    //State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: isLoading, //or showSkeletons
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableContainerProps: {
      sx: { height: dense ? '360.4px' : tableHeight },
      // @ts-expect-error: MRT Table Container props does not have data-testid
      'data-testid': 'items-table-container',
    },
    muiTableBodyCellProps: ({ column }) => {
      const disabledGroupedHeaderColumnIDs = [
        'item.asset_number',
        'item.purchase_order_number',
        'item.warranty_end_date',
        'item.delivered_date',
      ];
      return (
        // Ignore MRT rendered cells e.g. expand , spacer etc
        column.id.startsWith('mrt') ||
          // Ignore for grouped cells done manually
          ((disabledGroupedHeaderColumnIDs.some((id) => id === column.id) ||
            column.id.startsWith('item.properties')) &&
            column.getIsGrouped())
          ? {}
          : {
              component: (props: TableCellBaseProps) => {
                return (
                  <TableBodyCellOverFlowTip
                    {...({
                      ...props,
                      overFlowTipSx: {
                        width: dense ? '25vw' : undefined,
                      },
                    } as TableCellOverFlowTipProps)}
                  />
                );
              },
            }
      );
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: dense ? [5] : [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Functions
    ...onPreservedStatesChange,
    getRowId: (row) => row.item.id,
    renderCreateRowDialogContent: ({ table, row }) => {
      return (
        <>
          <ItemDialog
            open={true}
            onClose={() => {
              table.setCreatingRow(null);
            }}
            duplicate={itemDialogType === 'duplicate'}
            requestType={itemDialogType === 'edit' ? 'patch' : 'post'}
            catalogueCategory={catalogueCategory}
            catalogueItem={catalogueItem}
            type="items"
            selectedItem={
              itemDialogType === 'create'
                ? undefined
                : {
                    ...row.original.item,
                    notes:
                      itemDialogType === 'duplicate'
                        ? `${row.original.item.notes || ''}\n\nThis is a copy of the item with this Serial Number: ${row.original.item.serial_number ?? 'No serial number'}`
                        : row.original.item.notes,
                  }
            }
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
            setItemsDialogType('create');
            table.setCreatingRow(true);
          }}
        >
          Add Item
        </Button>

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
    renderRowActionMenuItems: ({ closeMenu, row, table }) => {
      return [
        <MenuItem
          key="edit"
          aria-label={`Edit item ${row.original.item.id}`}
          onClick={() => {
            setItemsDialogType('edit');
            table.setCreatingRow(row);
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
          key="duplicate"
          aria-label={`Duplicate item ${row.original.item.id}`}
          onClick={() => {
            setItemsDialogType('duplicate');
            table.setCreatingRow(row);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>,
        <MenuItem
          key="delete"
          aria-label={`Delete item ${row.original.item.id}`}
          onClick={() => {
            setDeleteItemDialogOpen(true);
            setSelectedItem(row.original.item);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, itemsData, 'Items', {
        paddingLeft: '8px',
      }),

    renderDetailPanel: dense
      ? ({ row }) => (
          <ItemsDetailsPanel
            itemData={row.original.item}
            catalogueItemIdData={catalogueItem}
          />
        )
      : undefined,
  });

  return (
    <div style={{ width: '100%' }}>
      <MaterialReactTable table={table} />
      {!dense && (
        <DeleteItemDialog
          open={deleteItemDialogOpen}
          onClose={() => setDeleteItemDialogOpen(false)}
          item={selectedItem}
          onChangeItem={setSelectedItem}
        />
      )}
    </div>
  );
}

export default ItemsTable;
