import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  Tooltip,
} from '@mui/material';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategories,
  useCatalogueCategory,
} from '../../api/catalogueCategory';
import { useMoveToCatalogueItem } from '../../api/catalogueItem';
import { CatalogueCategory, CatalogueItem } from '../../app.types';
import handleTransferState from '../../handleTransferState';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from '../category/catalogueCategoryTableView.component';
import CatalogueItemsTable from './catalogueItemsTable.component';
export interface CatalogueItemDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: CatalogueItem[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  catalogueCurrDirId: string | null;
  onChangeCatalogueCurrDirId: (catalogueCurrDirId: string | null) => void;
  parentInfo: CatalogueCategory;
  requestType: 'moveTo' | 'copyTo';
}

const CatalogueItemDirectoryDialog = (
  props: CatalogueItemDirectoryDialogProps
) => {
  const {
    open,
    onClose,
    selectedItems,
    onChangeSelectedItems,
    requestType,
    catalogueCurrDirId,
    onChangeCatalogueCurrDirId,
    parentInfo,
  } = props;
  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategories(
    false,
    !catalogueCurrDirId ? 'null' : catalogueCurrDirId
  );

  const handleClose = React.useCallback(() => {
    onClose();
    onChangeSelectedItems({});
    onChangeCatalogueCurrDirId('');
    setErrorMessage('');
  }, [onChangeCatalogueCurrDirId, onChangeSelectedItems, onClose]);

  // reset error message when catalogue catagory id changes
  React.useEffect(() => {
    setErrorMessage('');
  }, [catalogueCurrDirId]);
  const { mutateAsync: moveToCatalogueItem } = useMoveToCatalogueItem();

  const { data: targetCatalogueCategory } = useCatalogueCategory(
    catalogueCurrDirId ?? undefined
  );

  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleMoveToCatalogueItem = React.useCallback(() => {
    if (
      JSON.stringify(parentInfo.catalogue_item_properties) !==
      JSON.stringify(targetCatalogueCategory?.catalogue_item_properties)
    ) {
      setErrorMessage(
        'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
      );
      return;
    }

    moveToCatalogueItem({
      selectedItems: selectedItems,
      targetCatalogueCategory: targetCatalogueCategory ?? null,
    }).then((response) => {
      handleTransferState(response);
      handleClose();
    });
  }, [
    handleClose,
    moveToCatalogueItem,
    parentInfo,
    selectedItems,
    targetCatalogueCategory,
  ]);

  const onChangeNode = (newId: string): void => {
    onChangeCatalogueCurrDirId(newId);
  };

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueCurrDirId ?? ''
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      PaperProps={{ sx: { height: '692px' } }}
      fullWidth
    >
      <DialogTitle sx={{ marginLeft: 2 }}>
        <Grid container spacing={2}>
          <Grid container item flexDirection="row" alignItems="center" xs={12}>
            <>
              {requestType === 'moveTo' ? 'Move ' : 'Copy '}{' '}
              {selectedItems.length}{' '}
              {selectedItems.length === 1
                ? 'catalogue item'
                : 'catalogue items'}{' '}
              to a different catalogue category
            </>
            {requestType === 'copyTo' && (
              <Tooltip
                title={
                  'Only the catalogue items details, properties and manufacturer will be copied; no contained items within the catalogue category will be included.'
                }
                placement="top"
                enterTouchDelay={0}
                arrow
                aria-label={'Copy Warning'}
                sx={{ mx: 2 }}
              >
                <InfoOutlinedIcon />
              </Tooltip>
            )}
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
        {targetCatalogueCategory?.is_leaf ? (
          <CatalogueItemsTable
            parentInfo={targetCatalogueCategory}
            dense={true}
            isItemSelectable={(item: CatalogueItem) => false}
          />
        ) : (
          <CatalogueCategoryTableView
            selectedCategories={[]}
            onChangeCatalogueCurrDirId={onChangeCatalogueCurrDirId}
            requestType={'standard'}
            catalogueCategoryData={catalogueCategoryData}
            catalogueCategoryDataLoading={catalogueCategoryDataLoading}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            (targetCatalogueCategory?.is_leaf ?? false) &&
            catalogueCurrDirId !== parentInfo.id
              ? false
              : true
          }
          onClick={handleMoveToCatalogueItem}
        >
          {requestType === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
      {errorMessage && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default CatalogueItemDirectoryDialog;
