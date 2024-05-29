import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  Tooltip,
  Typography,
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
import { useItems } from '../api/items';
import { useSystemIds } from '../api/systems';
import { CatalogueCategory, CatalogueItem, Item, System } from '../app.types';
import {
  PropertyFiltersType,
  findPropertyValue,
} from '../catalogue/items/catalogueItemsTable.component';
import { usePreservedTableState } from '../common/preservedTableState.component';
import { formatDateTimeStrings, getPageHeightCalc } from '../utils';
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
  const { data: itemsData, isLoading: isLoadingItems } = useItems(
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
  const systemList: (System | undefined)[] = useSystemIds(
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
    'create' | 'save as' | 'edit'
  >('create');

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 32px');
  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    const viewCatalogueItemProperties =
      catalogueCategory?.catalogue_item_properties ?? [];
    const propertyFilters: PropertyFiltersType = {
      boolean: 'select',
      string: 'text',
      number: 'range',
      null: 'text',
    };
    return [
      {
        header: 'Serial Number',
        accessorFn: (row) => row.item.serial_number ?? 'No serial number',
        id: 'serial_number',
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
        accessorFn: (row) => new Date(row.item.modified_time),
        id: 'modified_time',
        filterVariant: 'datetime-range',
        size: 350,
        Cell: ({ row }) =>
          row.original.item.modified_time &&
          formatDateTimeStrings(row.original.item.modified_time, true),
        enableGrouping: false,
      },
      {
        header: 'Created',
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'created_time',
        filterVariant: 'datetime-range',
        size: 350,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
        enableGrouping: false,
      },
      {
        header: 'Asset Number',
        accessorFn: (row) => row.item.asset_number,
        id: 'asset_number',
        size: 250,
      },
      {
        header: 'Purchase Order Number',
        accessorFn: (row) => row.item.purchase_order_number,
        id: 'purchase_order_number',
        size: 350,
      },
      {
        header: 'Warranty End Date',
        accessorFn: (row) => new Date(row.item.warranty_end_date ?? ''),
        id: 'warranty_end_date',
        filterVariant: 'date-range',
        size: 350,
        Cell: ({ row }) => (
          <Typography
            // For ensuring space when grouping
            sx={{ marginRight: 0.5, fontSize: 'inherit' }}
          >
            {row.original.item.warranty_end_date &&
              formatDateTimeStrings(row.original.item.warranty_end_date, false)}
          </Typography>
        ),
      },
      {
        header: 'Delivered Date',
        accessorFn: (row) => new Date(row.item.delivered_date ?? ''),
        id: 'delivered_date',
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
        id: 'is_defective',
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Usage Status',
        accessorFn: (row) => row.item.usage_status,
        id: 'usage_status',
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Notes',
        accessorFn: (row) => row.item.notes ?? '',
        id: 'notes',
        size: 250,
        Cell: ({ row }) =>
          row.original.item.notes && (
            <Tooltip
              title={row.original.item.notes}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item description: ${row.original.item.notes}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
        enableGrouping: false,
      },
      {
        header: 'System',
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
      ...viewCatalogueItemProperties.map((property) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        id: `row.catalogueItem.properties.${property.id}`,
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

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { created_time: false },
      pagination: { pageSize: dense ? 5 : 15, pageIndex: 0 },
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
            type={itemDialogType}
            catalogueCategory={catalogueCategory}
            catalogueItem={catalogueItem}
            selectedItem={
              itemDialogType === 'create'
                ? undefined
                : {
                    ...row.original.item,
                    notes:
                      itemDialogType === 'save as'
                        ? `${row.original.item.notes || ''}\n\nThis is a copy of the item with this ID: ${row.original.item.id}`
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
          key="save as"
          aria-label={`Save item ${row.original.item.id} as`}
          onClick={() => {
            setItemsDialogType('save as');
            table.setCreatingRow(row);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          <ListItemText>Save as</ListItemText>
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
    renderBottomToolbarCustomActions: ({ table }) => (
      <Typography sx={{ paddingLeft: '8px' }}>
        {table.getFilteredRowModel().rows.length == itemsData?.length
          ? `Total Items: ${itemsData.length}`
          : `Returned ${table.getFilteredRowModel().rows.length} out of ${itemsData?.length} Items`}
      </Typography>
    ),

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
