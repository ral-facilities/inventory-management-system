import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  CardActions,
  IconButton,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CatalogueCategory } from '../../app.types';
import { Link } from 'react-router-dom';

export interface CatalogueCardProps extends CatalogueCategory {
  onChangeOpenDeleteDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenEditDialog: (catalogueCategory: CatalogueCategory) => void;
  onToggleSelect: (catalogueCategory: CatalogueCategory) => void;
  isSelected: boolean;
}

function CatalogueCard(props: CatalogueCardProps) {
  const {
    onChangeOpenDeleteDialog,
    onChangeOpenEditDialog,
    onToggleSelect,
    isSelected,
    ...catalogueCategory
  } = props;

  const handleCheckboxClick = () => {
    onToggleSelect(catalogueCategory);
  };

  return (
    <Button
      component={Link}
      to={`${catalogueCategory.id}`}
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
              onChangeOpenEditDialog(catalogueCategory);
            }}
            aria-label={`edit ${catalogueCategory.name} catalogue category button`}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              onChangeOpenDeleteDialog(catalogueCategory);
            }}
            aria-label={`delete ${catalogueCategory.name} catalogue category button`}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
