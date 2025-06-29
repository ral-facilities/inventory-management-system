import { Table, TableHead, TableRow, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  MRT_Header,
  MRT_RowData,
  MRT_TableHeadCell,
  MRT_TableInstance,
} from 'material-react-table';

export interface CardViewFiltersProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

const CardViewFilters = <TData extends MRT_RowData>(
  props: CardViewFiltersProps<TData>
) => {
  const { table } = props;

  const {
    options: {
      mrtTheme: { baseBackgroundColor },
    },
  } = table;

  const theme = useTheme();
  return (
    <Grid
      component={Table}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: baseBackgroundColor,
      }}
      container
    >
      <Grid component={TableHead} container>
        {table.getHeaderGroups().map((headerGroup) => (
          <Grid component={TableRow} key={headerGroup.id} container>
            {headerGroup.headers.map(
              (headerOrVirtualHeader, staticColumnIndex) => {
                const header = headerOrVirtualHeader as MRT_Header<TData>;

                return (
                  header &&
                  !header.id.includes('mrt') && (
                    <MRT_TableHeadCell
                      header={header}
                      key={header.id}
                      staticColumnIndex={staticColumnIndex}
                      table={table}
                      sx={{
                        flex: '1 1 100%',
                        [theme.breakpoints.up('xs')]: {
                          flex: '1 1 100%',
                        },
                        [theme.breakpoints.up('sm')]: {
                          flex: '1 1 50%',
                        },
                        [theme.breakpoints.up('md')]: {
                          flex: '1 1 33.33%',
                        },
                        [theme.breakpoints.up('lg')]: {
                          flex: '1 1 25%',
                        },
                        [theme.breakpoints.up('xl')]: {
                          flex: '1 1 20%',
                        },
                      }}
                    />
                  )
                );
              }
            )}
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default CardViewFilters;
