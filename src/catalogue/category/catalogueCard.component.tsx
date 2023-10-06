import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  CardActions,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CatalogueCategory } from '../../app.types';
import { Link } from 'react-router-dom';

export interface CatalogueCardProps extends CatalogueCategory {
  onChangeOpenDeleteDialog: (catalogueCategory: CatalogueCategory) => void;
  onChangeOpenEditDialog: (catalogueCategory: CatalogueCategory) => void;
}
function CatalogueCard(props: CatalogueCardProps) {
  const mainContentRef = React.useRef<HTMLParagraphElement>(null);
  const {
    onChangeOpenDeleteDialog,
    onChangeOpenEditDialog,
    ...catalogueCategory
  } = props;

  return (
    <Button
      component={Link}
      to={`${catalogueCategory.code}`}
      fullWidth
      relative="path"
      sx={{
        display: 'flex',
        width: '100%',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Card sx={{ width: '100%', display: 'flex' }}>
        <CardContent sx={{ width: '100%', minWidth: 0 }}>
          <div aria-label="main-content" ref={mainContentRef}>
            <Typography aria-label="card-name" noWrap>
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
