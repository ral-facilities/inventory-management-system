import {
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CatalogueCategory } from '../../app.types';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import { getPageHeightCalc } from '../../utils';
import CatalogueCard from './catalogueCard.component';

export interface CatalogueCardViewProps {
  catalogueCategoryData: CatalogueCategory[];
  onChangeOpenDeleteCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenEditCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;

  onChangeOpenSaveAsDialog: (catalogueCategory: CatalogueCategory) => void;
  handleToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  selectedCategories: CatalogueCategory[];
}

function CatalogueCardView(props: CatalogueCardViewProps) {
  const {
    catalogueCategoryData,
    onChangeOpenDeleteCategoryDialog,
    onChangeOpenEditCategoryDialog,
    onChangeOpenSaveAsDialog,
    handleToggleSelect,
    selectedCategories,
  } = props;

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 30, pageIndex: 1 },
    },
    storeInUrl: true,
    paginationOnly: true,
  });

  const startIndex =
    (preservedState.pagination.pageIndex - 1) *
    preservedState.pagination.pageSize;
  const endIndex = startIndex + preservedState.pagination.pageSize;
  const displayedCatalogueCategories = catalogueCategoryData?.slice(
    startIndex,
    endIndex
  );

  // Display total and pagination on separate lines if on a small screen
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const cardViewHeight = getPageHeightCalc('100px');
  const cardViewCardsHeight = getPageHeightCalc(
    `100px + ${smallScreen ? '128px' : '72px'}`
  );

  return (
    <Grid
      container
      flexDirection={'column'}
      height={cardViewHeight}
      maxHeight={cardViewHeight}
    >
      <Grid container item maxHeight={cardViewCardsHeight} overflow={'auto'}>
        {displayedCatalogueCategories?.map((item, index) => (
          <Grid item key={index} sm={6} md={4} width={'100%'}>
            <CatalogueCard
              {...item}
              onChangeOpenDeleteDialog={onChangeOpenDeleteCategoryDialog}
              onChangeOpenEditDialog={onChangeOpenEditCategoryDialog}
              onChangeOpenSaveAsDialog={onChangeOpenSaveAsDialog}
              onToggleSelect={handleToggleSelect}
              isSelected={selectedCategories.some(
                (selectedCategory: CatalogueCategory) =>
                  selectedCategory.id === item.id
              )}
            />
          </Grid>
        ))}
      </Grid>

      <Grid item container marginTop={'auto'} direction="row">
        <Grid item xs={12} sm="auto">
          <Typography
            sx={{ paddingTop: '20px', paddingLeft: '8px', margin: '8px' }}
          >
            {`Total Categories: ${catalogueCategoryData.length}`}
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
              {'Categories per page'}
            </Typography>
            <Select
              disableUnderline
              value={preservedState.pagination.pageSize}
              inputProps={{
                name: 'Max Results',
                labelId: 'select-max-results',
                'aria-label': 'Categories per page',
              }}
              onChange={(event) =>
                onPreservedStatesChange.onPaginationChange({
                  pageSize: +event.target.value,
                  pageIndex: 1,
                })
              }
              label={'Max Results'}
            >
              <MenuItem value={'30'}>30</MenuItem>
              <MenuItem value={'45'}>45</MenuItem>
              <MenuItem value={'60'}>60</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            variant="outlined"
            shape="rounded"
            count={Math.ceil(
              catalogueCategoryData?.length / preservedState.pagination.pageSize
            )}
            page={preservedState.pagination.pageIndex}
            onChange={(_event, value) =>
              onPreservedStatesChange.onPaginationChange((prevState) => ({
                ...prevState,
                pageIndex: value,
              }))
            }
            size="medium"
            color="secondary"
            aria-label="pagination"
            className="catalogue-categories-pagination"
            sx={{
              paddingTop: 2,
              '& > .MuiPagination-ul': {
                flexWrap: 'nowrap',
              },
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default CatalogueCardView;
