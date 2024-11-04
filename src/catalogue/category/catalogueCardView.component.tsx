import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { CatalogueCategory } from '../../api/api.types';
import CardViewFooter from '../../common/cardView/cardViewFooter.component';
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
  onChangeOpenDuplicateDialog: (catalogueCategory: CatalogueCategory) => void;
  handleToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  selectedCategories: CatalogueCategory[];
}

function CatalogueCardView(props: CatalogueCardViewProps) {
  const {
    catalogueCategoryData,
    onChangeOpenDeleteCategoryDialog,
    onChangeOpenEditCategoryDialog,
    onChangeOpenDuplicateDialog,
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
              onChangeOpenDuplicateDialog={onChangeOpenDuplicateDialog}
              onToggleSelect={handleToggleSelect}
              isSelected={selectedCategories.some(
                (selectedCategory: CatalogueCategory) =>
                  selectedCategory.id === item.id
              )}
            />
          </Grid>
        ))}
      </Grid>
      <CardViewFooter
        label="Categories"
        dataLength={catalogueCategoryData.length}
        pagination={preservedState.pagination}
        onPaginationChange={onPreservedStatesChange.onPaginationChange}
        maxResultsList={[30, 45, 60]}
      />
    </Grid>
  );
}

export default CatalogueCardView;
