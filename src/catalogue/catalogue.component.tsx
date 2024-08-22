import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import {
  Box,
  Button,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CatalogueCategory, CatalogueCategoryProperty } from '../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategories,
  useGetCatalogueCategory,
} from '../api/catalogueCategories';
import { CatalogueItemProperty } from '../app.types';
import { generateUniqueName } from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';
import CatalogueCardView from './category/catalogueCardView.component';
import CatalogueCategoryDialog from './category/catalogueCategoryDialog.component';
import CatalogueCategoryDirectoryDialog from './category/catalogueCategoryDirectoryDialog.component';
import DeleteCatalogueCategoryDialog from './category/deleteCatalogueCategoryDialog.component';
import CatalogueItemsTable from './items/catalogueItemsTable.component';

/* Returns function that navigates to a specific catalogue category id or catalogue path (or to the root of
   all categories if given null) */
export const useNavigateToCatalogue = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newIdPath: string | null) => {
      navigate(`/catalogue${newIdPath ? `/${newIdPath}` : ''}`);
    },
    [navigate]
  );
};

/* Returns the catalogue category id from the location pathname (null when not found) */
export const useCatalogueCategoryId = (): string | null => {
  // Navigation setup
  const location = useLocation();

  return React.useMemo(() => {
    let catalogueCategoryId: string | null = location.pathname.replace(
      '/catalogue',
      ''
    );
    catalogueCategoryId =
      catalogueCategoryId === '' ? null : catalogueCategoryId.replace('/', '');
    return catalogueCategoryId;
  }, [location.pathname]);
};

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
        requestType="post"
        resetSelectedCatalogueCategory={props.resetSelectedCatalogueCategory}
      />
    </>
  );
};

const MoveCategoriesButton = (props: {
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
  parentCategoryId: string | null;
}) => {
  const [moveToCategoryDialogOpen, setMoveToCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: '4px' }}
        variant="outlined"
        startIcon={<DriveFileMoveOutlinedIcon />}
        onClick={() => setMoveToCategoryDialogOpen(true)}
      >
        Move to
      </Button>
      <CatalogueCategoryDirectoryDialog
        open={moveToCategoryDialogOpen}
        onClose={() => setMoveToCategoryDialogOpen(false)}
        selectedCategories={props.selectedCategories}
        onChangeSelectedCategories={props.onChangeSelectedCategories}
        parentCategoryId={props.parentCategoryId}
        requestType="moveTo"
      />
    </>
  );
};

const CopyCategoriesButton = (props: {
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
  parentCategoryId: string | null;
}) => {
  const [copyToCategoryDialogOpen, setCopyToCategoryDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: '4px' }}
        variant="outlined"
        startIcon={<FolderCopyOutlinedIcon />}
        onClick={() => setCopyToCategoryDialogOpen(true)}
      >
        Copy to
      </Button>
      <CatalogueCategoryDirectoryDialog
        open={copyToCategoryDialogOpen}
        onClose={() => setCopyToCategoryDialogOpen(false)}
        selectedCategories={props.selectedCategories}
        onChangeSelectedCategories={props.onChangeSelectedCategories}
        parentCategoryId={props.parentCategoryId}
        requestType="copyTo"
      />
    </>
  );
};

export function matchCatalogueItemProperties(
  form: CatalogueCategoryProperty[],
  items: CatalogueItemProperty[]
): (string | null)[] {
  const result: (string | null)[] = [];

  for (const property of form) {
    const matchingItem = items.find((item) => item.id === property.id);
    if (matchingItem) {
      // Type check and assign the value
      if (property.type === 'boolean') {
        result.push(
          typeof matchingItem.value === 'boolean'
            ? String(matchingItem.value)
            : ''
        );
      } else {
        result.push(
          matchingItem.value !== null ? String(matchingItem.value) : null
        );
      }
    } else {
      // If there is no matching item, push null
      result.push(null);
    }
  }

  return result;
}

function Catalogue() {
  // Navigation
  const catalogueCategoryId = useCatalogueCategoryId();
  const navigateToCatalogue = useNavigateToCatalogue();

  const {
    data: catalogueCategoryDetail,
    isLoading: catalogueCategoryDetailLoading,
  } = useGetCatalogueCategory(catalogueCategoryId);

  const { data: catalogueBreadcrumbs } =
    useGetCatalogueBreadcrumbs(catalogueCategoryId);

  const parentInfo = React.useMemo(
    () => catalogueCategoryDetail,
    [catalogueCategoryDetail]
  );
  const parentId = (parentInfo && parentInfo.id) || null;

  const isLeafNode = parentInfo ? parentInfo.is_leaf : false;
  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useGetCatalogueCategories(
    catalogueCategoryDetailLoading ? true : !!parentInfo && parentInfo.is_leaf,
    // String value of null for filtering root catalogue category
    !catalogueCategoryId ? 'null' : catalogueCategoryId
  );

  const catalogueCategoryNames: string[] = catalogueCategoryData
    ? catalogueCategoryData.map((item) => item.name)
    : [];

  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [duplicateCategoryDialogOpen, setDuplicateCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueCategory, setSelectedCatalogueCategory] =
    React.useState<CatalogueCategory | undefined>(undefined);

  React.useEffect(() => {
    const catalogueCategoryIds = catalogueCategoryData?.map(
      (category) => category.id
    );
    if (catalogueCategoryIds?.includes(selectedCatalogueCategory?.id ?? '')) {
      const updatedCategory = catalogueCategoryData?.find(
        (category) => category.id === selectedCatalogueCategory?.id
      );
      setSelectedCatalogueCategory(updatedCategory);
    }
  }, [catalogueCategoryData, selectedCatalogueCategory]);

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

  const onChangeOpenDuplicateDialog = (
    catalogueCategory: CatalogueCategory
  ) => {
    setDuplicateCategoryDialogOpen(true);
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

  // Clears the selected categories when the user navigates toa different page
  React.useEffect(() => {
    setSelectedCategories([]);
  }, [parentId]);

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
              onChangeNode={navigateToCatalogue}
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNavigateHome={() => navigateToCatalogue(null)}
              navigateHomeAriaLabel={'navigate to catalogue home'}
            />
            <NavigateNext
              fontSize="medium"
              sx={{ color: 'text.secondary', margin: 1 }}
            />
            <AddCategoryButton
              disabled={
                isLeafNode || (!parentInfo && catalogueCategoryId !== null)
              }
              parentId={parentId}
              type="add"
              resetSelectedCatalogueCategory={() =>
                setSelectedCatalogueCategory(undefined)
              }
            />
          </div>

          {!isLeafNode && selectedCategories.length >= 1 && (
            <Box>
              <MoveCategoriesButton
                selectedCategories={selectedCategories}
                onChangeSelectedCategories={setSelectedCategories}
                parentCategoryId={catalogueCategoryId}
              />
              <CopyCategoriesButton
                selectedCategories={selectedCategories}
                onChangeSelectedCategories={setSelectedCategories}
                parentCategoryId={catalogueCategoryId}
              />

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

      {(catalogueCategoryDataLoading || !catalogueCategoryData) &&
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
              {!parentInfo && catalogueCategoryId !== null
                ? 'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
                : 'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'}
            </Typography>
          </Box>
        )}

      {catalogueCategoryData &&
        catalogueCategoryData.length > 0 &&
        !parentInfo?.is_leaf &&
        !catalogueCategoryDetailLoading && (
          <CatalogueCardView
            catalogueCategoryData={catalogueCategoryData}
            onChangeOpenDeleteCategoryDialog={onChangeOpenDeleteCategoryDialog}
            onChangeOpenEditCategoryDialog={onChangeOpenEditCategoryDialog}
            onChangeOpenDuplicateDialog={onChangeOpenDuplicateDialog}
            handleToggleSelect={handleToggleSelect}
            selectedCategories={selectedCategories}
          />
        )}

      {parentInfo && parentInfo.is_leaf && (
        <CatalogueItemsTable parentInfo={parentInfo} dense={false} />
      )}

      <CatalogueCategoryDialog
        open={editCategoryDialogOpen}
        onClose={() => setEditCategoryDialogOpen(false)}
        parentId={parentId}
        requestType="patch"
        selectedCatalogueCategory={selectedCatalogueCategory}
        resetSelectedCatalogueCategory={() =>
          setSelectedCatalogueCategory(undefined)
        }
      />

      <CatalogueCategoryDialog
        open={duplicateCategoryDialogOpen}
        onClose={() => setDuplicateCategoryDialogOpen(false)}
        parentId={parentId}
        requestType="post"
        duplicate
        selectedCatalogueCategory={
          selectedCatalogueCategory
            ? {
                ...selectedCatalogueCategory,
                name: generateUniqueName(
                  selectedCatalogueCategory.name,
                  catalogueCategoryNames
                ),
              }
            : undefined
        }
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
    </Grid>
  );
}

export default Catalogue;
