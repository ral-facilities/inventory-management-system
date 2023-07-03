import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { ViewCatalogueCategoryResponse } from '../app.types';
import { Link } from 'react-router-dom';

export interface CatalogueCardProps extends ViewCatalogueCategoryResponse {}
function CatalogueCard(props: CatalogueCardProps) {
  const mainContentRef = React.useRef<HTMLParagraphElement>(null);

  return (
    <Button
      component={Link}
      to={props.code}
      fullWidth
      relative="path"
      sx={{
        display: 'flex',
        // NOTE: This is the maximum width for the card (it will only use this even if you set the mainWidth to a greater value).
        // maxWidth: '300px',
        backgroundColor: 'background.paper',
        width: '100%',
        margin: '1px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ width: '100%', minWidth: 0 }}>
          <Box>
            <div aria-label="main-content" ref={mainContentRef}>
              <Typography aria-label="card-name" noWrap>
                {props.name}
              </Typography>
            </div>
          </Box>
        </CardContent>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
