import React from 'react';
import { AxiosError } from 'axios';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddCatalogueCategory } from '../app.types';
import { useAddCatalogueCategory } from '../api/catalogueCategory';

export interface AddCatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string;
  onChangeLeaf: (isLeaf: boolean) => void;
  isLeaf: boolean;
  refetchData: () => void;
}

function AddCatalogueCategoryDialog(props: AddCatalogueCategoryDialogProps) {
  const { open, onClose, parentId, isLeaf, onChangeLeaf, refetchData } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );
  const { mutateAsync: addCatalogueCategory } = useAddCatalogueCategory();
  const [catalogueCategoryName, setCatalogueCategoryName] = React.useState<
    string | undefined
  >(undefined);

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage(undefined);
    setCatalogueCategoryName(undefined);
    refetchData();
  }, [onClose, refetchData]);

  const handleCatalogueCategory = React.useCallback(() => {
    let catalogueCategory: AddCatalogueCategory;
    catalogueCategory = {
      name: catalogueCategoryName,
      is_leaf: isLeaf,
    };

    if (parentId !== '') {
      catalogueCategory = {
        ...catalogueCategory,
        parent_id: parentId,
      };
    }
    addCatalogueCategory(catalogueCategory)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        setError(true);
        const errorMessages = [
          'Request failed with status code 422',
          'Request failed with status code 409',
        ];
        if (error.message === errorMessages[0]) {
          setErrorMessage(`Please enter a name. ${errorMessages[0]}`);
        } else if (error.message === errorMessages[1]) {
          setErrorMessage(
            `A catalogue category with the same name already exists within the parent catalogue category. ${errorMessages[1]}`
          );
        }
      });
  }, [
    addCatalogueCategory,
    catalogueCategoryName,
    handleClose,
    isLeaf,
    parentId,
  ]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <TextField
          label="Name*"
          sx={{ marginLeft: '4px' }} // Adjusted the width and margin
          value={catalogueCategoryName}
          error={error}
          helperText={error && errorMessage}
          onChange={(event) => {
            setCatalogueCategoryName(
              event.target.value ? event.target.value : undefined
            );
            setError(false);
            setErrorMessage(undefined);
          }}
          fullWidth
        />
        <FormControl sx={{ margin: '8px' }}>
          <FormLabel id="controlled-radio-buttons-group">
            Catalogue Directory Content
          </FormLabel>
          <RadioGroup
            aria-labelledby="controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={isLeaf}
            onChange={(event, value) => {
              onChangeLeaf(value === 'true' ? true : false);
            }}
          >
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="Catalogue Categories"
            />
            <FormControlLabel
              value="true"
              control={<Radio />}
              label="Catalogue Items"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Divider />
          </Box>
          <Button
            variant="outlined"
            sx={{ alignSelf: 'center' }}
            disabled={!isLeaf}
            data-testid="add-fields-button"
          >
            <AddIcon />
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Divider />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            my: 2,
          }}
        >
          <Button
            variant="outlined"
            sx={{ width: '50%', mx: 1 }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            sx={{ width: '50%', mx: 1 }}
            onClick={handleCatalogueCategory}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddCatalogueCategoryDialog;
