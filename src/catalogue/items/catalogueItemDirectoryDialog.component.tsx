import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { CatalogueCategory, CatalogueItem } from '../../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategories,
  useGetCatalogueCategory,
} from '../../api/catalogueCategories';
import {
  useCopyToCatalogueItem,
  useMoveToCatalogueItem,
} from '../../api/catalogueItems';
import handleTransferState from '../../handleTransferState';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from '../category/catalogueCategoryTableView.component';
import CatalogueItemsTable from './catalogueItemsTable.component';
export interface CatalogueItemDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: CatalogueItem[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentCategoryId: string | null;
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
    parentInfo,
  } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentCategoryId, setParentCategoryId] = React.useState<string | null>(
    props.parentCategoryId
  );
  React.useEffect(() => {
    setParentCategoryId(props.parentCategoryId);
  }, [props.parentCategoryId]);

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useGetCatalogueCategories(
    false,
    parentCategoryId === null ? 'null' : parentCategoryId
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
    setParentCategoryId(props.parentCategoryId);
  }, [onClose, props.parentCategoryId]);

  // reset error message when catalogue category id changes
  React.useEffect(() => {
    setErrorMessage(undefined);
  }, [parentCategoryId]);

  const { mutateAsync: moveToCatalogueItem, isPending: isMoveToPending } =
    useMoveToCatalogueItem();
  const { mutateAsync: copyToCatalogueItem, isPending: isCopyToPending } =
    useCopyToCatalogueItem();

  const { data: targetCatalogueCategory } =
    useGetCatalogueCategory(parentCategoryId);

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const handleMoveToCatalogueItem = React.useCallback(() => {
    if (
      JSON.stringify(parentInfo.properties?.map(({ id, ...rest }) => rest)) !==
      JSON.stringify(
        targetCatalogueCategory?.properties?.map(({ id, ...rest }) => rest)
      )
    ) {
      setErrorMessage(
        'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
      );
      return;
    }

    moveToCatalogueItem({
      selectedCatalogueItems: selectedItems,
      targetCatalogueCategory: targetCatalogueCategory ?? null,
    }).then((response) => {
      handleTransferState(response);
      onChangeSelectedItems({});
      handleClose();
    });
  }, [
    handleClose,
    moveToCatalogueItem,
    onChangeSelectedItems,
    parentInfo.properties,
    selectedItems,
    targetCatalogueCategory,
  ]);

  const handleCopyToCatalogueItem = React.useCallback(() => {
    if (
      JSON.stringify(parentInfo.properties?.map(({ id, ...rest }) => rest)) !==
      JSON.stringify(
        targetCatalogueCategory?.properties?.map(({ id, ...rest }) => rest)
      )
    ) {
      setErrorMessage(
        'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
      );
      return;
    }

    copyToCatalogueItem({
      selectedCatalogueItems: selectedItems,
      targetCatalogueCategory: targetCatalogueCategory ?? null,
    }).then((response) => {
      handleTransferState(response);
      onChangeSelectedItems({});
      handleClose();
    });
  }, [
    copyToCatalogueItem,
    handleClose,
    onChangeSelectedItems,
    parentInfo.properties,
    selectedItems,
    targetCatalogueCategory,
  ]);

  const { data: catalogueBreadcrumbs } =
    useGetCatalogueBreadcrumbs(parentCategoryId);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{ sx: { height: '692px' } }}
      fullWidth
    >
      <DialogTitle sx={{ marginLeft: 2 }}>
        <Grid container spacing={2}>
          <Grid
            container
            size={12}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
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
          <Grid size={12}>
            <Breadcrumbs
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNode={setParentCategoryId}
              onChangeNavigateHome={() => setParentCategoryId(null)}
              homeLocation="Catalogue"
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        {targetCatalogueCategory?.is_leaf ? (
          <CatalogueItemsTable
            parentInfo={targetCatalogueCategory}
            dense={true}
            isItemSelectable={() => false}
            requestOrigin="move to"
          />
        ) : (
          <CatalogueCategoryTableView
            selectedCategories={[]}
            onChangeParentCategoryId={setParentCategoryId}
            requestType={'standard'}
            catalogueCategoryData={catalogueCategoryData}
            catalogueCategoryDataLoading={catalogueCategoryDataLoading}
            requestOrigin="item"
            catalogueItemParentCategory={parentInfo}
            catalogueCategoryParentId={parentCategoryId ?? undefined}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            (requestType === 'moveTo'
              ? !(
                  (targetCatalogueCategory?.is_leaf ?? false) &&
                  parentCategoryId !== parentInfo.id
                )
              : !(targetCatalogueCategory?.is_leaf ?? false)) ||
            isCopyToPending ||
            isMoveToPending ||
            errorMessage !== undefined
          }
          onClick={
            requestType === 'moveTo'
              ? handleMoveToCatalogueItem
              : handleCopyToCatalogueItem
          }
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
