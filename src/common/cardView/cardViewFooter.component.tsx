import {
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material';
import { MRT_PaginationState } from 'material-react-table';
import { Updater } from '../preservedTableState.component';

export interface CardViewFooterProps {
  label: string;
  dataLength: number;
  onPaginationChange: (updaterOrValue: Updater<MRT_PaginationState>) => void;
  pagination: MRT_PaginationState;
  maxResultsList: number[];
}

const CardViewFooter = (props: CardViewFooterProps) => {
  const { dataLength, label, onPaginationChange, pagination, maxResultsList } =
    props;

  return (
    <Grid item container marginTop={'auto'} direction="row">
      <Grid item xs={12} sm="auto">
        <Typography
          sx={{ paddingTop: '20px', paddingLeft: '8px', margin: '8px' }}
        >
          {`Total ${label}: ${dataLength}`}
        </Typography>
      </Grid>

      <Grid
        item
        flexWrap="nowrap"
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        sm
      >
        <FormControl
          variant="standard"
          sx={{
            paddingTop: '16px',
            margin: 1,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Typography
            sx={{
              paddingX: 1,
              paddingTop: 0.5,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {`${label} per page`}
          </Typography>
          <Select
            disableUnderline
            value={pagination.pageSize}
            inputProps={{
              name: 'Max Results',
              labelId: 'select-max-results',
              'aria-label': `${label} per page`,
            }}
            onChange={(event) =>
              onPaginationChange({
                pageSize: +event.target.value,
                pageIndex: 1,
              })
            }
            label={'Max Results'}
          >
            {maxResultsList.map((maxResult) => (
              <MenuItem key={`max-result-${maxResult}`} value={`${maxResult}`}>
                {maxResult}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Pagination
          variant="outlined"
          shape="rounded"
          count={Math.ceil(dataLength / pagination.pageSize)}
          page={pagination.pageIndex}
          onChange={(_event, value) =>
            onPaginationChange((prevState) => ({
              ...prevState,
              pageIndex: value,
            }))
          }
          size="medium"
          color="secondary"
          aria-label="pagination"
          sx={{
            paddingTop: 2,
            '& > .MuiPagination-ul': {
              flexWrap: 'nowrap',
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default CardViewFooter;
