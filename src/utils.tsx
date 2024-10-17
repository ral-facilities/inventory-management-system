import {
  Link as MuiLink,
  SxProps,
  TableCell,
  Theme,
  Tooltip,
  Typography,
  type TableCellProps,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import {
  MRT_Cell,
  MRT_Column,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_FilterOption,
  MRT_Header,
  MRT_Row,
  MRT_RowData,
  MRT_TableInstance,
} from 'material-react-table';
import React from 'react';

/* Returns a name avoiding duplicates by appending _copy_n for nth copy */
export const generateUniqueName = (
  name: string,
  existingNames: string[]
): string => {
  let count = 1;
  let newName = name;

  while (existingNames.includes(newName)) {
    newName = `${name}_copy_${count}`;
    count++;
  }

  return newName;
};

/* Returns a name avoiding duplicates by appending _copy_n for nth copy using code */
export const generateUniqueNameUsingCode = (
  name: string,
  code: string,
  existingCodes: string[]
): string => {
  let count = 1;
  let newName = name;
  let newCode = code;

  while (existingCodes.includes(newCode)) {
    newName = `${name}_copy_${count}`;
    newCode = `${code}_copy_${count}`;
    count++;
  }

  return newName;
};

/* Returns whether running in development mode */
export const isRunningInDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/* Returns a calc function giving the page height excluding SciGateway related components
  (header and footer) to use for CSS e.g. giving 48px it will return the calc(page height
  - all SciGateway related heights - 48px)*/
export const getSciGatewayPageHeightCalc = (
  additionalSubtraction?: string
): string => {
  // Page height - unknown - app bar height - footer height - additional
  return `calc(100vh - 8px - 64px - 24px${
    additionalSubtraction !== undefined ? ` - (${additionalSubtraction})` : ''
  })`;
};

/* Returns a calc function giving the page height excluding the optional view tabs component
   that only appears in development */
export const getPageHeightCalc = (additionalSubtraction?: string): string => {
  // SciGateway heights - view tabs (if in development) - additional
  let newAdditional: string | undefined = undefined;

  if (isRunningInDevelopment()) newAdditional = '48px';
  if (additionalSubtraction !== undefined) {
    if (newAdditional === undefined) newAdditional = additionalSubtraction;
    else newAdditional += ' + ' + additionalSubtraction;
  }

  return getSciGatewayPageHeightCalc(newAdditional);
};

/* Trims all the string values in an object, and then returns the object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trimStringValues = (object: any): any => {
  if (typeof object !== 'object' || object === null) {
    if (typeof object === 'string') {
      return object.trim();
    } else {
      return object;
    }
  }

  for (const prop in object) {
    if (Object.prototype.hasOwnProperty.call(object, prop)) {
      if (Array.isArray(object[prop])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object[prop] = object[prop].map((element: any) =>
          trimStringValues(element)
        );
      } else if (typeof object[prop] === 'string') {
        object[prop] = object[prop].trim();
      } else if (typeof object[prop] === 'object') {
        object[prop] = trimStringValues(object[prop]);
      }
    }
  }
  return object;
};

export const formatDateTimeStrings = (
  dateTime: string,
  includeTime: boolean
): string => {
  const date = parseISO(dateTime);
  const formattedDate = includeTime
    ? format(date, 'dd MMM yyyy HH:mm')
    : format(date, 'dd MMM yyyy');

  return formattedDate;
};

const getTextContent = (
  children: React.ReactNode,
  mrtCell: boolean
): string | React.ReactNode => {
  if (mrtCell) {
    if (typeof children === 'string') {
      return children;
    } else if (React.isValidElement(children)) {
      if (children.props.children[0] && children.props.children[0].props.cell) {
        const childCell = children.props.children[0].props.cell;
        if (childCell.renderValue() instanceof Date) {
          return children;
        } else {
          if (childCell.getIsGrouped()) {
            return `${String(childCell.renderValue())} (${childCell.row.subRows?.length})`;
          } else {
            return String(childCell.renderValue());
          }
        }
      }
    }
  } else {
    if (typeof children === 'string') {
      return children;
    } else if (React.isValidElement(children)) {
      return getTextContent(children.props.children, false);
    } else if (Array.isArray(children)) {
      return children.map((child) => getTextContent(child, false)).join(' ');
    }
  }
  return '';
};

interface OverflowTipProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  disableParagraph?: boolean;
  mrtCell?: boolean;
}

export const OverflowTip: React.FC<OverflowTipProps> = ({
  children,
  sx,
  disableParagraph = false,
  mrtCell = false,
}) => {
  const [isOverflowed, setIsOverflow] = React.useState(false);

  const tooltipResizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      const tooltipTargetElement = entries[0].target;
      // Check that the element has been rendered and set the viewable
      // as false before checking to see the element has exceeded maximum width.
      if (tooltipTargetElement && entries[0].borderBoxSize.length > 0) {
        // Width of the tooltip contents including padding and borders
        // This is rounded as window.innerWidth and tooltip.scrollWidth are always integer
        const currentTargetWidth = Math.round(
          entries[0].borderBoxSize[0].inlineSize
        );
        const minWidthToFitContentOfTarget = tooltipTargetElement.scrollWidth;
        const isContentOfTargetOverflowing =
          minWidthToFitContentOfTarget > currentTargetWidth;

        setIsOverflow(isContentOfTargetOverflowing);
      }
    })
  );

  // need to use a useCallback instead of a useRef for this
  // see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const typographyRef = React.useCallback(
    (container: HTMLDivElement) => {
      if (container !== null) {
        tooltipResizeObserver.current.observe(container);
      } else if (tooltipResizeObserver.current) {
        // When element is unmounted we know container is null so time to clean up
        tooltipResizeObserver.current.disconnect();
      }
    },
    // The children prop is needed in the dependency array to
    // trigger the resize check when a table value is edited,
    // as the value could become small and not need the overflow, or the opposite
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children]
  );

  return (
    <Tooltip
      role="tooltip"
      title={getTextContent(children, mrtCell)}
      disableHoverListener={!isOverflowed}
      placement="top"
      enterTouchDelay={0}
      arrow
    >
      <Typography
        ref={typographyRef}
        component={disableParagraph ? 'div' : 'p'}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...sx,
        }}
      >
        {children}
      </Typography>
    </Tooltip>
  );
};

export interface TableCellOverFlowTipProps extends TableCellProps {
  overFlowTipSx?: SxProps<Theme>;
}
export const TableBodyCellOverFlowTip: React.FC<TableCellOverFlowTipProps> = (
  props
): JSX.Element => {
  const { overFlowTipSx, ...tableCellProps } = props;

  let isEmpty: boolean = false;

  if (React.isValidElement(tableCellProps.children)) {
    const renderValue =
      tableCellProps.children?.props.children[0]?.props.cell.renderValue();
    isEmpty =
      renderValue === '' ||
      renderValue === null ||
      renderValue === undefined ||
      (typeof renderValue === 'string' && renderValue.trim() === '');
  }
  return (
    <TableCell {...tableCellProps}>
      {!isEmpty ? (
        <OverflowTip
          disableParagraph
          mrtCell
          sx={{ fontSize: 'inherit', ...overFlowTipSx }}
        >
          {tableCellProps.children}
        </OverflowTip>
      ) : (
        tableCellProps.children
      )}
    </TableCell>
  );
};

interface MRTHeaderProps<TData extends MRT_RowData> {
  column: MRT_Column<TData, unknown>;
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const TableHeaderOverflowTip = <TData extends MRT_RowData>(
  props: MRTHeaderProps<TData>
) => {
  const { column } = props;
  return (
    <OverflowTip sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
      {column.columnDef.header}
    </OverflowTip>
  );
};

interface MRTGroupedCellProps<TData extends MRT_RowData> {
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
  cell: MRT_Cell<TData, unknown>;
  column: MRT_Column<TData, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedProperty(obj: any, path: string): any {
  return path
    .split('.')
    .reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), obj);
}

interface ModifiedMRTGroupedCellProps<TData extends MRT_RowData>
  extends MRTGroupedCellProps<TData> {
  outputType?: 'Link' | 'Date'; // default is Text
}

export const TableGroupedCell = <TData extends MRT_RowData>(
  props: ModifiedMRTGroupedCellProps<TData>
) => {
  const { row, column, outputType } = props;
  const columnID = column.id;

  const isProperties = columnID.split('.').includes('properties');

  let cellData;
  if (isProperties) {
    const [propertyID, ...trailingColumnID] = columnID.split('.').reverse();

    const propertiesColumnID = trailingColumnID.reverse().join('.');

    const properties = getNestedProperty(row.original, propertiesColumnID);

    cellData = Array.isArray(properties)
      ? properties.find((property) => property.id === propertyID).value
      : undefined;
  } else {
    cellData = getNestedProperty(row.original, columnID);
  }

  return (
    <OverflowTip
      disableParagraph
      sx={{
        fontSize: 'inherit',
        mx: 0.5,
      }}
    >
      {cellData ? (
        outputType === 'Date' ? (
          formatDateTimeStrings(cellData, false)
        ) : outputType === 'Link' ? (
          <MuiLink
            underline="hover"
            target="_blank"
            href={cellData}
            sx={{ marginRight: 0.5 }}
          >
            {cellData}
          </MuiLink>
        ) : (
          cellData
        )
      ) : (
        `No ${column.columnDef.header}`
      )}{' '}
      {`(${row.subRows?.length})`}
    </OverflowTip>
  );
};

let lastId = 0;

export function generateUniqueId(prefix: string = 'id_'): string {
  lastId++;
  return `${prefix}${lastId}`;
}

export const resetUniqueIdCounter = () => {
  lastId = 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortDataList(data: any[], sortedValue: string) {
  return data.sort((a, b) => a[sortedValue].localeCompare(b[sortedValue]));
}

export const displayTableRowCountText = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  dataName: string,
  sx?: SxProps<Theme>
) => {
  const tableRowCount = table.getFilteredRowModel().rows.length;
  const dataLength = data?.length ?? 0;
  const tableRowCountText =
    tableRowCount === dataLength
      ? `Total ${dataName}: ${dataLength}`
      : `Returned ${tableRowCount} out of ${dataLength} ${dataName}`;

  return <Typography sx={{ ...sx }}>{tableRowCountText}</Typography>;
};

export const getInitialColumnFilterFnState = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[]
): MRT_ColumnFilterFnsState => {
  const initialState = columns.reduce<MRT_ColumnFilterFnsState>(
    (result, column) => {
      if (column.id) {
        result[column.id] = column.filterFn as MRT_FilterOption;
      }
      return result;
    },
    {}
  );
  return initialState;
};

export const checkForDuplicates = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  idName: string;
  field: string;
}) => {
  const { data, idName, field } = props;
  const duplicateIds: Set<string> = new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seenValues: { [key: string]: { [key: string]: string; value: any } } =
    {};

  data.forEach((value) => {
    const currentValue = value[field];
    if (currentValue) {
      if (seenValues[currentValue]) {
        duplicateIds.add(value[idName]);
        duplicateIds.add(seenValues[currentValue][idName]);
      } else {
        seenValues[currentValue] = value;
      }
    }
  });

  return Array.from(duplicateIds);
};
