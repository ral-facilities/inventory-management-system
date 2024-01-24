import {
  FormControl,
  Grid,
  InputLabel,
  Pagination,
  Select,
} from '@mui/material';
import CatalogueCard from './catalogueCard.component';
import React from 'react';
import { CatalogueCategory } from '../../app.types';

export interface CardViewProps {
  catalogueCategoryData: CatalogueCategory[];
  onChangeOpenDeleteCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenEditCategoryDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  handleToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  selectedCategories: CatalogueCategory[];
}

function CardView(props: CardViewProps) {
  const {
    catalogueCategoryData,
    onChangeOpenDeleteCategoryDialog,
    onChangeOpenEditCategoryDialog,
    handleToggleSelect,
    selectedCategories,
  } = props;

  const [page, setPage] = React.useState(1);
  const [paginationResults, setPaginationResults] = React.useState<number>(5);
  const startIndex = (page - 1) * paginationResults;
  const endIndex = startIndex + paginationResults;
  const displayedCatalogueCategories = catalogueCategoryData?.slice(
    startIndex,
    endIndex
  );

  return (
    <Grid container>
      <Grid
        container
        item
        xs={11}
        maxWidth={'808px'}
        maxHeight={'675px'}
        overflow={'auto'}
        padding={2}
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
              onChangeOpenEditDialog={onChangeOpenEditCategoryDialog}
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
        justifyContent="space-around"
        xs={12}
        padding={2}
        position={'fixed'}
        bottom={12}
      >
        <Grid item>
          <Pagination
            count={Math.ceil(catalogueCategoryData?.length / paginationResults)}
            page={page}
            onChange={(event, value) => {
              setPage(value);
            }}
            size="large"
            color="secondary"
            sx={{ textAlign: 'center' }}
            showFirstButton
            hidePrevButton={page === 1}
            hideNextButton={
              page >=
              Math.ceil(catalogueCategoryData?.length / paginationResults)
            }
            showLastButton
            aria-label="pagination"
            className="catalogue-categories-pagination"
          />
        </Grid>
        <Grid container item xs={12} md={1} justifyContent="flex-end">
          <FormControl variant="standard" sx={{ margin: 1, minWidth: '120px' }}>
            <InputLabel>{'Max Results'}</InputLabel>
            <Select
              native
              value={paginationResults}
              inputProps={{
                name: 'Max Results',
                id: 'select-max-results',
              }}
              onChange={(event) => {
                setPaginationResults(+event.target.value);
                setPage(1);
              }}
            >
              <option>{5}</option>
              <option>{10}</option>
              <option>{20}</option>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default CardView;
