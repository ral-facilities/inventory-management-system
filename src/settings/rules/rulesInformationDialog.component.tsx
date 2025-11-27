import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';

export interface RulesInformationDialogProps {
  open: boolean;
  onClose: () => void;
}

const RulesInformationDialog = (props: RulesInformationDialogProps) => {
  const { open, onClose } = props;

  return (
    <Dialog
      sx={{ zIndex: 1210 + 10 }}
      open={open}
      maxWidth="sm"
      disableEnforceFocus
      fullWidth
    >
      <DialogTitle>Rules Information</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Rules define what operations are possible for items in relation to
          systems.
          <p />
        </Typography>
        <Divider></Divider>
        <Typography variant="body1">
          <p />
          They are split into three categories:
          <p />
          <b>Creation:</b> These define which types of system's items can be
          created in, and what usage status they should have.
          <p />
          <b>Deletion:</b> These define which types of system's items can be
          deleted from. (They have no restriction on usage status).
          <p />
          <b>Moving:</b> These define which types of systems an item is allowed
          to move between and what usage status they should have once moved.
          <p />
          These rules are defined in terms of the source system's type,
          destination system's type, and usage status.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RulesInformationDialog;
