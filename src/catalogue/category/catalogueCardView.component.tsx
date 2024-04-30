import {
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Typography,
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
  onChangeOpenEditNameCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenEditPropertiesCategoryDialog: (
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
    onChangeOpenEditNameCategoryDialog,
    onChangeOpenEditPropertiesCategoryDialog,
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

  return (
    <Grid container flexDirection={'column'}>
      <Grid
        container
        item
        xs={12}
        maxHeight={getPageHeightCalc('150px')}
        overflow={'auto'}
      >
        {displayedCatalogueCategories?.map((item, index) => (
          <Grid
            item
            key={index}
            xs={12}
            sm={6}
            md={4}
            flexDirection={'column'}
            alignContent={'center'}
          >
            <CatalogueCard
              {...item}
              onChangeOpenDeleteDialog={onChangeOpenDeleteCategoryDialog}
              onChangeOpenEditNameDialog={onChangeOpenEditNameCategoryDialog}
              onChangeOpenEditPropertiesDialog={
                onChangeOpenEditPropertiesCategoryDialog
              }
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
      <Grid
        container
        item
        alignItems="center"
        justifyContent="right"
        xs={12}
        px={1}
        py={1.5}
        position={'fixed'}
        bottom={12}
        right={0}
      >
        <Grid item>
          <FormControl
            variant="standard"
            sx={{
              margin: 1,
              minWidth: '120px',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Typography
              sx={{
                padding: 2,
                color: 'text.secondary',
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
        </Grid>

        <Grid item>
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
            sx={{ textAlign: 'center' }}
            aria-label="pagination"
            className="catalogue-categories-pagination"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default CatalogueCardView;
