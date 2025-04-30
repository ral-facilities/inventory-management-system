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
  InputAdornment,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';

import React from 'react';

import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  APIImage,
  AttachmentMetadata,
  AttachmentMetadataPatch,
  ImageMetadataPatch,
  ObjectFilePatchBase,
} from '../api/api.types';
import { FileSchemaPatch } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import {
  createFormControlWithRootErrorClearing,
  getNameAndExtension,
} from '../utils';

const formControl =
  createFormControlWithRootErrorClearing<ObjectFilePatchBase>();
export interface BaseFileDialogProps {
  open: boolean;
  onClose: () => void;
  fileType: 'Image' | 'Attachment';
}

export interface ImageDialogProps extends BaseFileDialogProps {
  fileType: 'Image';
  selectedFile: APIImage;
  usePatchFile: () => UseMutationResult<
    APIImage,
    AxiosError,
    { id: string; fileMetadata: ImageMetadataPatch }
  >;
}

export interface AttachmentDialogProps extends BaseFileDialogProps {
  fileType: 'Attachment';
  selectedFile: AttachmentMetadata;
  usePatchFile: () => UseMutationResult<
    AttachmentMetadata,
    AxiosError,
    { id: string; fileMetadata: AttachmentMetadataPatch }
  >;
}

export type FileDialogProps = ImageDialogProps | AttachmentDialogProps;

const EditFileDialog = (props: FileDialogProps) => {
  const { open, onClose, selectedFile, fileType, usePatchFile } = props;

  const { mutateAsync: patchFile, isPending: isEditPending } = usePatchFile();

  const [initialName, extension] = getNameAndExtension(selectedFile.file_name);

  const initialFile = React.useMemo<ObjectFilePatchBase>(() => {
    return {
      ...selectedFile,
      file_name: initialName,
    };
  }, [selectedFile, initialName]);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<ObjectFilePatchBase>({
    formControl,
    resolver: zodResolver(FileSchemaPatch),
    defaultValues: initialFile,
  });

  // Load the values for editing
  React.useEffect(() => {
    reset(initialFile);
  }, [initialFile, reset]);

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const handleEditFile = React.useCallback(
    (fileData: ObjectFilePatchBase) => {
      const isFileNameUpdated = fileData.file_name !== initialFile.file_name;

      const isDescriptionUpdated =
        fileData.description !== initialFile.description;

      const isTitleUpdated = fileData.title !== initialFile.title;

      const fileToEdit: ObjectFilePatchBase = {};

      if (isFileNameUpdated)
        fileToEdit.file_name = fileData.file_name + extension;
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
    },
    [initialFile, selectedFile, extension, patchFile, handleClose, setError]
  );

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{extension}</InputAdornment>
                ),
              }}
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
              multiline
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
