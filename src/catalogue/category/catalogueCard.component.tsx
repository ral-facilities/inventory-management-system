import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { CatalogueCategory } from '../../app.types';
import { OverflowTip, formatDateTimeStrings } from '../../utils';
export interface CatalogueCardProps extends CatalogueCategory {
  onChangeOpenDeleteDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenEditNameDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenEditPropertiesDialog: (
    catalogueCategory: CatalogueCategory
  ) => void;
  onChangeOpenDuplicateDialog: (catalogueCategory: CatalogueCategory) => void;
  onToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  isSelected: boolean;
}

function CatalogueCard(props: CatalogueCardProps) {
  const {
    onChangeOpenDeleteDialog,
    onChangeOpenEditNameDialog,
    onChangeOpenEditPropertiesDialog,
    onChangeOpenDuplicateDialog,
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
      to={catalogueCategory.id}
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
          flexDirection: 'row',
          height: '100px',
        }}
      >
        <CardActions>
          <Tooltip title = "Select">
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
          </Tooltip>
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
          <OverflowTip>{catalogueCategory.name}</OverflowTip>
        </CardContent>
        <CardActions>
          <Tooltip title = "Actions">
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
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClick={(event) => {
              event.preventDefault();
            }}
            onClose={handleActionsClose}
          >
            <MenuItem
              key={0}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenEditNameDialog(catalogueCategory);
                handleActionsClose();
              }}
              aria-label={`edit name ${catalogueCategory.name} catalogue category button`}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              Edit name
            </MenuItem>

            {catalogueCategory.is_leaf && (
              <MenuItem
                key={1}
                onClick={(event) => {
                  event.preventDefault();
                  onChangeOpenEditPropertiesDialog(catalogueCategory);
                  handleActionsClose();
                }}
                aria-label={`edit properties ${catalogueCategory.name} catalogue category button`}
                sx={{ m: 0 }}
              >
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                Edit properties
              </MenuItem>
            )}
            <MenuItem
              key={2}
              aria-label={`duplicate ${catalogueCategory.name} catalogue category button`}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenDuplicateDialog(catalogueCategory);
                handleActionsClose();
              }}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <SaveAsIcon />
              </ListItemIcon>
              Duplicate
            </MenuItem>
            <MenuItem
              key={3}
              onClick={(event) => {
                event.preventDefault();
                onChangeOpenDeleteDialog(catalogueCategory);
                handleActionsClose();
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
        <Typography
          fontSize="0.8rem"
          color="text.secondary"
          sx={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
          }}
        >
          {`Last modified: ${formatDateTimeStrings(catalogueCategory.modified_time, true)}`}
        </Typography>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
