import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  CardActions,
  IconButton,
  Checkbox,
  MenuItem,
  ListItemIcon,
  Menu,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { CatalogueCategory } from '../../app.types';
import { Link } from 'react-router-dom';
export interface CatalogueCardProps extends CatalogueCategory {
  onChangeOpenDeleteDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenEditDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenSaveAsDialog: (catalogueCategory: CatalogueCategory) => void;
  onToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  isSelected: boolean;
}

function CatalogueCard(props: CatalogueCardProps) {
  const {
    onChangeOpenDeleteDialog,
    onChangeOpenEditDialog,
    onChangeOpenSaveAsDialog,
    onToggleSelect,
    isSelected,
    ...catalogueCategory
  } = props;

  const handleCheckboxClick = () => {
    onToggleSelect(catalogueCategory);
  };

  const handleActionsClose = () => {
    setMenuOpen(false);
  };

  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Button
      component={Link}
      to={menuOpen ? '' : `${catalogueCategory.id}`}
      fullWidth
      sx={{
        display: 'flex',
        width: '100%',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative', // Make the parent container relative
      }}
    >
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          height: '100px', // Set a fixed height for all cards
        }}
      >
        <CardActions>
          <Checkbox
            onClick={(event) => {
              event.preventDefault();
              handleCheckboxClick();
            }}
            checked={isSelected}
            inputProps={{
              'aria-label': 'controlled',
            }}
            aria-label={`${catalogueCategory.name} checkbox`}
          />
        </CardActions>
        <CardContent
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <div>
            <Typography>{catalogueCategory.name}</Typography>
          </div>
        </CardContent>
        <CardActions>
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              setAnchorEl(event.currentTarget);
              setMenuOpen(true);
            }}
            aria-label={`actions ${catalogueCategory.name} catalogue category button`}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleActionsClose}
          >
            <MenuItem
              key={0}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenEditDialog(catalogueCategory);
                setMenuOpen(false);
              }}
              aria-label={`edit ${catalogueCategory.name} catalogue category button`}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              Edit
            </MenuItem>
            <MenuItem
              key={1}
              aria-label={`save as ${catalogueCategory.name} catalogue category button`}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenSaveAsDialog(catalogueCategory);
                setMenuOpen(false);
              }}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <SaveAsIcon />
              </ListItemIcon>
              Save as
            </MenuItem>
            <MenuItem
              key={2}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenDeleteDialog(catalogueCategory);
                setMenuOpen(false);
              }}
              aria-label={`delete ${catalogueCategory.name} catalogue category button`}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              Delete
            </MenuItem>
          </Menu>
        </CardActions>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
