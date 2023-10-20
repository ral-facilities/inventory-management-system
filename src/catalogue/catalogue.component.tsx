import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { Box, Button, Grid, IconButton, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { NavigateNext } from '@mui/icons-material';
import CatalogueCategoryDialog from './category/catalogueCategoryDialog.component';
import CatalogueCard from './category/catalogueCard.component';
import { useCatalogueCategory } from '../api/catalogueCategory';
import {
  CatalogueCategoryFormData,
  CatalogueCategory,
  CatalogueItemDetails,
  CatalogueItemManufacturer,
  CatalogueItemProperty,
} from '../app.types';
import DeleteCatalogueCategoryDialog from './category/deleteCatalogueCategoryDialog.component';
import CatalogueItemsTable from './items/catalogueItemsTable.component';
import CatalogueItemsDialog from './items/catalogueItemsDialog.component';

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
  const [currNode, setCurrNode] = React.useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newNode: string) => {
      setCurrNode(newNode);
      navigate(`/inventory-management-system/catalogue${newNode}`);
    },
    [navigate]
  );

  React.useEffect(() => {
    setCurrNode(
      location.pathname.replace('/inventory-management-system/catalogue', '')
    );
  }, [location.pathname]);

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] =
    React.useState<boolean>(false);

  const [addItemDialogOpen, setAddItemDialogOpen] =
    React.useState<boolean>(false);

  const [catalogueItemDetails, setCatalogueItemDetails] =
    React.useState<CatalogueItemDetails>({
      name: undefined,
      description: '',
    });

  const [catalogueItemManufacturer, setCatalogueItemManufacturer] =
    React.useState<CatalogueItemManufacturer>({
      name: '',
      address: '',
      web_url: '',
    });

  const [catalogueItemPropertyValues, setCatalogueItemPropertyValues] =
    React.useState<(string | number | boolean | null)[]>([]);

  const catalogueLocation = location.pathname.replace(
    '/inventory-management-system/catalogue',
    ''
  );

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategory(
    undefined,
    catalogueLocation === '' ? '/' : catalogueLocation
  );

  const {
    data: catalogueCategoryDetail,
    isLoading: catalogueCategoryDetailLoading,
  } = useCatalogueCategory(
    catalogueLocation === '' ? '/' : catalogueLocation,
    undefined
  );

  const [parentId, setParentId] = React.useState<string | null>(null);
  const [isLeaf, setIsLeaf] = React.useState<boolean>(false);
  const parentInfo = React.useMemo(
    () => catalogueCategoryDetail?.[0],
    [catalogueCategoryDetail]
  );

  const disableButton = parentInfo ? parentInfo.is_leaf : false;

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
    setParentId(parentInfo ? (!!parentInfo.id ? parentInfo.id : null) : null);
    setIsLeaf(parentInfo ? parentInfo.is_leaf : false);
  }, [catalogueLocation, parentInfo]);

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
            <IconButton
              sx={{ margin: '4px' }}
              onClick={() => {
                navigate('/inventory-management-system/catalogue');
              }}
              aria-label="navigate to catalogue home"
            >
              <HomeIcon />
            </IconButton>
            <Breadcrumbs currNode={currNode} onChangeNode={onChangeNode} />
            <NavigateNext
              fontSize="medium"
              sx={{ color: 'rgba(0, 0, 0, 0.6)', margin: '4px' }}
            />
            <IconButton
              sx={{ margin: '4px' }}
              onClick={() => setAddCategoryDialogOpen(true)}
              disabled={
                disableButton || (!parentInfo && catalogueLocation !== '')
              }
              aria-label="add catalogue category"
            >
              <AddIcon />
            </IconButton>
          </div>

          <Button
            variant="outlined"
            disabled={!disableButton}
            onClick={() => setAddItemDialogOpen(true)}
          >
            Add Catalogue Item
          </Button>
        </Grid>
      </Grid>

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
              {!parentInfo && catalogueLocation !== ''
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
    </Grid>
  );
}

export default Catalogue;
