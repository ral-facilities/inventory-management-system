import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  Pagination,
  Select,
  Typography,
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategories,
  useCatalogueCategory,
} from '../api/catalogueCategory';
import {
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItemProperty,
} from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';
import CatalogueCard from './category/catalogueCard.component';
import CatalogueCategoryDialog from './category/catalogueCategoryDialog.component';
import CatalogueCategoryDirectoryDialog from './category/catalogueCategoryDirectoryDialog.component';
import DeleteCatalogueCategoryDialog from './category/deleteCatalogueCategoryDialog.component';
import CatalogueItemsTable from './items/catalogueItemsTable.component';

export interface AddCatalogueButtonProps {
  disabled: boolean;
  parentId: string | null;
  type: 'add' | 'edit';
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

const AddCategoryButton = (props: AddCatalogueButtonProps) => {
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <IconButton
        sx={{ mx: 1, my: 2 }}
        onClick={() => setAddCategoryDialogOpen(true)}
        disabled={props.disabled}
        aria-label="add catalogue category"
      >
        <AddIcon />
      </IconButton>
      <CatalogueCategoryDialog
        open={addCategoryDialogOpen}
        onClose={() => setAddCategoryDialogOpen(false)}
        parentId={props.parentId}
        type="add"
        resetSelectedCatalogueCategory={props.resetSelectedCatalogueCategory}
      />
    </>
  );
};

export function matchCatalogueItemProperties(
  form: CatalogueCategoryFormData[],
  items: CatalogueItemProperty[]
): (string | number | boolean | null)[] {
  const result: (string | number | boolean | null)[] = [];

  for (const property of form) {
    const matchingItem = items.find((item) => item.name === property.name);
    if (matchingItem) {
      // Type check and assign the value
      if (property.type === 'number') {
        result.push(matchingItem.value ? Number(matchingItem.value) : null);
      } else if (property.type === 'boolean') {
        result.push(
          typeof matchingItem.value === 'boolean'
            ? String(Boolean(matchingItem.value))
            : ''
        );
      } else {
        result.push(matchingItem.value ? String(matchingItem.value) : null);
      }
    } else {
      // If there is no matching item, push null
      result.push(null);
    }
  }

  return result;
}

function Catalogue() {
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newId: string) => {
      navigate(`/catalogue/${newId}`);
    },
    [navigate]
  );

  const catalogueId = location.pathname.replace('/catalogue', '');

  const {
    data: catalogueCategoryDetail,
    isLoading: catalogueCategoryDetailLoading,
  } = useCatalogueCategory(catalogueId.replace('/', ''));

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueId.replace('/', '')
  );

  const parentInfo = React.useMemo(
    () => catalogueCategoryDetail,
    [catalogueCategoryDetail]
  );
  const parentId = (parentInfo && parentInfo.id) || null;

  const isLeafNode = parentInfo ? parentInfo.is_leaf : false;
  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategories(
    catalogueCategoryDetailLoading ? true : !!parentInfo && parentInfo.is_leaf,
    !catalogueId ? 'null' : catalogueId.replace('/', '')
  );

  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueCategory, setSelectedCatalogueCategory] =
    React.useState<CatalogueCategory | undefined>(undefined);

  const onChangeOpenDeleteCategoryDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setDeleteCategoryDialogOpen(true);
    setSelectedCatalogueCategory(catalogueCategory);
  };

  const onChangeOpenEditCategoryDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setEditCategoryDialogOpen(true);
    setSelectedCatalogueCategory(catalogueCategory);
  };

  const [selectedCategories, setSelectedCategories] = React.useState<
    CatalogueCategory[]
  >([]);

  const handleToggleSelect = (catalogueCategory: CatalogueCategory) => {
    if (
      selectedCategories.some(
        (category: CatalogueCategory) => category.id === catalogueCategory.id
      )
    ) {
      // If the category is already selected, remove it
      setSelectedCategories(
        selectedCategories.filter(
          (category: CatalogueCategory) => category.id !== catalogueCategory.id
        )
      );
    } else {
      // If the category is not selected, add it
      setSelectedCategories([...selectedCategories, catalogueCategory]);
    }
  };

  const [moveToCategoryDialogOpen, setMoveToCategoryDialogOpen] =
    React.useState<boolean>(false);
  const [copyToCategoryDialogOpen, setCopyToCategoryDialogOpen] =
    React.useState<boolean>(false);
  // Clears the selected categories when the user navigates toa different page
  React.useEffect(() => {
    setSelectedCategories([]);
  }, [parentId]);

  const [catalogueCurrDirId, setCatalogueCurrDirId] = React.useState<
    string | null
  >(null);

  //Pagination
  const [page, setPage] = React.useState(1);
  const [paginationResults, setPaginationResults] = React.useState<number>(30);
  const startIndex = (page - 1) * paginationResults;
  const endIndex = startIndex + paginationResults;
  const displayedCatalogueCategories = catalogueCategoryData?.slice(
    startIndex,
    endIndex
  );

  return (
    <Grid container>
      <Grid container>
        <Grid
          item
          container
          alignItems="center"
          justifyContent="space-between" // Align items and distribute space along the main axis
          sx={{
            display: 'flex',
            height: '100%',
            width: '100%',
            padding: '4px', // Add some padding for spacing
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Breadcrumbs
              onChangeNode={onChangeNode}
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNavigateHome={() => {
                navigate('/catalogue');
              }}
              navigateHomeAriaLabel={'navigate to catalogue home'}
            />
            <NavigateNext
              fontSize="medium"
              sx={{ color: 'rgba(0, 0, 0, 0.6)', mx: '4px', my: '8px' }}
            />
            <AddCategoryButton
              disabled={isLeafNode || (!parentInfo && catalogueId !== '')}
              parentId={parentId}
              type="add"
              resetSelectedCatalogueCategory={() =>
                setSelectedCatalogueCategory(undefined)
              }
            />
          </div>

          {!isLeafNode && selectedCategories.length >= 1 && (
            <Box>
              <Button
                sx={{ mx: '4px' }}
                variant="outlined"
                startIcon={<DriveFileMoveOutlinedIcon />}
                onClick={() => {
                  setCatalogueCurrDirId(parentId ?? null);
                  setMoveToCategoryDialogOpen(true);
                }}
              >
                Move to
              </Button>

              <Button
                sx={{ mx: '4px' }}
                variant="outlined"
                startIcon={<FolderCopyOutlinedIcon />}
                onClick={() => {
                  setCatalogueCurrDirId(parentId ?? null);
                  setCopyToCategoryDialogOpen(true);
                }}
              >
                Copy to
              </Button>

              <Button
                sx={{ mx: '4px' }}
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setSelectedCategories([])}
              >
                {selectedCategories.length} selected
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {catalogueCategoryDataLoading &&
        (!catalogueCategoryDetailLoading || !catalogueCategoryDetail) &&
        !parentInfo?.is_leaf && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}

      {!catalogueCategoryData?.length && //logic for no results page
        !parentInfo?.is_leaf &&
        !catalogueCategoryDetailLoading &&
        !catalogueCategoryDataLoading && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              No results found
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              {!parentInfo && catalogueId !== ''
                ? 'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
                : 'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'}
            </Typography>
          </Box>
        )}

      {catalogueCategoryData &&
        !parentInfo?.is_leaf &&
        !catalogueCategoryDetailLoading && (
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
                  count={Math.ceil(
                    catalogueCategoryData?.length / paginationResults
                  )}
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
                <FormControl
                  variant="standard"
                  sx={{ margin: 1, minWidth: '120px' }}
                >
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
                    <option>{30}</option>
                    <option>{45}</option>
                    <option>{60}</option>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}

      {parentInfo && parentInfo.is_leaf && (
        <CatalogueItemsTable parentInfo={parentInfo} dense={false} />
      )}

      <CatalogueCategoryDialog
        open={editCategoryDialogOpen}
        onClose={() => setEditCategoryDialogOpen(false)}
        parentId={parentId}
        type="edit"
        selectedCatalogueCategory={selectedCatalogueCategory}
        resetSelectedCatalogueCategory={() =>
          setSelectedCatalogueCategory(undefined)
        }
      />
      <DeleteCatalogueCategoryDialog
        open={deleteCategoryDialogOpen}
        onClose={() => setDeleteCategoryDialogOpen(false)}
        catalogueCategory={selectedCatalogueCategory}
        onChangeCatalogueCategory={setSelectedCatalogueCategory}
      />

      <CatalogueCategoryDirectoryDialog
        open={moveToCategoryDialogOpen}
        onClose={() => setMoveToCategoryDialogOpen(false)}
        selectedCategories={selectedCategories}
        onChangeSelectedCategories={setSelectedCategories}
        catalogueCurrDirId={catalogueCurrDirId}
        onChangeCatalogueCurrDirId={setCatalogueCurrDirId}
        requestType="moveTo"
      />
      <CatalogueCategoryDirectoryDialog
        open={copyToCategoryDialogOpen}
        onClose={() => setCopyToCategoryDialogOpen(false)}
        selectedCategories={selectedCategories}
        onChangeSelectedCategories={setSelectedCategories}
        catalogueCurrDirId={catalogueCurrDirId}
        onChangeCatalogueCurrDirId={setCatalogueCurrDirId}
        requestType="copyTo"
      />
    </Grid>
  );
}

export default Catalogue;
