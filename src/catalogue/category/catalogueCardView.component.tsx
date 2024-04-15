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
        px={1}
        py={1.5}
        position={'fixed'}
        bottom={12}
        right={0}
      >
        <Grid item position={'fixed'} left={8}>
          <Typography sx={{ paddingLeft: '8px' }}>
            {`Total Categories: ${catalogueCategoryData.length}`}
          </Typography>
        </Grid>

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
              value={paginationResults}
              inputProps={{
                name: 'Max Results',
                labelId: 'select-max-results',
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
            onChange={(_event, value) => {
              setPage(value);
            }}
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
