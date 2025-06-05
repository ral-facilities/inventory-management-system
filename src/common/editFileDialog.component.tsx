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
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  APIImage,
  AttachmentMetadata,
  AttachmentMetadataPatch,
  ImageMetadataPatch,
  ObjectFilePatchBase,
  type APIError,
} from '../api/api.types';
import { FileSchemaPatch } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import { getNameAndExtension } from '../utils';

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
    watch,
    setError,
    clearErrors,
    reset,
  } = useForm<ObjectFilePatchBase>({
    resolver: zodResolver(FileSchemaPatch),
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
            const response = error.response?.data as APIError;
            if (
              response.detail.includes(
                'file name already exists within the parent entity.'
              )
            ) {
              setError('file_name', {
                message:
                  'A file with the same name has been found. Please enter a different name.',
              });
              return;
            }
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
        <Stack width="100%" spacing={1} component="form">
          <Box sx={{ marginTop: '8px !important' }}>
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
          </Box>
          <Box>
            <TextField
              id="object-description-input"
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              multiline
            />
          </Box>
          <Box>
            <TextField
              id="object-title-input"
              label="Title"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
            />
          </Box>
        </Stack>
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
