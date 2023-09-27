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
import { ViewCatalogueCategoryResponse } from '../app.types';
import { Link } from 'react-router-dom';

export interface CatalogueCardProps extends ViewCatalogueCategoryResponse {
  onChangeOpenDeleteDialog: (
    catalogueCategory: ViewCatalogueCategoryResponse
  ) => void;
}
function CatalogueCard(props: CatalogueCardProps) {
  const mainContentRef = React.useRef<HTMLParagraphElement>(null);
  const { onChangeOpenDeleteDialog, ...catalogueCategory } = props;
  return (
    <Button
      component={Link}
      to={catalogueCategory.code}
      fullWidth
      relative="path"
      sx={{
        display: 'flex',
        backgroundColor: 'background.paper',
        width: '100%',
        margin: '1px',
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
              onChangeOpenDeleteDialog(catalogueCategory);
            }}
            data-testid="delete-catalogue-category-button"
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
