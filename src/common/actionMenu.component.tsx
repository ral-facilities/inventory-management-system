import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import UploadIcon from '@mui/icons-material/Upload';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import UploadAttachmentsDialog from './attachments/uploadAttachmentsDialog.component';
import UploadImagesDialog from './images/uploadImagesDialog.component';
import { StyledUppyBox } from './uppy.utils';

export interface ActionMenuProps {
  ariaLabelPrefix: string;
  editMenuItem: { onClick: () => void; dialog: React.ReactNode };
  printMenuItem?: boolean;
  uploadAttachmentsEntityId?: string;
  uploadImagesEntityId?: string;
}
function ActionMenu(props: ActionMenuProps) {
  const {
    editMenuItem,
    printMenuItem,
    ariaLabelPrefix,
    uploadAttachmentsEntityId,
    uploadImagesEntityId,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [openUploadDialog, setOpenUploadDialog] = React.useState<
    'images' | 'attachments' | false
  >(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid
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
      <Grid>
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
          {uploadImagesEntityId && (
            <MenuItem
              onClick={() => {
                setOpenUploadDialog('images');
                handleMenuClose();
              }}
            >
              <UploadIcon fontSize="small" sx={{ mr: 1 }} />
              Upload Images
            </MenuItem>
          )}
          {uploadAttachmentsEntityId && (
            <MenuItem
              onClick={() => {
                setOpenUploadDialog('attachments');
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
      <StyledUppyBox>
        {uploadAttachmentsEntityId && (
          <UploadAttachmentsDialog
            open={openUploadDialog === 'attachments'}
            onClose={() => setOpenUploadDialog(false)}
            entityId={uploadAttachmentsEntityId}
          />
        )}
        {uploadImagesEntityId && (
          <UploadImagesDialog
            open={openUploadDialog === 'images'}
            onClose={() => setOpenUploadDialog(false)}
            entityId={uploadImagesEntityId}
          />
        )}
      </StyledUppyBox>
    </Grid>
  );
}

export default ActionMenu;
