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
  MRT_Row,
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
import {
  PropertyFiltersType,
  findPropertyValue,
} from '../catalogue/items/catalogueItemsTable.component';
import { usePreservedTableState } from '../common/preservedTableState.component';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
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

  const noResultsTxt =
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
    const propertyFilters: PropertyFiltersType = {
      boolean: 'autocomplete',
      string: 'text',
      number: 'range',
      null: 'text',
    };
    return [
      {
        header: 'Serial Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.serial_number ?? 'No serial number',
        id: 'item.serial_number',
        filterFn: 'fuzzy',
        columnFilterModeOptions: [
          'fuzzy',
          'contains',
          'startsWith',
          'endsWith',
          'equals',
          'notEquals',
          'betweenInclusive',
        ],
        size: 250,
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
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 350,
        Cell: ({ row }) =>
          row.original.item.modified_time &&
          formatDateTimeStrings(row.original.item.modified_time, true),
        enableGrouping: false,
      },
      {
        header: 'Created',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'item.created_time',
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 350,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
        enableGrouping: false,
      },

      {
        header: 'Asset Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.asset_number,
        id: 'item.asset_number',
        filterFn: 'fuzzy',
        columnFilterModeOptions: [
          'fuzzy',
          'contains',
          'startsWith',
          'endsWith',
          'equals',
          'notEquals',
        ],
        size: 250,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Purchase Order Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.purchase_order_number,
        id: 'item.purchase_order_number',
        filterFn: 'fuzzy',
        columnFilterModeOptions: [
          'fuzzy',
          'contains',
          'startsWith',
          'endsWith',
          'equals',
          'notEquals',
        ],
        size: 350,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Warranty End Date',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.item.warranty_end_date
            ? new Date(row.item.warranty_end_date)
            : null,
        id: 'item.warranty_end_date',
        filterVariant: 'date',
        filterFn: 'betweenInclusive',
        columnFilterModeOptions: [
          'between',
          'betweenInclusive',
          'equals',
          'notEquals',
        ],
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
          row.item.delivered_date ? new Date(row.item.delivered_date) : null,
        id: 'item.delivered_date',
        filterVariant: 'date-range',
        filterFn: 'betweenInclusive',
        columnFilterModeOptions: [
          'between',
          'betweenInclusive',
          'equals',
          'notEquals',
        ],
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
        header: 'Is Defective',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.item.is_defective === true ? 'true' : 'false',
        id: 'item.is_defective',
        filterVariant: 'checkbox',
        enableColumnFilterModes: false,
        size: 200,
        Cell: ({ row }) => (row.original.item.is_defective ? 'Yes' : 'No'),
      },
      {
        header: 'Usage Status',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.usage_status,
        id: 'item.usage_status',
        size: 200,
        enableColumnFilterModes: false,
      },
      {
        header: 'System',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.system?.name ?? '',
        getGroupingValue: (row) => row.system?.id ?? '',
        id: 'system.name',
        size: 250,
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
        filterFn: 'fuzzy',
        columnFilterModeOptions: [
          'fuzzy',
          'contains',
          'startsWith',
          'endsWith',
          'equals',
          'notEquals',
        ],
        size: 250,
        enableGrouping: false,
      },

      ...viewCatalogueItemProperties.map((property) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        Header: TableHeaderOverflowTip,
        id: `item.properties.${property.id}`,
        GroupedCell: TableGroupedCell,
        accessorFn: (row: TableRowData) => {
          if (property.type === 'boolean') {
            return (findPropertyValue(
              row.item.properties,
              property.id
            ) as boolean) === true
              ? 'Yes'
              : 'No';
          } else if (property.type === 'number') {
            return typeof findPropertyValue(
              row.item.properties,
              property.id
            ) === 'number'
              ? findPropertyValue(row.item.properties, property.id)
              : 0;
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable

            return findPropertyValue(row.item.properties, property.id);
          }
        },
        size: 250,
        filterVariant:
          propertyFilters[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],

        Cell: ({ row }: { row: MRT_Row<TableRowData> }) => {
          if (
            typeof findPropertyValue(
              row.original.item.properties,
              property.id
            ) === 'number'
          ) {
            return findPropertyValue(
              row.original.item.properties,
              property.id
            ) === 0
              ? 0
              : findPropertyValue(row.original.item.properties, property.id) !==
                  null
                ? findPropertyValue(row.original.item.properties, property.id)
                : '';
          } else if (
            typeof findPropertyValue(
              row.original.item.properties,
              property.id
            ) === 'boolean'
          ) {
            return findPropertyValue(row.original.item.properties, property.id)
              ? 'Yes'
              : 'No';
          } else {
            return findPropertyValue(row.original.item.properties, property.id);
          }
        },
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
      noRecordsToDisplay: noResultsTxt,
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
    // MUI
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
