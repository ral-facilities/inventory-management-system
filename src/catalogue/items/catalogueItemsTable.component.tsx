import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  Stack,
  TableCellBaseProps,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MRT_BottomToolbar,
  MRT_Column,
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router';
import {
  CatalogueCategory,
  CatalogueItem,
  Manufacturer,
  Property,
} from '../../api/api.types';
import { useGetCatalogueItems } from '../../api/catalogueItems';
import { useGetManufacturerIds } from '../../api/manufacturers';
import { useGetInUseDefinition } from '../../api/settings';
import { APISettingsContext } from '../../apiConfigProvider.component';
import {
  DEFAULT_ROWS_PER_PAGE_VALUE,
  FLEX_CONTAINER_PROPS,
  FLEX_TABLE_CONTAINER_PROP,
  ROWS_PER_PAGE_OPTIONS,
} from '../../common/consts';
import CriticalityTooltipIcon from '../../common/criticalityTooltipIcon.component';
import DownloadTemplateDialog from '../../common/downloadTemplateDialog';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import { SparesColumnHeaderInformationTooltip } from '../../common/sparesInformationTooltip.component';
import { useAppSelector } from '../../state/hook';
import { selectCriticality } from '../../state/slices/criticalitySlice';
import {
  COLUMN_FILTER_BOOLEAN_OPTIONS,
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  MRT_Functions_Localisation,
  OPTIONAL_FILTER_MODE_OPTIONS,
  OverflowTip,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  criticalityRowStyle,
  customFilterFunctions,
  deselectRowById,
  displayTableRowCountText,
  formatDateTimeStrings,
  generateUniqueName,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
  roundUpTenth,
} from '../../utils';
import CatalogueItemDirectoryDialog from './catalogueItemDirectoryDialog.component';
import CatalogueItemsDetailsPanel from './catalogueItemsDetailsPanel.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import CatalogueLink from './catalogueLink.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';
import ObsoleteCatalogueItemDialog from './obsoleteCatalogueItemDialog.component';

export const CriticalityHeaderInfoToolTip = () => {
  const { data } = useGetInUseDefinition();

  const systemTypes =
    data && typeof data === 'object' && 'system_types' in data
      ? (data.system_types.map((t) => t?.value).filter(Boolean) as string[])
      : [];

  const systemText =
    systemTypes.length > 0
      ? `'${systemTypes.join("', '")}'`
      : 'a system type defined as in use';

  const title = `This is determined by how an item is used across systems with the system type ${systemText} and its assessed demand.`;

  return (
    <Tooltip title={title}>
      <InfoOutlined sx={{ mr: 1 }} fontSize="small" />
    </Tooltip>
  );
};

export const NumberOfSparesRequiredHeaderInfoToolTip = () => {
  const { data } = useGetInUseDefinition();

  const systemTypes =
    data && typeof data === 'object' && 'system_types' in data
      ? (data.system_types.map((t) => t?.value).filter(Boolean) as string[])
      : [];

  const systemText =
    systemTypes.length > 0
      ? `'${systemTypes.join("', '")}'`
      : 'a system type defined as in use';

  const title = `This is determined by how an item is used across systems with the system type ${systemText} and its replacement intervals.`;

  return (
    <Tooltip title={title}>
      <InfoOutlined sx={{ mr: 1 }} fontSize="small" />
    </Tooltip>
  );
};

export const getCICriticalityLabel = (showFlagged: boolean | null) => {
  if (showFlagged === true) {
    return 'This catalogue item is critical.';
  }

  if (showFlagged === false) {
    return 'This catalogue item is not critical.';
  }

  return 'Unable to determine if this catalogue item is critical. If the expected lifetime is "None" or 0 please update this field. Otherwise wait until this is recalculated.';
};

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
        requestType="moveTo"
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
        requestType="copyTo"
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

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const {
    parentInfo,
    dense,
    onChangeObsoleteReplacementId,
    selectedRowState,
    isItemSelectable,
    requestOrigin,
  } = props;
  const contentHeight = getPageHeightCalc('80px');

  const { data: catalogueItemsData, isLoading: isLoadingCatalogueItems } =
    useGetCatalogueItems(parentInfo.id);
  const { isCriticalMode } = useAppSelector(selectCriticality);
  const apiSettings = React.useContext(APISettingsContext);
  const sparesFilterState = apiSettings?.spares?.sparesFilterState;
  const isSparesDefinitionDefined = !!apiSettings.spares;

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [obsoleteItemDialogOpen, setObsoleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [downloadTemplateDialogOpen, setDownloadTemplateDialogOpen] =
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
    return [
      ...(isSparesDefinitionDefined
        ? [
            {
              header: 'Is Critical',
              accessorFn: (row: TableRowData) =>
                row.catalogueItem.is_flagged ? 'Yes' : 'No',
              id: 'catalogueItem.is_flagged',
              filterVariant: COLUMN_FILTER_VARIANTS.boolean,
              enableColumnFilterModes: false,
              size: 180,
              filterSelectOptions: COLUMN_FILTER_BOOLEAN_OPTIONS,
              Cell: ({ row }: { row: MRT_Row<TableRowData> }) => {
                const showFlagged = row.original.catalogueItem.is_flagged;
                return (
                  <CriticalityTooltipIcon
                    showFlagged={showFlagged}
                    label={getCICriticalityLabel(showFlagged)}
                  />
                );
              },
            },
          ]
        : []),
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.name,
        id: 'catalogueItem.name',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: dense ? 5000 : 250,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <OverflowTip sx={{ fontSize: 'inherit' }}>
              {dense ? (
                renderedCellValue
              ) : (
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`${row.original.catalogueItem.id}`}
                >
                  {renderedCellValue}
                </MuiLink>
              )}
            </OverflowTip>
          );
        },

        GroupedCell: TableGroupedCell,
      },
      ...(isSparesDefinitionDefined
        ? [
            {
              header: 'Criticality',
              Header: ({
                column,
              }: {
                column: MRT_Column<TableRowData, unknown>;
              }) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CriticalityHeaderInfoToolTip />
                  <OverflowTip sx={{ font: 'inherit' }}>
                    {column.columnDef.header}
                  </OverflowTip>
                </Box>
              ),
              accessorFn: (row: TableRowData) => row.catalogueItem.criticality,
              id: 'catalogueItem.criticality',
              filterVariant: COLUMN_FILTER_VARIANTS.number,
              filterFn: COLUMN_FILTER_FUNCTIONS.number,
              columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.number,
              size: 250,
              Cell: ({ row }: { row: MRT_Row<TableRowData> }) =>
                roundUpTenth(row.original.catalogueItem.criticality),
            },
            {
              header: 'Number of spares',
              Header: ({
                column,
              }: {
                column: MRT_Column<TableRowData, unknown>;
              }) => (
                <SparesColumnHeaderInformationTooltip
                  title={column.columnDef.header}
                  sparesDefinition={apiSettings?.spares?.sparesDefinition}
                />
              ),
              TableHeaderOverflowTip,
              size: 350,
              accessorFn: (row: TableRowData) =>
                row.catalogueItem.number_of_spares,
              id: 'catalogueItem.number_of_spares',
              filterVariant: COLUMN_FILTER_VARIANTS.number,
              filterFn: COLUMN_FILTER_FUNCTIONS.number,
              columnFilterModeOptions: [
                ...COLUMN_FILTER_MODE_OPTIONS.number,
                ...OPTIONAL_FILTER_MODE_OPTIONS,
              ],
              GroupedCell: TableGroupedCell,
              Cell: ({ row }: { row: MRT_Row<TableRowData> }) => (
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`${row.original.catalogueItem.id}/items${sparesFilterState}`}
                >
                  {row.original.catalogueItem.number_of_spares}
                </MuiLink>
              ),
            },
            {
              header: 'Number of spares required',
              Header: ({
                column,
              }: {
                column: MRT_Column<TableRowData, unknown>;
              }) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NumberOfSparesRequiredHeaderInfoToolTip />
                  <OverflowTip sx={{ font: 'inherit' }}>
                    {column.columnDef.header}
                  </OverflowTip>
                </Box>
              ),
              size: 350,
              accessorFn: (row: TableRowData) =>
                row.catalogueItem.number_of_spares_required,
              id: 'catalogueItem.number_of_spares_required',
              filterVariant: COLUMN_FILTER_VARIANTS.number,
              filterFn: COLUMN_FILTER_FUNCTIONS.number,
              columnFilterModeOptions: [
                ...COLUMN_FILTER_MODE_OPTIONS.number,
                ...OPTIONAL_FILTER_MODE_OPTIONS,
              ],
              GroupedCell: TableGroupedCell,
              Cell: ({ row }: { row: MRT_Row<TableRowData> }) =>
                roundUpTenth(
                  row.original.catalogueItem.number_of_spares_required
                ),
            },
          ]
        : []),
      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.catalogueItem.modified_time),
        id: 'catalogueItem.modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
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
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
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
            to={`${row.original.catalogueItem.id}/items`}
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
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
        enableGrouping: false,
      },
      {
        header: 'Is Obsolete',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.catalogueItem.is_obsolete === true ? 'Yes' : 'No',
        id: 'catalogueItem.is_obsolete',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        filterFn: COLUMN_FILTER_FUNCTIONS.boolean,
        enableColumnFilterModes: false,
        size: 200,
        filterSelectOptions: COLUMN_FILTER_BOOLEAN_OPTIONS,
      },
      {
        header: 'Obsolete replacement link',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.catalogueItem.obsolete_replacement_catalogue_item_id ?? '',
        id: 'catalogueItem.obsolete_replacement_catalogue_item_id',
        size: 275,
        enableSorting: false,
        enableColumnFilter: false,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.catalogueItem.obsolete_replacement_catalogue_item_id && (
            <CatalogueLink
              catalogueItemId={
                row.original.catalogueItem
                  .obsolete_replacement_catalogue_item_id
              }
            >
              Click here
            </CatalogueLink>
          ),
      },
      {
        header: 'Obsolete Reason',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.obsolete_reason ?? '',
        id: 'catalogueItem.obsolete_reason',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 225,
        enableGrouping: false,
      },
      ...viewCatalogueItemProperties.map((property) => ({
        header: `${property.name} ${property.unit ? `(${property.unit})` : ''}`,
        Header: TableHeaderOverflowTip,
        id: `catalogueItem.properties.${property.id}`,
        GroupedCell: TableGroupedCell,
        accessorFn: (row: TableRowData) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const propertyValue: any = findPropertyValue(
            row.catalogueItem.properties,
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
        filterSelectOptions: COLUMN_FILTER_BOOLEAN_OPTIONS,
      })),
      {
        header: 'Cost (£)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.cost_gbp,
        id: 'catalogueItem.cost_gbp',
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.number,
        size: 250,
      },
      {
        header: 'Cost to Rework (£)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.cost_to_rework_gbp ?? '',
        id: 'catalogueItem.cost_to_rework_gbp',
        size: 250,
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.number,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Time to replace (days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.days_to_replace,
        id: 'catalogueItem.days_to_replace',
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.number,
        size: 275,
      },
      {
        header: 'Days to Rework',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.days_to_rework ?? '',
        id: 'catalogueItem.days_to_rework',
        size: 250,
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.number,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Expected Lifetime (Days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.expected_lifetime_days ?? '',
        id: 'catalogueItem.expected_lifetime_days',
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
        header: 'Item Model Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.item_model_number ?? '',
        id: 'catalogueItem.item_model_number',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Manufacturer Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.manufacturer?.name,
        id: 'manufacturer.name',
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
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
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
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
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
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 300,
      },
      {
        header: 'Notes',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem.notes ?? '',
        id: 'catalogueItem.notes',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
        enableGrouping: false,
      },
    ];
  }, [
    apiSettings?.spares?.sparesDefinition,
    dense,
    isSparesDefinitionDefined,
    parentInfo.properties,
    sparesFilterState,
  ]);

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

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: {
        'catalogueItem.created_time': false,
        'catalogueItem.is_flagged': isCriticalMode,
        'catalogueItem.criticality': isCriticalMode,
        'catalogueItem.number_of_spares_required': isCriticalMode,
      },
      pagination: { pageSize: DEFAULT_ROWS_PER_PAGE_VALUE, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: !dense,
  });

  const table = useMaterialReactTable({
    // Data
    columns: dense
      ? [
          { ...columns[0], size: undefined },
          { ...columns[1], size: undefined },
          { ...columns[5], size: undefined },
        ]
      : columns, // If dense only show the name column
    data: tableRows ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: !dense,
    enableFacetedValues: true,
    enableColumnResizing: true,
    enableRowActions: !dense,
    enableColumnFilterModes: true,
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
    enableBottomToolbar: dense,
    // Other settings
    filterFns: customFilterFunctions,
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
      ...MRT_Functions_Localisation,
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
    //MRT
    mrtTheme,
    // MUI
    muiTableBodyRowProps: dense
      ? ({ row }) => {
          const showFlagged = row.original.catalogueItem.is_flagged;
          return {
            component: TableRow,
            onClick: () => handleRowSelection(row),

            selected: rowSelection[row.id],
            sx: (theme) => ({
              cursor:
                isItemSelectable === undefined ||
                isItemSelectable(row.original.catalogueItem)
                  ? 'pointer'
                  : 'not-allowed',
              ...(isCriticalMode &&
                isSparesDefinitionDefined &&
                criticalityRowStyle({ theme, showFlagged })),
            }),
            'aria-label': `${row.original.catalogueItem.name} row`,
          };
        }
      : ({ row }) => {
          const showFlagged = row.original.catalogueItem.is_flagged;
          return {
            component: TableRow,
            'aria-label': `${row.original.catalogueItem.name} row`,
            sx: (theme) => ({
              ...(isCriticalMode &&
                isSparesDefinitionDefined &&
                criticalityRowStyle({ theme, showFlagged })),
            }),
          };
        },
    muiTablePaperProps: { sx: FLEX_CONTAINER_PROPS },
    muiTableContainerProps: () => {
      return {
        sx: FLEX_TABLE_CONTAINER_PROP,

        'data-testid': 'catalogue-items-table-container',
      };
    },

    muiTableBodyCellProps: ({ column, row }) => {
      const disabledGroupedHeaderColumnIDs = [
        'catalogueItem.name',
        'catalogueItem.cost_to_rework_gbp',
        'catalogueItem.days_to_rework',
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
      rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
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

          <Button
            startIcon={<DownloadIcon />}
            sx={{ mx: 0.5 }}
            variant="outlined"
            onClick={() => {
              setDownloadTemplateDialogOpen(true);
            }}
          >
            Download Template
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

  React.useEffect(() => {
    if (isSparesDefinitionDefined)
      table.setColumnVisibility((prev) => {
        const nextOn = isCriticalMode;
        const same =
          prev['catalogueItem.criticality'] === nextOn &&
          prev['catalogueItem.is_flagged'] === nextOn &&
          prev['catalogueItem.number_of_spares_required'] === nextOn;

        if (same) return prev;

        return {
          ...prev,
          'catalogueItem.criticality': nextOn,
          'catalogueItem.is_flagged': nextOn,
          'catalogueItem.number_of_spares_required': nextOn,
        };
      });
  }, [isCriticalMode, isSparesDefinitionDefined, table]);

  React.useEffect(() => {
    if (dense)
      table.setColumnSizing((prev) => {
        const newSizes = {
          'catalogueItem.is_flagged': 180,
          'catalogueItem.name': isCriticalMode ? 670 : 760,
          'catalogueItem.modified_time': isCriticalMode ? 480 : 570,
        };
        return { ...prev, ...newSizes };
      });
  }, [dense, table, isCriticalMode]);

  return (
    <Box sx={{ width: '100%', ...FLEX_CONTAINER_PROPS }}>
      <Stack
        sx={{
          ...FLEX_CONTAINER_PROPS,
          width: '100%',
          ...(!dense ? { height: contentHeight, flex: undefined } : { p: 1 }),
        }}
      >
        <MaterialReactTable table={table} />
        {!dense && <MRT_BottomToolbar table={table} />}
      </Stack>
      {!dense && (
        <>
          <DeleteCatalogueItemsDialog
            open={deleteItemDialogOpen}
            onClose={({ successfulDeletion }) => {
              setDeleteItemDialogOpen(false);
              if (successfulDeletion && selectedCatalogueItem) {
                deselectRowById(selectedCatalogueItem.id, table);
              }
            }}
            catalogueItem={selectedCatalogueItem}
            onChangeCatalogueItem={setSelectedCatalogueItem}
          />
          <ObsoleteCatalogueItemDialog
            open={obsoleteItemDialogOpen}
            onClose={() => setObsoleteItemDialogOpen(false)}
            catalogueItem={selectedCatalogueItem}
            parentInfo={parentInfo}
          />
          <DownloadTemplateDialog
            open={downloadTemplateDialogOpen}
            onClose={() => setDownloadTemplateDialogOpen(false)}
            collection="catalogue-items"
            id={parentInfo.id}
            name={parentInfo.name}
          />
        </>
      )}
    </Box>
  );
};

export default CatalogueItemsTable;
