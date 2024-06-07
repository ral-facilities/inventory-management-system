import {
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
  MRT_Header,
  MRT_Row,
  MRT_RowData,
  MRT_TableInstance,
} from 'material-react-table';
import React, { useRef } from 'react';

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
  isMRTCell: boolean
): string | React.ReactNode => {
  if (isMRTCell) {
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
  columnSize?: number;
  sx?: SxProps<Theme>;
  disableParagraph?: boolean;
  isMRTCell?: boolean;
}

export const OverflowTip: React.FC<OverflowTipProps> = ({
  children,
  columnSize,
  sx,
  disableParagraph = false,
  isMRTCell = false,
}) => {
  const [isOverflowed, setIsOverflow] = React.useState(false);
  const overflowElementRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (overflowElementRef.current) {
      setIsOverflow(
        overflowElementRef.current.scrollWidth >
          overflowElementRef.current.clientWidth
      );
    }
  }, [children, columnSize]);

  return (
    <Tooltip
      role="tooltip"
      title={getTextContent(children, isMRTCell)}
      disableHoverListener={!isOverflowed}
      placement="top"
      enterTouchDelay={0}
      arrow
    >
      <Typography
        ref={overflowElementRef}
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
  return (
    <TableCell {...tableCellProps}>
      <OverflowTip
        disableParagraph={true}
        isMRTCell={true}
        sx={{ fontSize: 'inherit', ...overFlowTipSx }}
      >
        {tableCellProps.children}
      </OverflowTip>
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
    <OverflowTip
      columnSize={column.getSize()}
      sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
    >
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
  emptyCellPlaceholderText: string;
  type?: 'Date';
}

export const TableGroupedCell = <TData extends MRT_RowData>(
  props: ModifiedMRTGroupedCellProps<TData>
) => {
  const { row, column, emptyCellPlaceholderText, type } = props;
  const columnID = column.id;

  const cellData = getNestedProperty(row.original, columnID);

  return (
    <OverflowTip
      disableParagraph
      sx={{
        fontSize: 'inherit',
        mx: 0.5,
      }}
    >
      {cellData
        ? type === 'Date'
          ? formatDateTimeStrings(cellData, false)
          : cellData
        : emptyCellPlaceholderText}{' '}
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
