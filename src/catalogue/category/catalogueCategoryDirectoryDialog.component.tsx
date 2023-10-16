import {
  Box,
  Button,
  CircularProgress,
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
} from '@mui/material';
import React from 'react';
import { CatalogueCategory, EditCatalogueCategory } from '../../app.types';
import { AxiosError } from 'axios';
import Breadcrumbs from '../../view/breadcrumbs.component';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useMoveToCatalogueCategory,
} from '../../api/catalogueCategory';
import handleTransferState from './handleTransferState';

export interface CatalogueCategoryDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
}

const CatalogueCategoryDirectoryDialog = (
  props: CatalogueCategoryDirectoryDialogProps
) => {
  const { open, onClose, selectedCategories, onChangeSelectedCategories } =
    props;
  const theme = useTheme();

  const [currDirId, setCurrDirId] = React.useState<string>('');

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategory(!currDirId ? 'null' : currDirId, false);
  const handleClose = React.useCallback(() => {
    onClose();
    onChangeSelectedCategories([]);
    setCurrDirId('');
  }, [onChangeSelectedCategories, onClose]);

  const { mutateAsync: moveToCatalogueCategory } = useMoveToCatalogueCategory();
  console.log(selectedCategories);
  const handleMoveToCatalogueCategory = React.useCallback(() => {
    const currId = currDirId === '' ? null : currDirId;

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
    })
      .then((response) => {
        console.log(response);
        handleTransferState(response);
        handleClose();
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });
  }, [currDirId, handleClose, moveToCatalogueCategory, selectedCategories]);

  const onChangeNode = (newId: string): void => {
    setCurrDirId(newId);
  };

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(currDirId);

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

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
            backgroundColor: theme.palette.background.default, // Set the background color for the sticky element
            zIndex: theme.zIndex.appBar + 1, // Ensure it's above other elements on the page
          }}
        >
          <Breadcrumbs
            onChangeNode={onChangeNode}
            breadcrumbsInfo={catalogueBreadcrumbs}
            onChangeNavigateHome={() => {
              setCurrDirId('');
            }}
            navigateHomeAriaLabel="navigate to catalogue home"
          />
        </Box>
        {catalogueCategoryDataLoading ? (
          <CircularProgress />
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
                    onClick={() => setCurrDirId(category.id)}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor:
                        hoveredRow === index
                          ? theme.palette.action.hover
                          : 'inherit',
                      cursor: 'pointer',
                    }}
                    aria-label={`${category.name} row`}
                  >
                    <TableCell>{category.name}</TableCell>
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
        <Button onClick={handleMoveToCatalogueCategory}>Move to</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogueCategoryDirectoryDialog;
