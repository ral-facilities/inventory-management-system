import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  TableCellBaseProps,
  TableRow,
  Typography,
} from '@mui/material';
import {
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueItem,
  Manufacturer,
  Property,
} from '../../api/api.types';
import { useGetCatalogueItems } from '../../api/catalogueItems';
import { useGetManufacturerIds } from '../../api/manufacturers';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  displayTableRowCountText,
  formatDateTimeStrings,
  generateUniqueName,
  getPageHeightCalc,
} from '../../utils';
import CatalogueItemDirectoryDialog from './catalogueItemDirectoryDialog.component';
import CatalogueItemsDetailsPanel from './catalogueItemsDetailsPanel.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';
import ObsoleteCatalogueItemDialog from './obsoleteCatalogueItemDialog.component';

const MoveCatalogueItemsButton = (props: {
  selectedItems: CatalogueItem[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentCategoryId: string | null;
  parentInfo: CatalogueCategory;
}) => {
  const [moveCatalogueItemsDialogOpen, setMoveCatalogueItemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 0.5 }}
        variant="outlined"
        startIcon={<DriveFileMoveOutlinedIcon />}
        onClick={() => setMoveCatalogueItemsDialogOpen(true)}
      >
        Move to
      </Button>
      <CatalogueItemDirectoryDialog
        open={moveCatalogueItemsDialogOpen}
        onClose={() => setMoveCatalogueItemsDialogOpen(false)}
        selectedItems={props.selectedItems}
        onChangeSelectedItems={props.onChangeSelectedItems}
        parentCategoryId={props.parentCategoryId}
        requestType={'moveTo'}
        parentInfo={props.parentInfo}
      />
    </>
  );
};

const CopyCatalogueItemsButton = (props: {
  selectedItems: CatalogueItem[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentCategoryId: string | null;
  parentInfo: CatalogueCategory;
}) => {
  const [copyCatalogueItemsDialogOpen, setCopyCatalogueItemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 0.5 }}
        variant="outlined"
        startIcon={<FolderCopyOutlinedIcon />}
        onClick={() => setCopyCatalogueItemsDialogOpen(true)}
      >
        Copy to
      </Button>
      <CatalogueItemDirectoryDialog
        open={copyCatalogueItemsDialogOpen}
        onClose={() => setCopyCatalogueItemsDialogOpen(false)}
        selectedItems={props.selectedItems}
        onChangeSelectedItems={props.onChangeSelectedItems}
        parentCategoryId={props.parentCategoryId}
        requestType={'copyTo'}
        parentInfo={props.parentInfo}
      />
    </>
  );
};

export function findPropertyValue(
  properties: Property[],
  targetId: string | undefined
) {
  // Use the find method to locate the object with the target name
  const foundProperty = properties.find((prop) => prop.id === targetId);

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
  requestOrigin?: 'move to' | 'obsolete';
}

export type PropertyFiltersType = {
  boolean: 'select' | 'text' | 'range' | 'autocomplete';
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
    requestOrigin,
  } = props;
  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const { data: catalogueItemsData, isLoading: isLoadingCatalogueItems } =
    useGetCatalogueItems(parentInfo.id);

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [obsoleteItemDialogOpen, setObsoleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueItem, setSelectedCatalogueItem] = React.useState<
    CatalogueItem | undefined
  >(undefined);

  const manufacturerIdSet = new Set<string>(
    catalogueItemsData?.map(
      (catalogue_item) => catalogue_item.manufacturer_id
    ) ?? []
  );
  let isLoading = isLoadingCatalogueItems;
  const manufacturerList: (Manufacturer | undefined)[] = useGetManufacturerIds(
    Array.from(manufacturerIdSet.values())
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  // Once loading has finished - pair up all data for the table rows
  // If performance becomes a problem with this should remove find and fetch manufacturer
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
    // false and then back to true again for any re-fetches that occur - only
    // alternative I can see right now requires backend changes

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogueItemsData, isLoading]);

  const catalogueCategoryNames: string[] =
    catalogueItemsData?.map((item) => item.name) || [];

  const noResultsTxt = dense
    ? 'No catalogue items found'
    : 'No results found: Try adding an item by using the Add Catalogue Item button on the top left of your screen';
  const [itemDialogType, setItemsDialogType] = React.useState<
    'create' | 'duplicate' | 'edit'
  >('create');
  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    const viewCatalogueItemProperties = parentInfo.properties ?? [];
    const propertyFilters: PropertyFiltersType = {
      boolean: 'autocomplete',
      string: 'text',
      number: 'range',
      null: 'text',
    };
    return [
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.name,
        id: 'catalogueItem.name',
        size: 200,
        Cell: ({ renderedCellValue, row }) =>
          dense ? (
            renderedCellValue
          ) : (
            <MuiLink
              underline="hover"
              component={Link}
              to={`item/${row.original.catalogueItem.id}`}
            >
              {renderedCellValue}
            </MuiLink>
          ),
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.catalogueItem.modified_time),
        id: 'catalogueItem.modified_time',
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.catalogueItem.modified_time, true),
      },
      {
        header: 'Created',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.catalogueItem.created_time),
        id: 'catalogueItem.created_time',
        filterVariant: 'datetime-range',
        filterFn: 'betweenInclusive',
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.catalogueItem.created_time, true),
      },
      {
        header: 'View Items',
        Header: TableHeaderOverflowTip,
        size: 200,
        enableGrouping: false,
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
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.description ?? '',
        id: 'catalogueItem.description',
        size: 250,
        enableGrouping: false,
      },
      {
        header: 'Is Obsolete',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.catalogueItem.is_obsolete === true ? 'Yes' : 'No',
        id: 'catalogueItem.is_obsolete',
        size: 200,
        filterVariant: 'autocomplete',
      },
      {
        header: 'Obsolete replacement link',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.catalogueItem.obsolete_replacement_catalogue_item_id ?? '',
        id: 'catalogueItem.obsolete_replacement_catalogue_item_id',
        size: 300,
        enableSorting: false,
        enableColumnFilter: false,
        enableGrouping: false,
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
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.obsolete_reason ?? '',
        id: 'catalogueItem.obsolete_reason',
        size: 250,
        enableGrouping: false,
      },
      ...viewCatalogueItemProperties.map((property) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        Header: TableHeaderOverflowTip,
        id: `catalogueItem.properties.${property.id}`,
        GroupedCell: TableGroupedCell,
        accessorFn: (row: TableRowData) => {
          if (property.type === 'boolean') {
            return (findPropertyValue(
              row.catalogueItem.properties,
              property.id
            ) as boolean) === true
              ? 'Yes'
              : 'No';
          } else if (property.type === 'number') {
            return typeof findPropertyValue(
              row.catalogueItem.properties,
              property.id
            ) === 'number'
              ? findPropertyValue(row.catalogueItem.properties, property.id)
              : 0;
          } else {
            // if the value doesn't exist it return type "true" we need to change this
            // to '' to allow this column to be filterable

            return findPropertyValue(row.catalogueItem.properties, property.id);
          }
        },
        size: 300,
        filterVariant:
          propertyFilters[
            property.type as 'string' | 'boolean' | 'number' | 'null'
          ],

        Cell: ({ row }: { row: MRT_Row<TableRowData> }) => {
          if (
            typeof findPropertyValue(
              row.original.catalogueItem.properties,
              property.id
            ) === 'number'
          ) {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.id
            ) === 0
              ? 0
              : findPropertyValue(
                    row.original.catalogueItem.properties,
                    property.id
                  ) !== null
                ? findPropertyValue(
                    row.original.catalogueItem.properties,
                    property.id
                  )
                : '';
          } else if (
            typeof findPropertyValue(
              row.original.catalogueItem.properties,
              property.id
            ) === 'boolean'
          ) {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.id
            )
              ? 'Yes'
              : 'No';
          } else {
            return findPropertyValue(
              row.original.catalogueItem.properties,
              property.id
            );
          }
        },
      })),
      {
        header: 'Cost (£)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.cost_gbp,
        id: 'catalogueItem.cost_gbp',
        size: 250,
        filterVariant: 'range',
      },
      {
        header: 'Cost to Rework (£)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.cost_to_rework_gbp ?? 0,
        id: 'catalogueItem.cost_to_rework_gbp',
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
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Time to replace (days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.days_to_replace,
        id: 'catalogueItem.days_to_replace',
        size: 300,
        filterVariant: 'range',
      },
      {
        header: 'Days to Rework',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.days_to_rework ?? 0,
        id: 'catalogueItem.days_to_rework',
        size: 250,
        filterVariant: 'range',
        Cell: ({ row }) => {
          // Logic to get the range slider to work with null values
          return row.original.catalogueItem.days_to_rework === 0
            ? 0
            : row.original.catalogueItem.days_to_rework !== null
              ? row.original.catalogueItem.days_to_rework
              : '';
        },
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Expected Lifetime (Days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.expected_lifetime_days ?? '',
        id: 'catalogueItem.expected_lifetime_days',
        size: 300,
        filterVariant: 'range',
        Cell: ({ row }) => {
          return row.original.catalogueItem.expected_lifetime_days === 0
            ? 0
            : row.original.catalogueItem.expected_lifetime_days !== null
              ? row.original.catalogueItem.expected_lifetime_days
              : '';
        },
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Drawing Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.drawing_number ?? '',
        id: 'catalogueItem.drawing_number',
        size: 250,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Drawing Link',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.drawing_link ?? '',
        id: 'catalogueItem.drawing_link',
        size: 250,
        Cell: ({ row }) =>
          row.original.catalogueItem.drawing_link && (
            <MuiLink
              underline="hover"
              target="_blank"
              href={row.original.catalogueItem.drawing_link}
              // For ensuring space when grouping
              sx={{ marginRight: 0.5 }}
            >
              {row.original.catalogueItem.drawing_link}
            </MuiLink>
          ),
        GroupedCell: (props) =>
          TableGroupedCell({ ...props, outputType: 'Link' }),
      },
      {
        header: 'Item Model Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.item_model_number ?? '',
        id: 'catalogueItem.item_model_number',
        size: 250,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Manufacturer Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.manufacturer?.name,
        id: 'manufacturer.name',
        size: 250,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/manufacturers/${row.original.catalogueItem.manufacturer_id}`}
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {row.original.manufacturer?.name}
          </MuiLink>
        ),
      },
      {
        header: 'Manufacturer URL',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.manufacturer?.url,
        id: 'manufacturer.url',
        size: 250,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            target="_blank"
            href={row.original.manufacturer?.url ?? undefined}
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {row.original.manufacturer?.url}
          </MuiLink>
        ),
        GroupedCell: (props) =>
          TableGroupedCell({ ...props, outputType: 'Link' }),
      },
      {
        header: 'Manufacturer Address',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          `${row.manufacturer?.address.address_line}${row.manufacturer?.address.town}${row.manufacturer?.address.county}${row.manufacturer?.address.postcode}${row.manufacturer?.address.country}`,
        id: 'manufacturer.address',
        size: 300,
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
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.manufacturer?.telephone,
        id: 'manufacturer.telephone',
        size: 300,
      },
      {
        header: 'Notes',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.notes ?? '',
        id: 'catalogueItem.notes',
        size: 250,
        enableGrouping: false,
      },
    ];
  }, [dense, parentInfo.properties]);

  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    selectedRowState ?? {}
  );

  // Obtain the selected catalogue items data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedCatalogueItems =
    catalogueItemsData?.filter((catalogueItem) =>
      selectedRowIds.includes(catalogueItem.id)
    ) ?? [];

  const handleRowSelection = React.useCallback(
    (row: MRT_Row<TableRowData>) => {
      // Ensure selectable
      if (
        isItemSelectable === undefined ||
        isItemSelectable(row.original.catalogueItem)
      ) {
        if (row.original.catalogueItem.id === selectedRowIds[0]) {
          // Deselect
          if (onChangeObsoleteReplacementId)
            onChangeObsoleteReplacementId(null);

          setRowSelection({});
        } else {
          // Select
          if (onChangeObsoleteReplacementId)
            onChangeObsoleteReplacementId(row.original.catalogueItem.id);

          setRowSelection((prev) => ({
            [row.id]: !prev[row.id],
          }));
        }
      }
    },
    [isItemSelectable, onChangeObsoleteReplacementId, selectedRowIds]
  );

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { 'catalogueItem.created_time': false },
      pagination: { pageSize: dense ? 5 : 15, pageIndex: 0 },
    },
    storeInUrl: !dense,
  });

  const table = useMaterialReactTable({
    // Data
    columns: dense
      ? [
          { ...columns[0], size: undefined },
          { ...columns[1], size: undefined },
        ]
      : columns, // If dense only show the name column
    data: tableRows ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: !dense,
    enableFacetedValues: true,
    enableColumnResizing: !dense,
    enableRowActions: !dense,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableRowSelection: true,
    enableHiding: !dense,
    enableTopToolbar: true,
    enableMultiRowSelection: !dense,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: !dense,
    enableGlobalFilter: !dense,
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
    autoResetPageIndex: false,
    positionToolbarAlertBanner: 'bottom',
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
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: isLoading, //or showSkeletons
      rowSelection,
    },
    // MUI
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
      : ({ row }) => {
          return {
            component: TableRow,
            'aria-label': `${row.original.catalogueItem.name} row`,
          };
        },
    muiTableContainerProps: {
      sx: { height: dense ? '360.4px' : tableHeight },
      // @ts-expect-error: MRT Table Container props does not have data-testid
      'data-testid': 'catalogue-items-table-container',
    },
    muiTableBodyCellProps: ({ column, row }) => {
      const disabledGroupedHeaderColumnIDs = [
        'catalogueItem.name',
        'catalogueItem.cost_to_rework_gbp',
        'catalogueItem.days_to_rework',
        'catalogueItem.drawing_number',
        'catalogueItem.drawing_link',
        'catalogueItem.expected_lifetime_days',
        'catalogueItem.item_model_number',
        'manufacturer.url',
      ];
      return (
        // ignore cells that render "click here"
        column.id === 'View Items' ||
          column.id ===
            'catalogueItem.obsolete_replacement_catalogue_item_id' ||
          // Ignore MRT rendered cells e.g. expand , spacer etc
          column.id.startsWith('mrt') ||
          // Ignore for grouped cells done manually
          ((disabledGroupedHeaderColumnIDs.some((id) => id === column.id) ||
            column.id.startsWith('catalogueItem.properties')) &&
            column.getIsGrouped())
          ? {}
          : {
              component: (props: TableCellBaseProps) => {
                return (
                  <TableBodyCellOverFlowTip
                    {...({
                      ...props,
                      overFlowTipSx: {
                        // This is 5vw smaller to account for the select and expand columns.
                        width: dense ? '20vw' : undefined,
                        color:
                          isItemSelectable === undefined ||
                          isItemSelectable(row.original.catalogueItem)
                            ? 'inherit'
                            : 'text.secondary',
                      },
                    } as TableCellOverFlowTipProps)}
                  />
                );
              },
            }
      );
    },
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
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: dense ? [5] : [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    //Functions
    ...onPreservedStatesChange,
    getRowId: (row) => row.catalogueItem.id,
    onRowSelectionChange: setRowSelection,
    renderCreateRowDialogContent: ({ table, row }) => {
      return (
        <>
          <CatalogueItemsDialog
            open={true}
            onClose={() => {
              table.setCreatingRow(null);
            }}
            parentInfo={parentInfo}
            duplicate={itemDialogType === 'duplicate'}
            requestType={itemDialogType === 'edit' ? 'patch' : 'post'}
            selectedCatalogueItem={
              itemDialogType === 'create'
                ? undefined
                : {
                    ...row.original.catalogueItem,
                    name:
                      itemDialogType === 'duplicate'
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
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, catalogueItemsData, 'Catalogue Items', {
        paddingLeft: '8px',
      }),

    renderTopToolbarCustomActions: ({ table }) =>
      dense && requestOrigin === 'move to' ? undefined : (
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
          {
            // Don't show for the move to and obsolete dialogues
            requestOrigin === undefined && (
              <>
                {selectedRowIds.length > 0 && (
                  <>
                    <MoveCatalogueItemsButton
                      selectedItems={selectedCatalogueItems}
                      onChangeSelectedItems={setRowSelection}
                      parentCategoryId={parentInfo.id}
                      parentInfo={parentInfo}
                    />
                    <CopyCatalogueItemsButton
                      selectedItems={selectedCatalogueItems}
                      onChangeSelectedItems={setRowSelection}
                      parentCategoryId={parentInfo.id}
                      parentInfo={parentInfo}
                    />
                  </>
                )}
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
              </>
            )
          }
        </Box>
      ),
    renderRowActionMenuItems: ({ closeMenu, row, table }) => {
      return [
        <MenuItem
          key="edit"
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
          key="duplicate"
          aria-label={`Duplicate catalogue item ${row.original.catalogueItem.name}`}
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
          key="obsolete"
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
            parentInfo={parentInfo}
          />
        </>
      )}
    </div>
  );
};

export default CatalogueItemsTable;
