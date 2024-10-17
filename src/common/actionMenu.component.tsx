import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import UploadIcon from '@mui/icons-material/Upload';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import UploadAttachmentsDialog from './attachments/uploadAttachmentsDialog.component';

export interface ActionMenuProps {
  ariaLabelPrefix: string;
  editMenuItem: { onClick: () => void; dialog: React.ReactNode };
  printMenuItem?: boolean;
  uploadAttachmentsEntityId?: string;
}
function ActionMenu(props: ActionMenuProps) {
  const {
    editMenuItem,
    printMenuItem,
    ariaLabelPrefix,
    uploadAttachmentsEntityId,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [openUploadAttachmentsDialog, setOpenUploadAttachmentsDialog] =
    React.useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid
      item
      xs={12}
      sm
      container
      sx={{
        textAlign: 'right',
        justifyContent: 'flex-end',
        alignItems: 'top',
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Grid item>
        <Typography variant="body1" sx={{ display: 'inline-block', mr: 1 }}>
          Actions
        </Typography>
        <IconButton
          onClick={handleMenuClick}
          sx={{
            border: '1px solid',
            borderRadius: 1,
            padding: '6px',
          }}
          aria-label={`${ariaLabelPrefix} actions menu`}
        >
          <ExpandMoreIcon />
        </IconButton>

        {/* Menu Component */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '@media print': {
              display: 'none',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              editMenuItem.onClick();
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {uploadAttachmentsEntityId && (
            <MenuItem
              onClick={() => {
                setOpenUploadAttachmentsDialog(true);
                handleMenuClose();
              }}
            >
              <UploadIcon fontSize="small" sx={{ mr: 1 }} />
              Upload Attachments
            </MenuItem>
          )}
          {printMenuItem && (
            <MenuItem
              onClick={() => {
                window.print();
                handleMenuClose();
              }}
            >
              <PrintIcon fontSize="small" sx={{ mr: 1 }} />
              Print
            </MenuItem>
          )}
        </Menu>
      </Grid>
      {editMenuItem.dialog}
      {uploadAttachmentsEntityId && (
        <UploadAttachmentsDialog
          open={openUploadAttachmentsDialog}
          onClose={() => setOpenUploadAttachmentsDialog(false)}
          entityId={uploadAttachmentsEntityId}
        />
      )}
    </Grid>
  );
}

export default ActionMenu;
