import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import React from 'react';
import { CatalogueCategory, EditCatalogueCategory } from '../../app.types';
import { AxiosError } from 'axios';
import Breadcrumbs from '../../view/breadcrumbs.component';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
  useMoveToCatalogueCategory,
} from '../../api/catalogueCategory';
import handleTransferState from '../../api/handleTransferState';

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
  const theme = useTheme();

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
    })
      .then((response) => {
        console.log(response);
        handleTransferState(response);
        handleClose();
      })
      .catch((error: AxiosError) => {
        console.log(error);
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
      <DialogTitle sx={{ marginLeft: '8px' }}>
        Move {selectedCategories.length}{' '}
        {selectedCategories.length === 1
          ? 'catalogue category'
          : 'catalogue categories'}{' '}
        to new a catalogue category
      </DialogTitle>
      <DialogContent>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0, // Adjust this value as needed to control the distance from the top
            backgroundColor: theme.palette.background.paper, // Set the background color for the sticky element
            zIndex: theme.zIndex.appBar + 1, // Ensure it's above other elements on the page
          }}
        >
          <Breadcrumbs
            onChangeNode={onChangeNode}
            breadcrumbsInfo={catalogueBreadcrumbs}
            onChangeNavigateHome={() => {
              onChangeCatalogueCurrDirId(null);
            }}
            navigateHomeAriaLabel="navigate to catalogue home"
          />
        </Box>

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
                    style={{
                      backgroundColor:
                        hoveredRow === index
                          ? theme.palette.action.hover
                          : 'inherit',
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
                            ? theme.palette.action.disabled
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
