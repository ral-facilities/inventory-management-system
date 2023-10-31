import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Grid,
} from '@mui/material';
import React from 'react';
import { CatalogueCategory, EditCatalogueCategory } from '../../app.types';
import Breadcrumbs from '../../view/breadcrumbs.component';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
  useMoveToCatalogueCategory,
} from '../../api/catalogueCategory';
import handleTransferState from '../../handleTransferState';

export interface CatalogueCategoryDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
  catalogueCurrDirId: string | null;
  onChangeCatalogueCurrDirId: (catalogueCurrDirId: string | null) => void;
}

const CatalogueCategoryDirectoryDialog = (
  props: CatalogueCategoryDirectoryDialogProps
) => {
  const {
    open,
    onClose,
    selectedCategories,
    onChangeSelectedCategories,
    catalogueCurrDirId,
    onChangeCatalogueCurrDirId,
  } = props;

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategory(
    false,
    !catalogueCurrDirId ? 'null' : catalogueCurrDirId
  );

  const handleClose = React.useCallback(() => {
    onClose();
    onChangeSelectedCategories([]);
    onChangeCatalogueCurrDirId('');
  }, [onChangeCatalogueCurrDirId, onChangeSelectedCategories, onClose]);

  const { mutateAsync: moveToCatalogueCategory } = useMoveToCatalogueCategory();

  const { data: targetLocationCatalogueCategory } = useCatalogueCategoryById(
    catalogueCurrDirId ?? undefined
  );
  const handleMoveToCatalogueCategory = React.useCallback(() => {
    const currId = catalogueCurrDirId === '' ? null : catalogueCurrDirId;

    const catalogueCategory: EditCatalogueCategory[] = selectedCategories.map(
      (category) => ({
        id: category.id,
        parent_id: currId,
        name: category.name,
      })
    );

    moveToCatalogueCategory({
      catalogueCategory: catalogueCategory,
      selectedCategories: selectedCategories,
      targetLocationCatalogueCategory: targetLocationCatalogueCategory ?? {
        name: 'Root',
        id: '',
        parent_id: null,
        is_leaf: false,
        code: '',
      },
    }).then((response) => {
      handleTransferState(response);
      handleClose();
    });
  }, [
    catalogueCurrDirId,
    handleClose,
    moveToCatalogueCategory,
    selectedCategories,
    targetLocationCatalogueCategory,
  ]);

  const onChangeNode = (newId: string): void => {
    onChangeCatalogueCurrDirId(newId);
  };

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueCurrDirId ?? ''
  );

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const selectedCatalogueCategoryIds: (string | null)[] =
    selectedCategories.map((category) => {
      return category.id;
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{ sx: { height: '512px' } }}
    >
      <DialogTitle sx={{ marginLeft: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            Move {selectedCategories.length}{' '}
            {selectedCategories.length === 1
              ? 'catalogue category'
              : 'catalogue categories'}{' '}
            to a different catalogue category
          </Grid>
          <Grid item xs={12}>
            <Breadcrumbs
              onChangeNode={onChangeNode}
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNavigateHome={() => {
                onChangeCatalogueCurrDirId(null);
              }}
              navigateHomeAriaLabel="navigate to catalogue home"
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        {catalogueCategoryDataLoading ? (
          <Box
            sx={{
              width: '100%',
            }}
          >
            <LinearProgress />
          </Box>
        ) : catalogueCategoryData && catalogueCategoryData.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography sx={{ fontWeight: 'bold' }}>Name </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalogueCategoryData.map((category, index) => (
                  <TableRow
                    key={category.id}
                    onClick={() => {
                      if (
                        !(
                          selectedCatalogueCategoryIds.includes(category.id) ||
                          category.is_leaf
                        )
                      ) {
                        onChangeCatalogueCurrDirId(category.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    sx={{
                      backgroundColor:
                        hoveredRow === index ? 'action.hover' : 'inherit',
                      cursor:
                        selectedCatalogueCategoryIds.includes(category.id) ||
                        category.is_leaf
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                    aria-label={`${category.name} row`}
                  >
                    <TableCell
                      sx={{
                        color:
                          selectedCatalogueCategoryIds.includes(category.id) ||
                          category.is_leaf
                            ? 'action.disabled'
                            : 'inherit',
                      }}
                    >
                      {category.name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}
          >
            <Typography sx={{ fontWeight: 'bold', margin: '16px' }}>
              No catalogue categories found
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            selectedCategories.length > 0
              ? catalogueCurrDirId === selectedCategories[0].parent_id
              : false
          }
          onClick={handleMoveToCatalogueCategory}
        >
          Move here
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogueCategoryDirectoryDialog;
