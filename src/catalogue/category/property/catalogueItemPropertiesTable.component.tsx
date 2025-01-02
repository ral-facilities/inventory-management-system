import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TableCellBaseProps,
  TableRow,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import {
  CatalogueCategory,
  CatalogueCategoryPropertyType,
} from '../../../api/api.types';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddCatalogueCategoryWithPlacementIds,
} from '../../../app.types';
import { usePreservedTableState } from '../../../common/preservedTableState.component';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  displayTableRowCountText,
} from '../../../utils';

import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useGetUnits } from '../../../api/units';
import { RequestType } from '../../../form.schemas';
import PropertyDialog from './propertyDialog.component';

export interface PropertiesTableProps {
  requestType: RequestType;
  catalogueCategory?: CatalogueCategory;
}

export function CatalogueItemsPropertiesTable(props: PropertiesTableProps) {
  const { catalogueCategory, requestType } = props;

  const { control, clearErrors } =
    useFormContext<AddCatalogueCategoryWithPlacementIds>();
  // fields doesn't get updated when textfield as changed
  const properties = control._getFieldArray(
    'properties'
  ) as AddCatalogueCategoryPropertyWithPlacementIds[];
  const { append, remove } = useFieldArray({
    control,
    name: 'properties',
  });

  const [propertyDialogRequestType, setPropertyDialogRequestType] =
    React.useState<RequestType>('post');

  const [index, setIndex] = React.useState<number | undefined>();

  const { data: units } = useGetUnits();
  const columns = React.useMemo<
    MRT_ColumnDef<AddCatalogueCategoryPropertyWithPlacementIds>[]
  >(() => {
    return [
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.name,
        id: 'name',
        size: 220,
        enableGrouping: false,
      },
      {
        header: 'Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          (
            Object.keys(CatalogueCategoryPropertyType) as Array<
              keyof typeof CatalogueCategoryPropertyType
            >
          ).find((key) => CatalogueCategoryPropertyType[key] === row.type),
        id: 'type',
        size: 180,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Allowed values',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.allowed_values?.values.values
            .map((value) => value['value'])
            .join(', '),
        id: 'allowed_values',
        size: 300,
        enableGrouping: false,
      },
      {
        header: 'Unit',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.unit,
        id: 'unit',
        size: 180,
        Cell: ({ renderedCellValue, row }) => (
          <>
            {requestType === 'patch'
              ? renderedCellValue
              : (
                  units?.find((unit) => row.original.unit_id === unit.id) ||
                  null
                )?.value}
          </>
        ),
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Mandatory',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.mandatory === 'true' ? 'Yes' : 'No'),
        id: 'property.mandatory',
        size: 200,
        GroupedCell: TableGroupedCell,
      },
    ];
  }, [requestType, units]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { actions: false },
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: properties ?? [],
    // Features
    enableTopToolbar: true,
    enableFacetedValues: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableFullScreenToggle: false,
    enableColumnResizing: true,
    enableGrouping: true,
    enablePagination: true,
    enableMultiRowSelection: false,
    enableRowActions: true,
    // Other settings
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    //State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
    },
    // MUI
    muiTableContainerProps: {
      sx: { height: '350px', width: '1152px' },
      // @ts-expect-error: MRT Table Container props does not have data-testid
      'data-testid': 'properties-table-container',
    },

    // Localisation
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: 'No Catalogue Item Fields',
    },
    muiTableBodyRowProps: ({ row }) => {
      return {
        component: TableRow,
        'aria-label': `${row.original.name} row`,
      };
    },
    muiTableBodyCellProps: ({ column }) =>
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [5],
      shape: 'rounded',
      variant: 'outlined',
    },

    renderCreateRowDialogContent: ({ table, row }) => {
      return (
        <PropertyDialog
          open
          onClose={(removeRow) => {
            table.setCreatingRow(null);
            if (removeRow) {
              remove(index);
              clearErrors(`properties`);
            }
          }}
          type={propertyDialogRequestType}
          catalogueCategory={catalogueCategory}
          selectedProperty={row.original}
          isMigration={requestType === 'patch'}
          index={requestType === 'post' ? index : undefined}
        />
      );
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<AddIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            setPropertyDialogRequestType('post');
            table.setCreatingRow(true);
            if (requestType === 'post') {
              setIndex(properties?.length);
              append({
                cip_placement_id: crypto.randomUUID(),
                name: '',
                type: CatalogueCategoryPropertyType.Text,
                mandatory: 'false',
                unit: null,
                allowed_values: null,
              });
            }
          }}
        >
          Add Property
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
          aria-label={`Edit property ${row.original.name}`}
          onClick={() => {
            setPropertyDialogRequestType('patch');
            setIndex(row.index);
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
        ...(requestType === 'post'
          ? [
              <MenuItem
                key="delete"
                aria-label={`Delete property ${row.original.name}`}
                onClick={() => {
                  closeMenu();
                  remove(row.index);
                }}
                sx={{ m: 0 }}
              >
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>,
            ]
          : []),
      ];
    },
    // Functions
    ...onPreservedStatesChange,
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, properties, 'Properties', {
        paddingLeft: '8px',
      }),
  });
  return (
    <div style={{ width: '100%' }}>
      <MaterialReactTable table={table} />
    </div>
  );
}

export default CatalogueItemsPropertiesTable;
