import React from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ItemDialog from './itemDialog.component';
import { useCatalogueItem } from '../api/catalogueItem';
import { Link, useLocation } from 'react-router-dom';
import { useCatalogueCategory } from '../api/catalogueCategory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function Items() {
  const [addItemDialogOpen, setAddItemDialogOpen] =
    React.useState<boolean>(false);
  const location = useLocation();
  const catalogueItemId = location.pathname.split('/')[3];
  const { data: catalogueItem } = useCatalogueItem(catalogueItemId);
  const { data: catalogueCategory } = useCatalogueCategory(
    catalogueItem?.catalogue_category_id
  );
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'left',
        padding: 4,
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.default',
        zIndex: 1000,
        width: '100%',
      }}
    >
      <Button
        sx={{ mx: 0.5 }}
        component={Link}
        startIcon={
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <ArrowBackIcon fontSize="small" />{' '}
            <ArrowBackIcon fontSize="small" />
          </Box>
        }
        to={
          catalogueCategory
            ? `/catalogue/${catalogueCategory.id}`
            : '/catalogue'
        }
        variant="outlined"
      >
        {catalogueCategory
          ? `Back to ${catalogueCategory?.name} table view`
          : 'Home'}
      </Button>
      <Button
        startIcon={<ArrowBackIcon />}
        sx={{ mx: 0.5 }}
        component={Link}
        to={
          catalogueItem ? `/catalogue/item/${catalogueItem.id}` : '/catalogue'
        }
        variant="outlined"
      >
        Back to {`${catalogueItem?.name} landing page`}
      </Button>
      <Button
        sx={{ mx: 0.5 }}
        startIcon={<AddIcon />}
        onClick={() => setAddItemDialogOpen(true)}
        variant="outlined"
      >
        Add Item
      </Button>
      <ItemDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        type="add"
        catalogueCategory={catalogueCategory}
        catalogueItem={catalogueItem}
      />
    </div>
  );
}

export default Items;
