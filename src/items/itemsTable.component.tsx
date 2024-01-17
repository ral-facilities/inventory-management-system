import React from 'react';
import {
  Box,
  Button,
  Tooltip,
  Typography,
  Link as MuiLink,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ItemDialog from './itemDialog.component';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  PropertyFiltersType,
  findPropertyValue,
} from '../catalogue/items/catalogueItemsTable.component';
import {
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from 'material-react-table';
import {
  CatalogueCategory,
  CatalogueItem,
  Item,
  UsageStatusType,
} from '../app.types';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { useItems } from '../api/item';
import ItemsDetailsPanel from './ItemsDetailsPanel.component';
import { getPageHeightCalc } from '../utils';
import DeleteItemDialog from './deleteItemDialog.component';

export interface ItemTableProps {
  catalogueCategory: CatalogueCategory;
  catalogueItem: CatalogueItem;
  dense: boolean;
}

export function ItemsTable(props: ItemTableProps) {
  const { catalogueCategory, catalogueItem, dense } = props;

  const noResultsTxt =
    'No results found: Try adding an item by using the Add Item button on the top left of your screen';
  const { data, isLoading } = useItems(undefined, catalogueItem.id);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [selectedItem, setSelectedItem] = React.useState<Item | undefined>(
    undefined
  );

  const [itemDialogType, setItemsDialogType] = React.useState<
    'create' | 'save as' | 'edit'
  >('create');

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 32px');
  const columns = React.useMemo<MRT_ColumnDef<Item>[]>(() => {
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
        header: 'ID',
        size: 250,
        accessorFn: (row) => row.id,
        Cell: ({ row }) => (
          <MuiLink underline="hover" component={Link} to={row.original.id}>
            {row.original.id}
          </MuiLink>
        ),
      },
      {
        header: 'Serial Number',
        accessorFn: (row) => row.serial_number,
        size: 250,
      },
      {
        header: 'Asset Number',
        accessorFn: (row) => row.asset_number,
        size: 250,
      },
      {
        header: 'Purchase Order Number',
        accessorFn: (row) => row.purchase_order_number,
        size: 350,
      },
      {
        header: 'Warranty End Date',
        accessorFn: (row) => row.warranty_end_date,
        size: 250,
        Cell: ({ row }) => (
          <Typography>
            {row.original.warranty_end_date &&
              new Date(row.original.warranty_end_date).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Delivered Date',
        accessorFn: (row) => row.delivered_date,
        size: 250,
        Cell: ({ row }) => (
          <Typography>
            {row.original.delivered_date &&
              new Date(row.original.delivered_date).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Is Defective',
        accessorFn: (row) => (row.is_defective === true ? 'Yes' : 'No'),
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
              row.usage_status
          );
          return status || 'Unknown';
        },
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Notes',
        accessorFn: (row) => row.notes ?? '',
        size: 250,
        Cell: ({ row }) =>
          row.original.notes && (
            <Tooltip
              title={row.original.notes}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item description: ${row.original.notes}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
      },
      ...viewCatalogueItemProperties.map((property, index) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        accessorFn: (row: Item) => {
          if (property.type === 'boolean') {
            return (findPropertyValue(
              row.properties,
              property.name
            ) as boolean) === true
              ? 'Yes'
              : 'No';
          } else if (property.type === 'number') {
            return typeof findPropertyValue(row.properties, property.name) ===
              'number'
              ? findPropertyValue(row.properties, property.name)
              : 0;
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable

            return findPropertyValue(row.properties, property.name);
          }
        },
        size: 250,
        filterVariant:
          propertyFilters[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],

        Cell: ({ row }: { row: MRT_Row<Item> }) => {
          if (
            typeof findPropertyValue(row.original.properties, property.name) ===
            'number'
          ) {
            return findPropertyValue(row.original.properties, property.name) ===
              0
              ? 0
              : findPropertyValue(row.original.properties, property.name) !==
                null
              ? findPropertyValue(row.original.properties, property.name)
              : '';
          } else if (
            typeof findPropertyValue(row.original.properties, property.name) ===
            'boolean'
          ) {
            return findPropertyValue(row.original.properties, property.name)
              ? 'Yes'
              : 'No';
          } else {
            return findPropertyValue(row.original.properties, property.name);
          }
        },
      })),
    ];
  }, [catalogueCategory]);

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

  const table = useMaterialReactTable({
    columns: dense
      ? [
          { ...columns[0], size: 400 },
          { ...columns[1], size: 400 },
          { ...columns[5], size: 400 },
          { ...columns[6], size: 400 },
          { ...columns[7], size: 400 },
        ]
      : columns,
    data: data ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
    onColumnFiltersChange: setColumnFilters,
    columnVirtualizerOptions: dense
      ? undefined
      : {
          overscan: 4,
          estimateSize: () => 200,
        },
    manualFiltering: false,
    enablePagination: true,
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: dense ? 5 : 15, pageIndex: 0 },
    },
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: { height: dense ? '360.4px' : tableHeight },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    state: {
      showProgressBars: isLoading, //or showSkeletons
      columnFilters,
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: dense ? [5] : [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
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
                    ...row.original,
                    notes:
                      itemDialogType === 'save as'
                        ? `${row.original.notes}.\nThis is a copy of the item with this ID: ${row.original.id}`
                        : row.original.notes,
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
          disabled={columnFilters.length === 0}
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
          key={1}
          aria-label={`Saveitem ${row.original.id} as`}
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
          key={2}
          aria-label={`Delete item ${row.original.id}`}
          onClick={() => {
            setDeleteItemDialogOpen(true);
            setSelectedItem(row.original);
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
    renderDetailPanel: dense
      ? ({ row }) => (
          <ItemsDetailsPanel
            itemData={row.original}
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
