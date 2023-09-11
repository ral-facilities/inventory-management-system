import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { Button, Grid, IconButton } from '@mui/material';
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
import { useCatalogueItems } from '../api/catalogueItem';

export function convertProperties(
  catalogueItemProperties?: CatalogueCategoryFormData[]
): CatalogueItemProperty[] {
  const convertedProperties: CatalogueItemProperty[] = (
    catalogueItemProperties ?? []
  ).map((property) => {
    let value: string | number | boolean | null = null;

    if (property.type === 'number' || property.type === 'string') {
      value = null;
    } else if (property.type === 'boolean') {
      value = '';
    }

    return {
      name: property.name,
      value,
    };
  });

  return convertedProperties;
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
      manufacturer: undefined,
      manufacturerNumber: undefined,
      manufacturerUrl: undefined,
    });

  const [catalogueItemProperties, setCatalogueItemProperties] = React.useState<
    CatalogueItemProperty[] | null
  >(null);

  const catalogueLocation = location.pathname.replace(
    '/inventory-management-system/catalogue',
    ''
  );

  const { data: catalogueCategoryData, refetch: catalogueCategoryDataRefetch } =
    useCatalogueCategory(
      undefined,
      catalogueLocation === '' ? '/' : catalogueLocation
    );

  const { data: catalogueCategoryDetail } = useCatalogueCategory(
    catalogueLocation === '' ? '/' : catalogueLocation,
    undefined
  );

  const [parentId, setParentId] = React.useState<string | null>(null);
  const [isLeaf, setIsLeaf] = React.useState<boolean>(false);
  const parentInfo = catalogueCategoryDetail?.[0];

  const { data: catalogueItemsData } = useCatalogueItems(parentId);

  // SG header + SG footer + tabs #add breadcrumbs
  const tableHeight = `calc(100vh - (64px + 36px + 50px)`;

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
    setCatalogueItemProperties(
      convertProperties(parentInfo?.catalogue_item_properties)
    );
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
              data-testid="home-button-catalogue"
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
              disabled={disableButton}
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
      {catalogueCategoryData && !parentInfo?.is_leaf && (
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
          tableHeight={tableHeight}
          data={catalogueItemsData ?? []}
          catalogueItemProperties={parentInfo.catalogue_item_properties ?? []}
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
        refetchData={() => catalogueCategoryDataRefetch()}
        type="add"
        formFields={formFields}
        onChangeFormFields={setFormFields}
      />
      <CatalogueCategoryDialog
        open={editCategoryDialogOpen}
        onClose={() => setEditCategoryDialogOpen(false)}
        parentId={parentId}
        onChangeCatalogueCategoryName={setCatalogueCategoryName}
        catalogueCategoryName={catalogueCategoryName}
        onChangeLeaf={setIsLeaf}
        isLeaf={isLeaf}
        refetchData={() => catalogueCategoryDataRefetch()}
        type="edit"
        selectedCatalogueCategory={selectedCatalogueCategory}
        formFields={formFields}
        onChangeFormFields={setFormFields}
      />
      <DeleteCatalogueCategoryDialog
        open={deleteCategoryDialogOpen}
        onClose={() => setDeleteCategoryDialogOpen(false)}
        catalogueCategory={selectedCatalogueCategory}
        refetchData={() => catalogueCategoryDataRefetch()}
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
        catalogueItemProperties={catalogueItemProperties}
        onChangeCatalogueItemProperties={setCatalogueItemProperties}
      />
    </Grid>
  );
}

export default Catalogue;
