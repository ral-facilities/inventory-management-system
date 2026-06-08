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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: UseFormRegisterReturn<any>;
  action: 'editing' | 'adding' | 'moving';
  entityTypeName: 'Item' | 'Items';
}

const HistoryCommentDialog = (props: HistoryCommentProps) => {
  const { open, onSubmit, onChange, action, entityTypeName } = props;

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
              {...onChange}
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
          <Button
            variant="outlined"
            sx={{ width: '25%', mx: 1 }}
            onClick={(event) => onSubmit(event)}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryCommentDialog;
