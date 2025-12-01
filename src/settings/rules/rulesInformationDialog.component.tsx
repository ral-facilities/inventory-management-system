import { ExpandMoreOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';

interface RuleAccordionProps {
  summary: string;
  details: string;
}

const AccordionContent = ({ summary, details }: RuleAccordionProps) => {
  const accordionProps = {
    sx: {
      marginLeft: 3,
      boxShadow: 0,
      '&:before': { display: 'none' },
    },
  };

  const accordionSummaryProps = {
    expandIcon: <ExpandMoreOutlined sx={{ marginRight: 2 }} />,
    sx: {
      flexDirection: 'row-reverse',
    },
  };

  const accordionDetailsProps = {
    sx: { marginLeft: 5, fontSize: '0.9rem' },
  };

  return (
    <Accordion {...accordionProps}>
      <AccordionSummary {...accordionSummaryProps}>{summary}</AccordionSummary>
      <AccordionDetails {...accordionDetailsProps}>{details}</AccordionDetails>
    </Accordion>
  );
};

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
      maxWidth="md"
      disableEnforceFocus
      fullWidth
    >
      <DialogTitle>Rules Information</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Rules define what operations are possible for items in relation to
          systems.
          <p />
          <Divider></Divider>
          <p />
          They are split into three categories:
          <p />
          <b>Creation:</b> These define which types of system's items can be
          created in, and what usage status they should have.
          <AccordionContent
            summary="Example: Storage → 'New'"
            details="Items can be created in the system type 'Storage'. This would set
            the items usage status to 'New'."
          />
          <p />
          <b>Deletion:</b> These define which types of system's items can be
          deleted from. (They have no restriction on usage status).
          <AccordionContent
            summary="Example: Storage"
            details="Items can be deleted from the system type 'Storage'."
          />
          <p />
          <b>Moving:</b> These define which types of systems an item is allowed
          to move between and what usage status they should have once moved.
          <AccordionContent
            summary="Example: Storage → Operational → 'In Use'"
            details="Items can be moved from the system type 'Storage' to 'Operational'. This would set
            the items usage status to 'In Use'."
          />
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
