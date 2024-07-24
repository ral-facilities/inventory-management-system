import {
  MRT_ColumnDef,
  MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  AddCatalogueCategoryProperty,
  CatalogueCategoryPropertyMigration,
} from '../../app.types';
import {
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  displayTableRowCountText,
  getPageHeightCalc,
} from '../../utils';
import { useGetUnits } from '../../api/units';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import React from 'react';
import { TableCellBaseProps, TableRow } from '@mui/material';

export interface PropertiesTableProps {
  properties: AddCatalogueCategoryProperty[];
  editingProperties: boolean;
  onChangeEditCatalogueItemField?: (
    catalogueItemField: CatalogueCategoryPropertyMigration
  ) => void;
  tableHeightPx: string;
}

interface TableRowData {
  property: AddCatalogueCategoryProperty;
}

export function PropertiesTable(props: PropertiesTableProps) {
  const {
    properties,
    editingProperties,
    onChangeEditCatalogueItemField,
    tableHeightPx,
  } = props;

  const { data: unitsData, isLoading: isLoadingUnits } = useGetUnits();

  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  React.useEffect(() => {
    if (!isLoadingUnits && properties) {
      setTableRows(
        properties.map((property) => ({
          property: property,
        }))
      );
    }
  }, [properties, isLoadingUnits]);

  const tableHeight = getPageHeightCalc(tableHeightPx);
  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    return [
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.property.name,
        id: 'property.name',
        size: 250,
        enableGrouping: false,
      },
      {
        header: 'Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.property.type === 'string' ? 'Text' : row.property.type,
        id: 'property.type',
        size: editingProperties ? 150 : 200,
        GroupedCell: TableGroupedCell,
      },
      {
        header: 'Allowed values',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.property.allowed_values?.values
            .map((value) => value['value'])
            .join(', ') ?? 'Any',
        id: 'property.allowed_values',
        size: 300,
        enableGrouping: false,
      },
      {
        header: 'Unit',
        Header: TableHeaderOverflowTip,
        id: 'property.unit_id',
        size: editingProperties ? 175 : 200,
        enableGrouping: false,
        Cell: ({ row }) =>
          unitsData?.find((unit) => unit.id === row.original.property.unit_id)
            ?.value,
      },
      {
        header: 'Mandatory',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.property.mandatory === true ? 'Yes' : 'No'),
        id: 'property.mandatory',
        size: 200,
        GroupedCell: TableGroupedCell,
      },
    ];
  }, [editingProperties, unitsData]);

  const handleRowSelection = React.useCallback(
    (row: MRT_Row<TableRowData>) => {
      if (onChangeEditCatalogueItemField)
        onChangeEditCatalogueItemField(row.original.property);
    },
    [onChangeEditCatalogueItemField]
  );

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { actions: false },
      pagination: {
        pageSize: tableHeightPx === '240px' ? 15 : 5,
        pageIndex: 0,
      },
    },
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: tableRows,
    // Features
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableColumnResizing: true,
    enableRowActions: false,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableTopToolbar: false,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: true,
    enableGrouping: true,
    enablePagination: true,
    enableRowSelection: editingProperties,
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
      showProgressBars: isLoadingUnits, //or showSkeletons
    },
    // MUI
    muiTableContainerProps: {
      sx: { height: tableHeight },
      // @ts-expect-error: MRT Table Container props does not have data-testid
      'data-testid': 'properties-table-container',
    },

    muiTableBodyRowProps: ({ row }) => {
      return {
        component: TableRow,
        'aria-label': `${row.original.property.name} row`,
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
    muiSelectCheckboxProps: ({ row }) => {
      return {
        onClick: () => handleRowSelection(row),
        'aria-label': `${row.index} radio button`,
      };
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions:
        tableHeightPx === '240px' ? [15, 30, 45] : [5, 10, 15],
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

export default PropertiesTable;
