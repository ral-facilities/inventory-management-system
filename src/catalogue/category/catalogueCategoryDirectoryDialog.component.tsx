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
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
} from '../../app.types';
import { AxiosError } from 'axios';
import Breadcrumbs from '../../view/breadcrumbs.component';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
  useCopyToCatalogueCategory,
  useMoveToCatalogueCategory,
} from '../../api/catalogueCategory';
import handleTransferState from '../../api/handleTransferState';

function formatName(name: string) {
  name = name.toLowerCase().trim();
  return name.replace(/\s+/g, '-');
}
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
  const theme = useTheme();

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategory(!catalogueCurrDirId ? 'null' : catalogueCurrDirId);
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
        if (catalogueCategoryCodes.includes(formatName(reqAddInfo.name))) {
          let count = 1;
          let newName = reqAddInfo.name;

          while (catalogueCategoryCodes.includes(formatName(newName))) {
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
        {requestType === 'moveTo' ? 'Move ' : 'Copy '}{' '}
        {selectedCategories.length}{' '}
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
                    style={{
                      backgroundColor:
                        hoveredRow === index
                          ? theme.palette.action.hover
                          : 'inherit',
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
                              ? theme.palette.action.disabled
                              : 'inherit'
                            : 'inherit'
                          : theme.palette.action.disabled,
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
