import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { Button, Box, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { NavigateNext } from '@mui/icons-material';
import AddCatalogueCategoryDialog from './addCatalogueCategoryDialog.component';
import CatalogueCard from './catalogueCard.component';
import { useCatalogueCategory } from '../api/catalogueCategory';

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
  const [parentId] = React.useState<string>('');
  React.useEffect(() => {
    setCurrNode(location.pathname.replace('/catalogue', ''));
  }, [location.pathname]);

  const [catalogueCategoryDialogOpen, setCatalogueCategoryDialogOpen] =
    React.useState<boolean>(false);

  const catalogueLocation = location.pathname.replace('/catalogue', '');

  const { data: catalogueCategoryData } = useCatalogueCategory(
    undefined,
    catalogueLocation === '' ? '/' : catalogueLocation
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          marginLeft: 'auto',
          alignItems: 'center', // Align items vertically at the center
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
        <Box sx={{ alignContent: 'left' }}>
          <Breadcrumbs currNode={currNode} onChangeNode={onChangeNode} />
        </Box>
        <NavigateNext
          fontSize="medium"
          sx={{ color: 'rgba(0, 0, 0, 0.6)', margin: '4px' }}
        />
        <Button
          variant="outlined"
          sx={{ alignContent: 'left', margin: '4px' }}
          onClick={() => setCatalogueCategoryDialogOpen(true)}
          data-testid="add-button-catalogue"
        >
          <AddIcon />
        </Button>
        <AddCatalogueCategoryDialog
          open={catalogueCategoryDialogOpen}
          onClose={() => setCatalogueCategoryDialogOpen(false)}
          parentId={parentId}
        />
      </Box>
      <Grid container spacing={2}>
        {catalogueCategoryData &&
          catalogueCategoryData.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <CatalogueCard {...item} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default Catalogue;
