import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_RowSelectionState,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItems } from '../../api/catalogueItem';
import { useManufacturerIds } from '../../api/manufacturer';
import {
  CatalogueCategory,
  CatalogueItem,
  CatalogueItemPropertyResponse,
  Manufacturer,
} from '../../app.types';
import { generateUniqueName, getPageHeightCalc } from '../../utils';
import CatalogueItemsDetailsPanel from './CatalogueItemsDetailsPanel.component';
import CatalogueItemDirectoryDialog from './catalogueItemDirectoryDialog.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';
import ObsoleteCatalogueItemDialog from './obsoleteCatalogueItemDialog.component';

export function findPropertyValue(
  properties: CatalogueItemPropertyResponse[],
  targetName: string | undefined
) {
  // Use the find method to locate the object with the target name
  const foundProperty = properties.find((prop) => prop.name === targetName);

  // Return the value of the 'name' property if the object is found, or "" otherwise
  return foundProperty ? foundProperty.value : '';
}

/* Each table row needs the catalogue item and manufacturer */
interface TableRowData {
  catalogueItem: CatalogueItem;
  manufacturer?: Manufacturer;
}

export interface CatalogueItemsTableProps {
  parentInfo: CatalogueCategory;
  dense: boolean;
  onChangeObsoleteReplacementId?: (
    obsoleteReplacementId: string | null
  ) => void;
  selectedRowState?: { [x: string]: boolean };
  // Only for dense tables with a select - should return if a given catalogue item is
  // selectable or not
  isItemSelectable?: (item: CatalogueItem) => boolean;
}
export type PropertyFiltersType = {
  boolean: 'select' | 'text' | 'range';
  string: 'select' | 'text' | 'range';
  number: 'select' | 'text' | 'range';
  null: 'select' | 'text' | 'range';
};

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const {
    parentInfo,
    dense,
    onChangeObsoleteReplacementId,
    selectedRowState,
    isItemSelectable,
  } = props;
  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 32px');

  const { data: catalogueItemsData, isLoading: isLoadingCatalogueItems } =
    useCatalogueItems(parentInfo.id);

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [obsoleteItemDialogOpen, setObsoleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueItem, setSelectedCatalogueItem] = React.useState<
    CatalogueItem | undefined
  >(undefined);

  const [moveToItemDialogOpen, setMoveToItemDialogOpen] =
    React.useState<boolean>(false);

  const [copyToItemDialogOpen, setCopyToItemDialogOpen] =
    React.useState<boolean>(false);

  const [catalogueCurrDirId, setCatalogueCurrDirId] = React.useState<
    string | null
  >(null);

  const manufacturerIdSet = new Set<string>(
    catalogueItemsData?.map(
      (catalogue_item) => catalogue_item.manufacturer_id
    ) ?? []
  );
  let isLoading = isLoadingCatalogueItems;
  const manufacturerList: (Manufacturer | undefined)[] = useManufacturerIds(
    Array.from(manufacturerIdSet.values())
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  // Once loading has finished - pair up all data for the table rows
  // If performance becomes a problem with this should remove find and fetch manufactuer
  // for each catalogue item/implement a fullDetails or something in backend
  React.useEffect(() => {
    if (!isLoading && catalogueItemsData) {
      setTableRows(
        catalogueItemsData.map((catalogueItemData) => ({
          catalogueItem: catalogueItemData,
          manufacturer: manufacturerList?.find(
            (manufacturer) =>
              manufacturer?.id === catalogueItemData.manufacturer_id
          ),
        }))
      );
    }
    // Purposefully leave out manufacturerList - this will never be the same due
    // to the reference changing so instead am relying on isLoading to have changed to
    // false and then back to true again for any refetches that occurr - only
    // alternative I can see right now requires backend changes

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogueItemsData, isLoading]);

  const catalogueCategoryNames: string[] =
    catalogueItemsData?.map((item) => item.name) || [];

  const noResultsTxt = dense
    ? 'No catalogue items found'
    : 'No results found: Try adding an item by using the Add Catalogue Item button on the top left of your screen';
  const [itemDialogType, setItemsDialogType] = React.useState<
    'create' | 'save as' | 'edit'
  >('create');
  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    const viewCatalogueItemProperties =
      parentInfo.catalogue_item_properties ?? [];
    const propertyFilters: PropertyFiltersType = {
      boolean: 'select',
      string: 'text',
      number: 'range',
      null: 'text',
    };
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.catalogueItem.name,
        size: 200,
        Cell: ({ renderedCellValue, row }) =>
          dense ? (
            <Typography
              sx={{
                color:
                  isItemSelectable === undefined ||
                  isItemSelectable(row.original.catalogueItem)
                    ? 'inherit'
                    : 'action.disabled',
              }}
            >
              {renderedCellValue}
            </Typography>
          ) : (
            <MuiLink
              underline="hover"
              component={Link}
              to={`item/${row.original.catalogueItem.id}`}
            >
              {renderedCellValue}
            </MuiLink>
          ),
      },
      {
        header: 'View Items',
        size: 200,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`item/${row.original.catalogueItem.id}/items`}
          >
            Click here
          </MuiLink>
        ),
      },
      {
        header: 'Description',
        accessorFn: (row) => row.catalogueItem.description ?? '',
        size: 250,
        Cell: ({ row }) =>
          row.original.catalogueItem.description && (
            <Tooltip
              title={row.original.catalogueItem.description}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item description: ${row.original.catalogueItem.description}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
      },
      {
        header: 'Is Obsolete',
        accessorFn: (row) =>
          row.catalogueItem.is_obsolete === true ? 'Yes' : 'No',
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Obsolete replacement link',
        accessorFn: (row) =>
          row.catalogueItem.obsolete_replacement_catalogue_item_id ?? '',
        size: 300,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) =>
          row.original.catalogueItem.obsolete_replacement_catalogue_item_id && (
            <MuiLink
              underline="hover"
              component={Link}
              to={`item/${row.original.catalogueItem.obsolete_replacement_catalogue_item_id}`}
            >
              Click here
            </MuiLink>
          ),
      },
      {
        header: 'Obsolete Reason',
        accessorFn: (row) => row.catalogueItem.obsolete_reason ?? '',
        size: 250,
        Cell: ({ row }) =>
          row.original.catalogueItem.obsolete_reason && (
            <Tooltip
              title={row.original.catalogueItem.obsolete_reason}
              placement="top"
              enterTouchDelay={0}
              arrow
              aria-label={`Catalogue item obsolete reason: ${row.original.catalogueItem.obsolete_reason}`}
            >
              <InfoOutlinedIcon />
            </Tooltip>
          ),
      },
      ...viewCatalogueItemProperties.map((property, index) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        accessorFn: (row: TableRowData) => {
          if (property.type === 'boolean') {
            return (findPropertyValue(
              row.catalogueItem.properties,
              property.name
            ) as boolean) === true
              ? 'Yes'
              : 'No';
          } else if (property.type === 'number') {
            return typeof findPropertyValue(
              row.catalogueItem.properties,
              property.name
            ) === 'number'
              ? findPropertyValue(row.catalogueItem.properties, property.name)
              : 0;
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable

            return findPropertyValue(
              row.catalogueItem.properties,
              property.name
            );
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
              row.original.catalogueItem.properties,
              property.name
            ) === 'number'
          ) {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.name
            ) === 0
              ? 0
              : findPropertyValue(
                  row.original.catalogueItem.properties,
                  property.name
                ) !== null
              ? findPropertyValue(
                  row.original.catalogueItem.properties,
                  property.name
                )
              : '';
          } else if (
            typeof findPropertyValue(
              row.original.catalogueItem.properties,
              property.name
            ) === 'boolean'
          ) {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.name
            )
              ? 'Yes'
              : 'No';
          } else {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.name
            );
          }
        },
      })),
      {
        header: 'Cost (£)',
        accessorFn: (row) => row.catalogueItem.cost_gbp,
        size: 250,
        filterVariant: 'range',
      },
      {
        header: 'Cost to Rework (£)',
        accessorFn: (row) => row.catalogueItem.cost_to_rework_gbp ?? 0,
        size: 300,
        filterVariant: 'range',
        Cell: ({ row }) => {
          // Logic to get the range slider to work with null values
          return row.original.catalogueItem.cost_to_rework_gbp === 0
            ? 0
            : row.original.catalogueItem.cost_to_rework_gbp !== null
            ? row.original.catalogueItem.cost_to_rework_gbp
            : '';
        },
      },
      {
        header: 'Time to replace (days)',
        accessorFn: (row) => row.catalogueItem.days_to_replace,
        size: 250,
        filterVariant: 'range',
      },
      {
        header: 'Days to Rework',
        accessorFn: (row) => row.catalogueItem.days_to_rework ?? 0,
        size: 250,
        filterVariant: 'range',
        Cell: ({ row }) => {
          // Logic to get the range slider to work with null values
          return row.original.catalogueItem.cost_to_rework_gbp === 0
            ? 0
            : row.original.catalogueItem.cost_to_rework_gbp !== null
            ? row.original.catalogueItem.cost_to_rework_gbp
            : '';
        },
      },
      {
        header: 'Drawing Number',
        accessorFn: (row) => row.catalogueItem.drawing_number ?? '',
        size: 250,
      },
      {
        header: 'Drawing Link',
        accessorFn: (row) => row.catalogueItem.drawing_link ?? '',
        size: 250,
      },
      {
        header: 'Item Model Number',
        accessorFn: (row) => row.catalogueItem.item_model_number ?? '',
        size: 250,
      },
      {
        header: 'Manufacturer Name',
        accessorFn: (row) => row.manufacturer?.name,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/manufacturer/${row.original.catalogueItem.manufacturer_id}`}
          >
            {row.original.manufacturer?.name}
          </MuiLink>
        ),
      },
      {
        header: 'Manufacturer URL',
        accessorFn: (row) => row.manufacturer?.url,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            target="_blank"
            href={row.original.manufacturer?.url ?? undefined}
          >
            {row.original.manufacturer?.url}
          </MuiLink>
        ),
      },
      {
        header: 'Manufacturer Address',
        accessorFn: (row) =>
          `${row.manufacturer?.address.address_line}${row.manufacturer?.address.town}${row.manufacturer?.address.county}${row.manufacturer?.address.postcode}${row.manufacturer?.address.country}`,
        Cell: ({ row }) => (
          <div style={{ display: 'inline-block' }}>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.manufacturer?.address.address_line}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.manufacturer?.address.town}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.manufacturer?.address.county}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.manufacturer?.address.postcode}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.manufacturer?.address.country}
            </Typography>
          </div>
        ),
      },
      {
        header: 'Manufacturer Telephone',
        accessorFn: (row) => row.manufacturer?.telephone,
        Cell: ({ row }) => row.original.manufacturer?.telephone,
      },
    ];
  }, [dense, isItemSelectable, parentInfo.catalogue_item_properties]);

  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    selectedRowState ?? {}
  );

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

  const handleRowSelection = React.useCallback(
    (row: MRT_Row<TableRowData>) => {
      // Ensure selectable
      if (
        isItemSelectable === undefined ||
        isItemSelectable(row.original.catalogueItem)
      ) {
        if (row.original.catalogueItem.id === Object.keys(rowSelection)[0]) {
          // Deselect
          onChangeObsoleteReplacementId && onChangeObsoleteReplacementId(null);

          setRowSelection({});
        } else {
          // Select
          onChangeObsoleteReplacementId &&
            onChangeObsoleteReplacementId(row.original.catalogueItem.id);

          setRowSelection((prev) => ({
            [row.id]: !prev[row.id],
          }));
        }
      }
    },
    [isItemSelectable, onChangeObsoleteReplacementId, rowSelection]
  );

  const table = useMaterialReactTable({
    columns: dense ? [{ ...columns[0], size: 1135 }] : columns, // If dense only show the name column
    data: tableRows ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnOrdering: dense ? false : true,
    enableFacetedValues: true,
    enableColumnResizing: dense ? false : true,
    enableRowActions: dense ? false : true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableRowSelection: true,
    enableHiding: dense ? false : true,
    enableTopToolbar: dense ? false : true,
    enableMultiRowSelection: dense ? false : true,
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
    onRowSelectionChange: setRowSelection,
    muiTableBodyRowProps: dense
      ? ({ row }) => {
          return {
            component: TableRow,
            onClick: () => handleRowSelection(row),

            selected: rowSelection[row.id],
            sx: {
              cursor:
                isItemSelectable === undefined ||
                isItemSelectable(row.original.catalogueItem)
                  ? 'pointer'
                  : 'not-allowed',
            },
            'aria-label': `${row.original.catalogueItem.name} row`,
          };
        }
      : undefined,
    muiSelectCheckboxProps: dense
      ? ({ row }) => {
          return {
            onClick: () => handleRowSelection(row),
            disabled: !(
              isItemSelectable === undefined ||
              isItemSelectable(row.original.catalogueItem)
            ),
          };
        }
      : undefined,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: dense ? 5 : 15, pageIndex: 0 },
    },
    getRowId: (row) => row.catalogueItem.id,
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
                    ...row.original.catalogueItem,
                    name:
                      itemDialogType === 'save as'
                        ? generateUniqueName(
                            row.original.catalogueItem.name,
                            catalogueCategoryNames
                          )
                        : row.original.catalogueItem.name,
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
          Add Catalogue Item
        </Button>
        {Object.keys(rowSelection).length > 0 && (
          <>
            <Button
              sx={{ mx: 0.5 }}
              variant="outlined"
              startIcon={<DriveFileMoveOutlinedIcon />}
              onClick={() => {
                setCatalogueCurrDirId(parentInfo.parent_id);
                setMoveToItemDialogOpen(true);
              }}
            >
              Move to
            </Button>
            <Button
              sx={{ mx: 0.5 }}
              variant="outlined"
              startIcon={<FolderCopyOutlinedIcon />}
              onClick={() => {
                setCatalogueCurrDirId(parentInfo.parent_id);
                setCopyToItemDialogOpen(true);
              }}
            >
              Copy to
            </Button>
          </>
        )}
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
          key={0}
          aria-label={`Edit catalogue item ${row.original.catalogueItem.name}`}
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
          key={1}
          aria-label={`Save catalogue item ${row.original.catalogueItem.name} as`}
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
          aria-label={`Delete catalogue item ${row.original.catalogueItem.name}`}
          onClick={() => {
            setDeleteItemDialogOpen(true);
            setSelectedCatalogueItem(row.original.catalogueItem);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
        <MenuItem
          key={3}
          aria-label={`Obsolete catalogue item ${row.original.catalogueItem.name}`}
          onClick={() => {
            setObsoleteItemDialogOpen(true);
            setSelectedCatalogueItem(row.original.catalogueItem);

            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <BlockIcon />
          </ListItemIcon>
          <ListItemText>Obsolete</ListItemText>
        </MenuItem>,
      ];
    },
    renderDetailPanel: dense
      ? ({ row }) => (
          <CatalogueItemsDetailsPanel
            catalogueItemIdData={row.original.catalogueItem}
            catalogueCategoryData={parentInfo}
            manufacturerData={row.original.manufacturer}
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
          <CatalogueItemDirectoryDialog
            open={moveToItemDialogOpen}
            onClose={() => setMoveToItemDialogOpen(false)}
            selectedItems={
              catalogueItemsData?.filter((catalogueItem) =>
                Object.keys(rowSelection).includes(catalogueItem.id)
              ) ?? []
            }
            onChangeSelectedItems={setRowSelection}
            catalogueCurrDirId={catalogueCurrDirId}
            onChangeCatalogueCurrDirId={setCatalogueCurrDirId}
            requestType={'moveTo'}
            parentInfo={parentInfo}
          />
          <CatalogueItemDirectoryDialog
            open={copyToItemDialogOpen}
            onClose={() => setCopyToItemDialogOpen(false)}
            selectedItems={
              catalogueItemsData?.filter((catalogueItem) =>
                Object.keys(rowSelection).includes(catalogueItem.id)
              ) ?? []
            }
            onChangeSelectedItems={setRowSelection}
            catalogueCurrDirId={catalogueCurrDirId}
            onChangeCatalogueCurrDirId={setCatalogueCurrDirId}
            requestType={'copyTo'}
            parentInfo={parentInfo}
          />
        </>
      )}
    </div>
  );
};

export default CatalogueItemsTable;
