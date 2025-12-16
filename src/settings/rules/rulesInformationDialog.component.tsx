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
      boxShadow: 0,
      '&:before': { display: 'none' },
    },
  };

  const accordionSummaryProps = {
    expandIcon: <ExpandMoreOutlined />,
    sx: {
      flexDirection: 'row-reverse',
    },
  };

  const accordionDetailsProps = {
    sx: { ml: 3 },
  };

  return (
    <Accordion disableGutters {...accordionProps}>
      <AccordionSummary {...accordionSummaryProps}>
        <Typography>{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails {...accordionDetailsProps}>
        <Typography variant="body2">{details}</Typography>
      </AccordionDetails>
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
      maxWidth="sm"
      disableEnforceFocus
      fullWidth
    >
      <DialogTitle>Rules Information</DialogTitle>
      <DialogContent>
        <Typography>
          Rules define what operations are possible for items in relation to
          systems.
        </Typography>
        <Divider sx={{ my: 1 }}></Divider>
        <Typography sx={{ mb: 2 }}>
          They are split into three categories:
        </Typography>
        <Typography>
          <b>Creation:</b> These define which types of system&apos;s items can
          be created in, and what usage status they should have.
        </Typography>
        <AccordionContent
          summary="Example: Storage → 'New'"
          details="Items can be created in the system type 'Storage'. This rule sets
            the items usage status to 'New'."
        />
        <Typography>
          <b>Deletion:</b> These define which types of system&apos;s items can
          be deleted from. (They have no restriction on usage status).
        </Typography>
        <AccordionContent
          summary="Example: Storage"
          details="Items can be deleted from the system type 'Storage'."
        />
        <Typography>
          <b>Moving:</b> These define which types of systems an item is allowed
          to move between and what usage status they should have once moved.
        </Typography>
        <AccordionContent
          summary="Example: Storage → Operational → 'In Use'"
          details="Items can be moved from the system type 'Storage' to 'Operational'. This rule sets
            the items usage status to 'In Use'."
        />
        <Typography>
          These rules are defined in terms of the source system&apos;s type,
          destination system&apos;s type, and usage status.
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
