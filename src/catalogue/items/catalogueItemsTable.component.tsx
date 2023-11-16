import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  ListItemIcon,
  MenuItem,
  Link as MuiLink,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItems } from '../../api/catalogueItem';
import {
  CatalogueCategory,
  CatalogueItem,
  CatalogueItemDetailsPlaceholder,
  CatalogueItemManufacturer,
} from '../../app.types';
import { matchCatalogueItemProperties } from '../catalogue.component';
import CatalogueItemsDetailsPanel from './CatalogueItemsDetailsPanel.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';

function generateUniqueName(
  existingNames: (string | undefined)[],
  originalName: string
) {
  let newName = originalName;
  let copyIndex = 1;

  while (existingNames.includes(newName)) {
    newName = `${originalName}_copy${copyIndex}`;
    copyIndex++;
  }

  return newName;
}
export interface CatalogueItemsTableProps {
  parentInfo: CatalogueCategory;
  dense: boolean;
  catalogueItemDetails?: CatalogueItemDetailsPlaceholder;
  onChangeCatalogueItemDetails?: (
    catalogueItemDetails: CatalogueItemDetailsPlaceholder
  ) => void;
  catalogueItemManufacturer?: CatalogueItemManufacturer;
  onChangeCatalogueItemManufacturer?: (
    catalogueItemManufacturer: CatalogueItemManufacturer
  ) => void;
  catalogueItemPropertyValues?: (string | number | boolean | null)[];
  onChangeCatalogueItemPropertyValues?: (
    propertyValues: (string | number | boolean | null)[]
  ) => void;
  onChangeAddItemDialogOpen?: (addItemDialogOpen: boolean) => void;
}

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const {
    parentInfo,
    catalogueItemDetails,
    onChangeCatalogueItemDetails,
    catalogueItemManufacturer,
    onChangeCatalogueItemManufacturer,
    catalogueItemPropertyValues,
    onChangeCatalogueItemPropertyValues,
    onChangeAddItemDialogOpen,
    dense,
  } = props;
  // SG header + SG footer + tabs #add breadcrumbs + Mui table V2
  const tableHeight = `calc(100vh - (64px + 36px + 50px + 172px))`;

  const { data, isLoading } = useCatalogueItems(parentInfo.id);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);
  type PropertyFiltersType = {
    boolean: 'select' | 'text' | 'range-slider';
    string: 'select' | 'text' | 'range-slider';
    number: 'select' | 'text' | 'range-slider';
    null: 'select' | 'text' | 'range-slider';
  };

  const [selectedCatalogueItem, setSelectedCatalogueItem] = React.useState<
    CatalogueItem | undefined
  >(undefined);

  const catalogueCategoryNames: (string | undefined)[] =
    data?.map((item) => item.name) || [];

  const noResultsTxt =
    'No results found: Try adding an item by using the Add Catalogue Item button in the top right of your screen';

  const columns = React.useMemo<MRT_ColumnDef<CatalogueItem>[]>(() => {
    const viewCatalogueItemProperties =
      parentInfo.catalogue_item_properties ?? [];
    const propertyFilters: PropertyFiltersType = {
      boolean: 'select',
      string: 'text',
      number: 'range-slider',
      null: 'text',
    };
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        size: 200,
        Cell: ({ renderedCellValue, row }) =>
          dense ? (
            renderedCellValue
          ) : (
            <MuiLink
              underline="hover"
              component={Link}
              to={`items/${row.original.id}`}
            >
              {renderedCellValue}
            </MuiLink>
          ),
      },
      {
        header: 'Description',
        accessorFn: (row) => row.description ?? '',
        size: 250,
        Cell: ({ row }) =>
          row.original.description && (
            <Tooltip
              title={row.original.description}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item description: ${row.original.description}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
      },
      {
        header: 'Is Obsolete',
        accessorFn: (row) => (row.is_obsolete === true ? 'Yes' : 'No'),
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Obsolete replacement link',
        accessorFn: (row) => row.obsolete_replacement_catalogue_item_id ?? '',
        size: 300,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) =>
          row.original.obsolete_replacement_catalogue_item_id && (
            <MuiLink
              underline="hover"
              component={Link}
              to={`items/${row.original.obsolete_replacement_catalogue_item_id}`}
            >
              Click here
            </MuiLink>
          ),
      },
      {
        header: 'Obsolete Reason',
        accessorFn: (row) => row.obsolete_reason ?? '',
        size: 250,
        Cell: ({ row }) =>
          row.original.obsolete_reason && (
            <Tooltip
              title={row.original.obsolete_reason}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item obsolete reason: ${row.original.obsolete_reason}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
      },
      ...viewCatalogueItemProperties.map((property, index) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        accessorFn: (row: CatalogueItem) => {
          if (property.type === 'boolean') {
            return (row.properties[index]?.value as boolean) === true
              ? 'Yes'
              : 'No';
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable
            return typeof row.properties[index]?.value === 'boolean'
              ? ''
              : row.properties[index]?.value;
          }
        },
        size: 250,
        filterVariant:
          propertyFilters[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],
      })),
      {
        header: 'Cost (GBP)',
        accessorFn: (row) => row.cost_gbp,
        size: 200,
        filterVariant: 'range-slider',
      },
      {
        header: 'Cost to Rework (GBP)',
        accessorFn: (row) => row.cost_to_rework_gbp ?? 0,
        size: 300,
        filterVariant: 'range-slider',
        Cell: ({ row }) => {
          // Logic to get the range slider to work with null values
          return row.original.cost_to_rework_gbp === 0
            ? 0
            : row.original.cost_to_rework_gbp !== null
            ? row.original.cost_to_rework_gbp
            : '';
        },
      },
      {
        header: 'Days to Replace',
        accessorFn: (row) => row.days_to_replace,
        size: 250,
        filterVariant: 'range-slider',
      },
      {
        header: 'Days to Rework',
        accessorFn: (row) => row.days_to_rework ?? 0,
        size: 250,
        filterVariant: 'range-slider',
        Cell: ({ row }) => {
          // Logic to get the range slider to work with null values
          return row.original.cost_to_rework_gbp === 0
            ? 0
            : row.original.cost_to_rework_gbp !== null
            ? row.original.cost_to_rework_gbp
            : '';
        },
      },
      {
        header: 'Drawing Number',
        accessorFn: (row) => row.drawing_number ?? '',
        size: 250,
      },
      {
        header: 'Drawing Link',
        accessorFn: (row) => row.drawing_link ?? '',
        size: 250,
      },
      {
        header: 'Item Model Number',
        accessorFn: (row) => row.item_model_number ?? '',
        size: 250,
      },

      {
        header: 'Manufacturer Name',
        accessorFn: (row) => row.manufacturer.name,
        size: 250,
        filterVariant: 'autocomplete',
        filterFn: 'equals',
      },
      {
        header: 'Manufacturer Address',
        accessorFn: (row) => row.manufacturer.address,
        size: 350,
      },
      {
        header: 'Manufacturer URL',
        accessorFn: (row) => row.manufacturer.url,
        size: 300,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            target="_blank"
            href={row.original.manufacturer.url}
          >
            {row.original.manufacturer.url}
          </MuiLink>
        ),
      },
    ];
  }, [dense, parentInfo]);

  const table = useMaterialReactTable({
    columns: dense ? [{ ...columns[0], size: 1135 }] : columns, // If dense only show the name column
    data: data ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableFacetedValues: true,
    enableRowActions: dense ? false : true,
    enableStickyHeader: true,
    enableRowSelection: dense ? true : false,
    enableFullScreenToggle: false,
    enablePagination: true,
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.name} row` };
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 25, pageIndex: 0 },
    },
    muiTableContainerProps: { sx: { height: dense ? 'inherit' : tableHeight } },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    state: {
      showProgressBars: isLoading, //or showSkeletons
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [25, 50, 100],
      shape: 'rounded',
      variant: 'outlined',
    },
    renderRowActionMenuItems: ({ closeMenu, row }) => {
      const details = {
        catalogue_category_id: row.original.catalogue_category_id,
        name: row.original.name,
        description: row.original.description,
        cost_gbp: String(row.original.cost_gbp),
        cost_to_rework_gbp: row.original.cost_to_rework_gbp
          ? String(row.original.cost_to_rework_gbp)
          : null,
        days_to_replace: String(row.original.days_to_replace),
        days_to_rework: row.original.days_to_rework
          ? String(row.original.days_to_rework)
          : null,
        drawing_number: row.original.drawing_number,
        drawing_link: row.original.drawing_link,
        item_model_number: row.original.item_model_number,
        is_obsolete: String(row.original.is_obsolete),
        obsolete_replacement_catalogue_item_id:
          row.original.obsolete_replacement_catalogue_item_id,
        obsolete_reason: row.original.obsolete_reason,
      };
      return [
        <MenuItem
          key={0}
          aria-label={`Edit ${row.original.name} catalogue item`}
          onClick={() => {
            closeMenu();
            setEditItemDialogOpen(true);
            onChangeCatalogueItemDetails &&
              onChangeCatalogueItemDetails(details);
            onChangeCatalogueItemPropertyValues &&
              onChangeCatalogueItemPropertyValues(
                matchCatalogueItemProperties(
                  parentInfo?.catalogue_item_properties ?? [],
                  row.original.properties ?? []
                )
              );
            setSelectedCatalogueItem(row.original);
            onChangeCatalogueItemManufacturer &&
              onChangeCatalogueItemManufacturer(row.original.manufacturer);
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>,
        <MenuItem
          key={1}
          aria-label={`Save as ${row.original.name} catalogue item`}
          onClick={() => {
            closeMenu();
            onChangeAddItemDialogOpen && onChangeAddItemDialogOpen(true);
            onChangeCatalogueItemDetails &&
              onChangeCatalogueItemDetails({
                ...details,
                name: generateUniqueName(
                  catalogueCategoryNames,
                  row.original.name
                ),
              });
            onChangeCatalogueItemPropertyValues &&
              onChangeCatalogueItemPropertyValues(
                matchCatalogueItemProperties(
                  parentInfo?.catalogue_item_properties ?? [],
                  row.original.properties ?? []
                )
              );
            setSelectedCatalogueItem(row.original);
            onChangeCatalogueItemManufacturer &&
              onChangeCatalogueItemManufacturer(row.original.manufacturer);
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          Save as
        </MenuItem>,
        <MenuItem
          key={2}
          aria-label={`Delete ${row.original.name} catalogue item`}
          onClick={() => {
            closeMenu();
            setDeleteItemDialogOpen(true);
            setSelectedCatalogueItem(row.original);
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>,
      ];
    },
    renderDetailPanel: dense
      ? ({ row }) => (
          <Box>
            <CatalogueItemsDetailsPanel
              catalogueItemIdData={row.original}
              catalogueCategoryData={parentInfo}
            />
          </Box>
        )
      : undefined,
  });

  return (
    <div style={{ width: '100%' }}>
      <MaterialReactTable table={table} />

      {!dense && (
        <>
          <DeleteCatalogueItemsDialog
            open={deleteItemDialogOpen}
            onClose={() => setDeleteItemDialogOpen(false)}
            catalogueItem={selectedCatalogueItem}
            onChangeCatalogueItem={setSelectedCatalogueItem}
          />
          {catalogueItemDetails &&
            onChangeCatalogueItemDetails &&
            catalogueItemManufacturer &&
            onChangeCatalogueItemManufacturer &&
            catalogueItemPropertyValues &&
            onChangeCatalogueItemPropertyValues && (
              <CatalogueItemsDialog
                open={editItemDialogOpen}
                onClose={() => setEditItemDialogOpen(false)}
                parentId={parentInfo.id}
                catalogueItemDetails={catalogueItemDetails}
                onChangeCatalogueItemDetails={onChangeCatalogueItemDetails}
                catalogueItemManufacturer={catalogueItemManufacturer}
                onChangeCatalogueItemManufacturer={
                  onChangeCatalogueItemManufacturer
                }
                catalogueItemPropertiesForm={
                  parentInfo?.catalogue_item_properties ?? []
                }
                propertyValues={catalogueItemPropertyValues}
                onChangePropertyValues={onChangeCatalogueItemPropertyValues}
                selectedCatalogueItem={selectedCatalogueItem}
                type="edit"
              />
            )}
        </>
      )}
    </div>
  );
};

export default CatalogueItemsTable;
