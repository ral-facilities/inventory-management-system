import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

export interface HistoryCommentProps {
  open: boolean;
  onSubmit: (event: React.SyntheticEvent) => void;
  onChange: UseFormRegisterReturn | ((modifiedComment: string) => void);
  onCancel: () => void;
  action: 'editing' | 'adding' | 'moving';
  entityTypeName: 'Item' | 'Items';
}

const HistoryCommentDialog = (props: HistoryCommentProps) => {
  const { open, onSubmit, onChange, onCancel, action, entityTypeName } = props;

  const [comment, setComment] = React.useState<string>('');
  const [commentError, setCommentError] = React.useState<string | undefined>(
    undefined
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
    setCommentError(undefined);

    if (typeof onChange === 'function') onChange(event.target.value);
    else onChange.onChange(event);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    if (!comment.trim()) {
      setCommentError('Please enter a comment.');
      return;
    }

    onSubmit(event);
  };

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {`Please add a comment to justify ${action} ${entityTypeName.endsWith('s') ? 'these' : 'this'} ${entityTypeName}`}
      </DialogTitle>
      <DialogContent>
        <Stack
          spacing={1}
          component="form"
          sx={{
            width: '100%',
          }}
        >
          <Box sx={{ marginTop: '8px !important' }}>
            <TextField
              id="comment-input"
              label="Comment"
              required
              size="small"
              multiline
              minRows={3}
              {...(typeof onChange === 'function' ? {} : onChange)}
              value={comment}
              onChange={handleChange}
              error={!!commentError}
              helperText={commentError}
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
            justifyContent: 'right',
            width: '100%',
            my: 2,
          }}
        >
          <Button sx={{ width: '25%' }} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!!commentError}
            variant="outlined"
            sx={{ width: '25%', mx: 1 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryCommentDialog;
