import {
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material';
import CatalogueCard from './catalogueCard.component';
import React from 'react';
import { CatalogueCategory } from '../../app.types';
import { getPageHeightCalc } from '../../utils';

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

  const [page, setPage] = React.useState(1);
  const [paginationResults, setPaginationResults] = React.useState<number>(30);
  const startIndex = (page - 1) * paginationResults;
  const endIndex = startIndex + paginationResults;
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
      <Grid
        container
        item
        alignItems="center"
        justifyContent="right"
        xs={12}
        padding={2}
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
              }}
            >
              {'Cards per page'}
            </Typography>
            <Select
              disableUnderline
              value={paginationResults}
              inputProps={{
                name: 'Max Results',
                id: 'select-max-results',
              }}
              onChange={(event) => {
                setPaginationResults(+event.target.value);
                setPage(1);
              }}
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
      </Grid>
    </Grid>
  );
}

export default CatalogueCardView;
