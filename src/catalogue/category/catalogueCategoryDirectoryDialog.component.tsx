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
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
} from '../../app.types';
import Breadcrumbs from '../../view/breadcrumbs.component';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
  useCopyToCatalogueCategory,
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
  requestType: 'moveTo' | 'copyTo';
}

const CatalogueCategoryDirectoryDialog = (
  props: CatalogueCategoryDirectoryDialogProps
) => {
  const {
    open,
    onClose,
    selectedCategories,
    onChangeSelectedCategories,
    requestType,
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
  const { mutateAsync: CopyToCatalogueCategory } = useCopyToCatalogueCategory();

  const { data: targetLocationCatalogueCategory } = useCatalogueCategoryById(
    catalogueCurrDirId ?? undefined
  );

  const handleCopyToCatalogueCategory = React.useCallback(() => {
    const currId = catalogueCurrDirId === '' ? null : catalogueCurrDirId;
    const catalogueCategoryCodes: string[] =
      catalogueCategoryData?.map((category) => category.code) || [];

    const catalogueCategory: AddCatalogueCategory[] = selectedCategories.map(
      (category) => {
        let reqAddInfo: AddCatalogueCategory = {
          name: category.name,
          is_leaf: category.is_leaf,
        };
        if (currId) {
          reqAddInfo = {
            ...reqAddInfo,
            parent_id: currId,
          };
        }

        // Check if the name already exists in the target location
        if (catalogueCategoryCodes.includes(category.code)) {
          let count = 1;
          let newName = reqAddInfo.name;
          let newCode = category.code;

          while (catalogueCategoryCodes.includes(newCode)) {
            newCode = `${category.code}_copy_${count}`;
            newName = `${reqAddInfo.name}_copy_${count}`;
            count++;
          }

          reqAddInfo.name = newName;
        }

        if (
          category.catalogue_item_properties &&
          category.catalogue_item_properties.length > 0
        ) {
          reqAddInfo = {
            ...reqAddInfo,
            catalogue_item_properties: category.catalogue_item_properties,
          };
        }

        return reqAddInfo;
      }
    );

    CopyToCatalogueCategory({
      catalogueCategories: catalogueCategory,
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
    CopyToCatalogueCategory,
    catalogueCategoryData,
    catalogueCurrDirId,
    handleClose,
    selectedCategories,
    targetLocationCatalogueCategory,
  ]);

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
      catalogueCategories: catalogueCategory,
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
      fullWidth
    >
      <DialogTitle sx={{ marginLeft: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {requestType === 'moveTo' ? 'Move ' : 'Copy '}{' '}
            {selectedCategories.length}{' '}
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
                      if (!category.is_leaf) {
                        if (
                          !selectedCatalogueCategoryIds.includes(category.id) ||
                          requestType === 'copyTo'
                        ) {
                          onChangeCatalogueCurrDirId(category.id);
                        }
                      }
                    }}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    sx={{
                      backgroundColor:
                        hoveredRow === index ? 'action.hover' : 'inherit',
                      cursor: !category.is_leaf
                        ? requestType === 'moveTo'
                          ? selectedCatalogueCategoryIds.includes(category.id)
                            ? 'not-allowed'
                            : 'pointer'
                          : 'pointer'
                        : 'not-allowed',
                    }}
                    aria-label={`${category.name} row`}
                  >
                    <TableCell
                      sx={{
                        color: !category.is_leaf
                          ? requestType === 'moveTo'
                            ? selectedCatalogueCategoryIds.includes(category.id)
                              ? 'action.disabled'
                              : 'inherit'
                            : 'inherit'
                          : 'action.disabled',
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
            requestType === 'moveTo'
              ? selectedCategories.length > 0
                ? catalogueCurrDirId === selectedCategories[0].parent_id
                : false
              : false
          }
          onClick={
            requestType === 'moveTo'
              ? handleMoveToCatalogueCategory
              : handleCopyToCatalogueCategory
          }
        >
          {requestType === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogueCategoryDirectoryDialog;
