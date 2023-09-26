import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { Button, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { NavigateNext } from '@mui/icons-material';
import AddCatalogueCategoryDialog from './addCatalogueCategoryDialog.component';
import CatalogueCard from './catalogueCard.component';
import { useCatalogueCategory } from '../api/catalogueCategory';
import {
  ViewCatalogueCategoryResponse,
  CatalogueCategoryFormData,
} from '../app.types';
import DeleteCatalogueCategoryDialog from './deleteCatalogueCategoryDialog.component';

function Catalogue() {
  const [currNode, setCurrNode] = React.useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newNode: string) => {
      setCurrNode(newNode);
      navigate(`/catalogue${newNode}`);
    },
    [navigate]
  );

  React.useEffect(() => {
    setCurrNode(location.pathname.replace('/catalogue', ''));
  }, [location.pathname]);

  const [catalogueCategoryDialogOpen, setCatalogueCategoryDialogOpen] =
    React.useState<boolean>(false);

  const catalogueLocation = location.pathname.replace('/catalogue', '');

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

  const disableButton = parentInfo ? parentInfo.is_leaf : false;

  const [deleteDialogOpen, setDeleteDialogOpen] =
    React.useState<boolean>(false);

  const [deleteCatalogueCategoryData, setDeleteCatalogueCategoryData] =
    React.useState<ViewCatalogueCategoryResponse | undefined>(undefined);

  const onChangeOpenDeleteDialog = (
    catalogueCategory: ViewCatalogueCategoryResponse
  ) => {
    setDeleteDialogOpen(true);
    setDeleteCatalogueCategoryData(catalogueCategory);
  };
  const [formFields, setFormFields] = React.useState<
    CatalogueCategoryFormData[] | null
  >(null);

  React.useEffect(() => {
    if (parentInfo) {
      setParentId(parentInfo.id);
      setIsLeaf(parentInfo.is_leaf);
    }

    if (catalogueLocation === '') {
      setParentId(null);
    }
  }, [catalogueLocation, parentInfo]);

  return (
    <Grid container>
      <Grid
        item
        sx={{
          display: 'flex',
          marginLeft: 0,
          alignItems: 'center', // Align items vertically at the center
          height: '100%',
        }}
      >
        <Button
          sx={{ alignContent: 'left', margin: '4px' }}
          onClick={() => {
            navigate('/catalogue');
          }}
          variant="outlined"
          data-testid="home-button-catalogue"
        >
          <HomeIcon />
        </Button>
        <Breadcrumbs currNode={currNode} onChangeNode={onChangeNode} />
        <NavigateNext
          fontSize="medium"
          sx={{ color: 'rgba(0, 0, 0, 0.6)', margin: '4px' }}
        />
        <Button
          variant="outlined"
          sx={{ alignContent: 'left', margin: '4px' }}
          onClick={() => setCatalogueCategoryDialogOpen(true)}
          disabled={disableButton}
        >
          <AddIcon />
        </Button>
        <AddCatalogueCategoryDialog
          open={catalogueCategoryDialogOpen}
          onClose={() => setCatalogueCategoryDialogOpen(false)}
          parentId={parentId}
          onChangeLeaf={setIsLeaf}
          isLeaf={isLeaf}
          formFields={formFields}
          onChangeFormFields={setFormFields}
          refetchData={() => catalogueCategoryDataRefetch()}
        />
      </Grid>
      {catalogueCategoryData && (
        <Grid container spacing={2}>
          {catalogueCategoryData.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <CatalogueCard
                {...item}
                onChangeOpenDeleteDialog={onChangeOpenDeleteDialog}
              />
            </Grid>
          ))}

          <DeleteCatalogueCategoryDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            catalogueCategory={deleteCatalogueCategoryData}
            refetchData={() => catalogueCategoryDataRefetch()}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default Catalogue;
