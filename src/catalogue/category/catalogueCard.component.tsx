import React, { useState } from 'react';
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
  const [hovered, setHovered] = useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          height: '100px', // Set a fixed height for all cards
        }}
      >
        <CardActions
          onTouchEnd={(event) => {
            event.preventDefault(); // Prevent the default touch behavior
            handleCheckboxClick();
          }}
          sx={{ display: 'flex' }}
          aria-label={`${catalogueCategory.name} checkbox area`}
        >
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
            sx={{
              visibility: isSelected || hovered ? 'visible' : 'hidden', // Show Checkbox when selected or on hover
            }}
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
          <div aria-label="main-content">
            <Typography aria-label="card-name">
              {catalogueCategory.name}
            </Typography>
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
