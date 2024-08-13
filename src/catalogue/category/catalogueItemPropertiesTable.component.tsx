import { TableCellBaseProps, TableRow } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { CatalogueCategoryPropertyType } from '../../api/api.types';
import { AddCatalogueCategoryPropertyWithPlacementIds } from '../../app.types';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  displayTableRowCountText,
} from '../../utils';

export interface PropertiesTableProps {
  properties: AddCatalogueCategoryPropertyWithPlacementIds[];
}

export function CatalogueItemsPropertiesTable(props: PropertiesTableProps) {
  const { properties } = props;

  const columns = React.useMemo<
    MRT_ColumnDef<AddCatalogueCategoryPropertyWithPlacementIds>[]
  >(() => {
    return [
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.name,
        id: 'name',
        size: 250,
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
        size: 200,
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
        size: 200,
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
  }, []);

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
    data: properties,
    // Features
    enableTopToolbar: true,
    enableFacetedValues: true,
    enableRowActions: false,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableFullScreenToggle: false,
    enableColumnResizing: true,
    enableGrouping: true,
    enablePagination: true,
    enableMultiRowSelection: false,
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
      rowsPerPageOptions: [5, 10, 15],
      shape: 'rounded',
      variant: 'outlined',
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
