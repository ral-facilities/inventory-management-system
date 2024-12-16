import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';

import React from 'react';

import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIImage, ObjectFilePatch } from '../../api/api.types';
import { FileSchema } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface FileDialogProps {
  open: boolean;
  onClose: () => void;
  selectedFile?: APIImage;
  fileType: 'Image' | 'Attachment';
  usePatchFile: () => UseMutationResult<
    APIImage,
    AxiosError,
    { id: string; fileMetadata: ObjectFilePatch }
  >;
}

const EditFileDialog = (props: FileDialogProps) => {
  const { open, onClose, selectedFile, fileType, usePatchFile } = props;

  const { mutateAsync: patchFile, isPending: isEditPending } = usePatchFile();

  const initialFile: ObjectFilePatch = React.useMemo(
    () =>
      selectedFile ?? {
        file_name: '',
        title: '',
        description: '',
      },
    [selectedFile]
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    reset,
  } = useForm<ObjectFilePatch>({
    resolver: zodResolver(FileSchema('patch')),
    defaultValues: initialFile,
  });

  // Load the values for editing
  React.useEffect(() => {
    reset(initialFile);
  }, [initialFile, reset]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    if (errors.root?.formError) {
      const subscription = watch(() => clearErrors('root.formError'));
      return () => subscription.unsubscribe();
    }
  }, [clearErrors, errors, selectedFile, watch]);

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const handleEditFile = React.useCallback(
    (fileData: ObjectFilePatch) => {
      if (selectedFile) {
        const isFileNameUpdated = fileData.file_name !== selectedFile.file_name;

        const isDescriptionUpdated =
          fileData.description !== selectedFile.description;

        const isTitleUpdated = fileData.title !== selectedFile.title;

        let fileToEdit: ObjectFilePatch = {};

        if (isFileNameUpdated) fileToEdit.file_name = fileData.file_name;
        if (isDescriptionUpdated) fileToEdit.description = fileData.description;
        if (isTitleUpdated) fileToEdit.title = fileData.title;

        if (isFileNameUpdated || isDescriptionUpdated || isTitleUpdated) {
          patchFile({
            id: selectedFile.id,
            fileMetadata: fileToEdit,
          })
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              handleIMS_APIError(error);
            });
        } else {
          setError('root.formError', {
            message:
              "There have been no changes made. Please change a field's value or press Cancel to exit.",
          });
        }
      }
    },
    [selectedFile, patchFile, handleClose, setError]
  );

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>{`Edit ${fileType}`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1} component="form">
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="object-file-name-input"
              label="File Name"
              required
              {...register('file_name')}
              error={!!errors.file_name}
              helperText={errors.file_name?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="object-description-input"
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="object-title-input"
              label="Title"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', padding: '0px 24px' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
        ></Box>
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
            onClick={handleSubmit(handleEditFile)}
            disabled={Object.values(errors).length !== 0 || isEditPending}
            endIcon={isEditPending ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
        </Box>
        {errors.root?.formError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {errors.root?.formError.message}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditFileDialog;
