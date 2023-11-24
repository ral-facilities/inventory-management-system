import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import BlockIcon from '@mui/icons-material/Block';
import {
  Button,
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
  type MRT_RowSelectionState,
  MRT_Row,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItems } from '../../api/catalogueItem';
import {
  CatalogueCategory,
  CatalogueItem,
  CatalogueItemPropertyResponse,
} from '../../app.types';
import CatalogueItemsDetailsPanel from './CatalogueItemsDetailsPanel.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';
import ObsoleteCatalogueItemDialog from './obsoleteCatalogueItemDialog.component';

function findPropertyValue(
  properties: CatalogueItemPropertyResponse[],
  targetName: string | undefined
) {
  // Use the find method to locate the object with the target name
  const foundProperty = properties.find((prop) => prop.name === targetName);

  // Return the value of the 'name' property if the object is found, or "" otherwise
  return foundProperty ? foundProperty.value : '';
}

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
  onChangeObsoleteReplacementId?: (
    obsoleteReplacementId: string | null
  ) => void;
  selectedRowState?: { [x: string]: boolean };
}

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const { parentInfo, dense, onChangeObsoleteReplacementId, selectedRowState } =
    props;
  // SG header + SG footer + tabs #add breadcrumbs + Mui table V2
  const tableHeight = `calc(100vh - (64px + 36px + 50px + 125px))`;

  const { data, isLoading } = useCatalogueItems(parentInfo.id);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [obsoleteItemDialogOpen, setObsoleteItemDialogOpen] =
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
    'No results found: Try adding an item by using the Add Catalogue Item button on the top left of your screen';
  const [itemDialogType, setItemsDialogType] = React.useState<
    'create' | 'save as' | 'edit'
  >('create');
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

        Cell: ({ row }: { row: MRT_Row<CatalogueItem> }) => {
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
          } else
            return findPropertyValue(row.original.properties, property.name);
        },
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
        header: 'Time to replace (days)',
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

  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    selectedRowState ?? {}
  );

  const table = useMaterialReactTable({
    columns: dense ? [{ ...columns[0], size: 1135 }] : columns, // If dense only show the name column
    data: data ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnOrdering: dense ? false : true,
    enableFacetedValues: true,
    enableRowActions: dense ? false : true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableRowSelection: dense ? true : false,
    enableHiding: dense ? false : true,
    enableTopToolbar: dense ? false : true,
    enableMultiRowSelection: false,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: true,
    columnVirtualizerOptions: {
      overscan: 4,
      estimateSize: () => 200,
    },
    enablePagination: true,
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    onRowSelectionChange: (value) => {
      setRowSelection(value);
    },

    muiTableBodyRowProps: dense
      ? ({ row }) => {
          return {
            component: TableRow,
            onClick: () =>
              setRowSelection((prev) => ({
                [row.id]: !prev[row.id],
              })),

            selected: rowSelection[row.id],
            sx: { cursor: 'pointer' },
            'aria-label': `${row.original.name} row`,
          };
        }
      : undefined,
    muiSelectCheckboxProps: dense
      ? ({ row }) => {
          return {
            onClick: () => {
              onChangeObsoleteReplacementId &&
                onChangeObsoleteReplacementId(row.original.id);

              if (row.original.id === Object.keys(rowSelection)[0]) {
                onChangeObsoleteReplacementId &&
                  onChangeObsoleteReplacementId(null);
                setRowSelection({});
              }
            },
          };
        }
      : undefined,
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
      rowSelection,
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
          <CatalogueItemsDialog
            open={true}
            onClose={() => {
              table.setCreatingRow(null);
            }}
            parentInfo={parentInfo}
            type={itemDialogType}
            selectedCatalogueItem={
              itemDialogType === 'create'
                ? undefined
                : {
                    ...row.original,
                    name:
                      itemDialogType === 'save as'
                        ? generateUniqueName(
                            catalogueCategoryNames,
                            row.original.name
                          )
                        : row.original.name,
                  }
            }
          />
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="outlined"
        onClick={() => {
          setItemsDialogType('create');
          table.setCreatingRow(true);
        }}
      >
        Add Catalogue Item
      </Button>
    ),
    renderRowActionMenuItems: ({ closeMenu, row, table }) => {
      return [
        <MenuItem
          key={0}
          aria-label={`Edit ${row.original.name} catalogue item`}
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
          Edit
        </MenuItem>,
        <MenuItem
          key={1}
          aria-label={`Save as ${row.original.name} catalogue item`}
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
          Save as
        </MenuItem>,
        <MenuItem
          key={2}
          aria-label={`Delete ${row.original.name} catalogue item`}
          onClick={() => {
            setDeleteItemDialogOpen(true);
            setSelectedCatalogueItem(row.original);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <>Delete</>
        </MenuItem>,
        <MenuItem
          key={3}
          aria-label={`Obsolete ${row.original.name} catalogue item`}
          onClick={() => {
            setObsoleteItemDialogOpen(true);
            setSelectedCatalogueItem(row.original);

            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <BlockIcon />
          </ListItemIcon>
          <>Obsolete</>
        </MenuItem>,
      ];
    },
    renderDetailPanel: dense
      ? ({ row }) => (
          <CatalogueItemsDetailsPanel
            catalogueItemIdData={row.original}
            catalogueCategoryData={parentInfo}
          />
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
          <ObsoleteCatalogueItemDialog
            open={obsoleteItemDialogOpen}
            onClose={() => setObsoleteItemDialogOpen(false)}
            catalogueItem={selectedCatalogueItem}
          />
        </>
      )}
    </div>
  );
};

export default CatalogueItemsTable;
