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

import { AxiosError } from 'axios';
import { APIImage, ImagePatch } from '../../api/api.types';
import { usePatchImage } from '../../api/images';
import { ImagesSchema } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  selectedImage: APIImage;
}

const editImageDialog = (props: ImageDialogProps) => {
  const { open, onClose, selectedImage } = props;

  const { mutateAsync: patchImage, isPending: isEditPending } = usePatchImage();

  const initalImage: ImagePatch = React.useMemo(
    () => selectedImage,
    [selectedImage]
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    reset,
  } = useForm<ImagePatch>({
    resolver: zodResolver(ImagesSchema('patch')),
    defaultValues: initalImage,
  });

  // Load the values for editing
  React.useEffect(() => {
    reset(initalImage);
  }, [initalImage, reset]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    if (errors.root?.formError) {
      const subscription = watch(() => clearErrors('root.formError'));
      return () => subscription.unsubscribe();
    }
  }, [clearErrors, errors, selectedImage, watch]);

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const handleEditImage = React.useCallback(
    (imageData: ImagePatch) => {
      if (selectedImage) {
        const isFileNameUpdated =
          imageData.file_name !== selectedImage.file_name;

        const isDescriptionUpdated =
          imageData.description !== selectedImage.description;

        const isTitleUpdated = imageData.title !== selectedImage.title;

        let imageToEdit: ImagePatch = {};

        if (isFileNameUpdated) imageToEdit.file_name = imageData.file_name;
        if (isDescriptionUpdated)
          imageToEdit.description = imageData.description;
        if (isTitleUpdated) imageToEdit.title = imageData.title;

        if (isFileNameUpdated || isDescriptionUpdated || isTitleUpdated) {
          patchImage({
            id: selectedImage.id,
            image: imageToEdit,
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
    [selectedImage, patchImage, handleClose, setError]
  );

  const onSubmit = (data: ImagePatch) => {
    handleEditImage(data);
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>{`Edit Image`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1} component="form">
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="image-file-name-input"
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
              id="image-description-input"
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="image-title-input"
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
            onClick={handleSubmit(onSubmit)}
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

export default editImageDialog;
