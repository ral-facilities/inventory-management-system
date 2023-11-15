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
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
} from '../api/catalogueCategory';
import {
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItemDetailsPlaceholder,
  CatalogueItemManufacturer,
  CatalogueItemProperty,
} from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';
import CatalogueCard from './category/catalogueCard.component';
import CatalogueCategoryDialog from './category/catalogueCategoryDialog.component';
import CatalogueCategoryDirectoryDialog from './category/catalogueCategoryDirectoryDialog.component';
import DeleteCatalogueCategoryDialog from './category/deleteCatalogueCategoryDialog.component';
import CatalogueItemsDialog from './items/catalogueItemsDialog.component';
import CatalogueItemsTable from './items/catalogueItemsTable.component';

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
      navigate(`/inventory-management-system/catalogue/${newId}`);
    },
    [navigate]
  );

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [addItemDialogOpen, setAddItemDialogOpen] =
    React.useState<boolean>(false);

  const [catalogueItemDetails, setCatalogueItemDetails] =
    React.useState<CatalogueItemDetailsPlaceholder>({
      catalogue_category_id: null,
      name: null,
      description: null,
      cost_gbp: null,
      cost_to_rework_gbp: null,
      days_to_replace: null,
      days_to_rework: null,
      drawing_number: null,
      drawing_link: null,
      item_model_number: null,
      is_obsolete: null,
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
    });

  const [catalogueItemManufacturer, setCatalogueItemManufacturer] =
    React.useState<CatalogueItemManufacturer>({
      name: '',
      address: '',
      url: '',
    });

  const [catalogueItemPropertyValues, setCatalogueItemPropertyValues] =
    React.useState<(string | number | boolean | null)[]>([]);

  const catalogueId = location.pathname.replace(
    '/inventory-management-system/catalogue',
    ''
  );

  const {
    data: catalogueCategoryDetail,
    isLoading: catalogueCategoryDetailLoading,
  } = useCatalogueCategoryById(catalogueId.replace('/', ''));

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueId.replace('/', '')
  );

  const [parentId, setParentId] = React.useState<string | null>(null);
  const [isLeaf, setIsLeaf] = React.useState<boolean>(false);
  const parentInfo = React.useMemo(
    () => catalogueCategoryDetail,
    [catalogueCategoryDetail]
  );

  const isLeafNode = parentInfo ? parentInfo.is_leaf : false;
  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategory(
    catalogueCategoryDetailLoading ? true : !!parentInfo && parentInfo.is_leaf,
    !catalogueId ? 'null' : catalogueId.replace('/', '')
  );

  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueCategory, setSelectedCatalogueCategory] =
    React.useState<CatalogueCategory | undefined>(undefined);

  const [catalogueCategoryName, setCatalogueCategoryName] = React.useState<
    string | undefined
  >(undefined);

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
    setCatalogueCategoryName(catalogueCategory.name);
    setIsLeaf(catalogueCategory.is_leaf);
    setFormFields(catalogueCategory.catalogue_item_properties ?? null);
  };
  const [formFields, setFormFields] = React.useState<
    CatalogueCategoryFormData[] | null
  >(null);

  React.useEffect(() => {
    setParentId((parentInfo && parentInfo.id) || null);
    setIsLeaf(parentInfo ? !!parentInfo.is_leaf : false);
  }, [catalogueId, parentInfo]);

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
                navigate('/inventory-management-system/catalogue');
              }}
              navigateHomeAriaLabel={'navigate to catalogue home'}
            />
            <NavigateNext
              fontSize="medium"
              sx={{ color: 'rgba(0, 0, 0, 0.6)', mx: '4px', my: '8px' }}
            />
            <IconButton
              sx={{ mx: '4px', my: '8px' }}
              onClick={() => setAddCategoryDialogOpen(true)}
              disabled={isLeafNode || (!parentInfo && catalogueId !== '')}
              aria-label="add catalogue category"
            >
              <AddIcon />
            </IconButton>
          </div>
          {isLeafNode && (
            <Button
              variant="outlined"
              onClick={() => setAddItemDialogOpen(true)}
            >
              Add Catalogue Item
            </Button>
          )}

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
            <Typography sx={{ fontWeight: 'bold' }}>
              No results found
            </Typography>
            <Typography>
              {!parentInfo && catalogueId !== ''
                ? 'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
                : 'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'}
            </Typography>
          </Box>
        )}

      {catalogueCategoryData &&
        !parentInfo?.is_leaf &&
        !catalogueCategoryDetailLoading && (
          <Grid container spacing={2}>
            {catalogueCategoryData.map((item, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
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
        )}
      {parentInfo && parentInfo.is_leaf && (
        <CatalogueItemsTable
          parentInfo={parentInfo}
          catalogueItemDetails={catalogueItemDetails}
          onChangeCatalogueItemDetails={setCatalogueItemDetails}
          catalogueItemManufacturer={catalogueItemManufacturer}
          onChangeCatalogueItemManufacturer={setCatalogueItemManufacturer}
          catalogueItemPropertyValues={catalogueItemPropertyValues}
          onChangeCatalogueItemPropertyValues={setCatalogueItemPropertyValues}
          onChangeAddItemDialogOpen={setAddItemDialogOpen}
          dense={false}
        />
      )}

      <CatalogueCategoryDialog
        open={addCategoryDialogOpen}
        onClose={() => setAddCategoryDialogOpen(false)}
        parentId={parentId}
        onChangeCatalogueCategoryName={setCatalogueCategoryName}
        catalogueCategoryName={catalogueCategoryName}
        onChangeLeaf={setIsLeaf}
        isLeaf={isLeaf}
        type="add"
        formFields={formFields}
        onChangeFormFields={setFormFields}
        resetSelectedCatalogueCategory={() =>
          setSelectedCatalogueCategory(undefined)
        }
      />
      <CatalogueCategoryDialog
        open={editCategoryDialogOpen}
        onClose={() => setEditCategoryDialogOpen(false)}
        parentId={parentId}
        onChangeCatalogueCategoryName={setCatalogueCategoryName}
        catalogueCategoryName={catalogueCategoryName}
        onChangeLeaf={setIsLeaf}
        isLeaf={isLeaf}
        type="edit"
        selectedCatalogueCategory={selectedCatalogueCategory}
        formFields={formFields}
        onChangeFormFields={setFormFields}
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
      <CatalogueItemsDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        parentId={parentId}
        catalogueItemDetails={catalogueItemDetails}
        onChangeCatalogueItemDetails={setCatalogueItemDetails}
        catalogueItemManufacturer={catalogueItemManufacturer}
        onChangeCatalogueItemManufacturer={setCatalogueItemManufacturer}
        catalogueItemPropertiesForm={
          parentInfo?.catalogue_item_properties ?? []
        }
        type="create"
        propertyValues={catalogueItemPropertyValues}
        onChangePropertyValues={setCatalogueItemPropertyValues}
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
