import React from 'react';
import { useCatalogueCategory } from '../api/catalogueCategory';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import CatalogueCard from './catalogueCard.component';

function Catalogue() {
  const location = useLocation();

  const catalogueLocation = location.pathname.replace('/catalogue', '');

  const { data: catalogueCategoryData } = useCatalogueCategory(
    undefined,
    catalogueLocation === '' ? '/' : catalogueLocation
  );

  return (
    <Grid container spacing={2}>
      {catalogueCategoryData &&
        catalogueCategoryData.map((item, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <CatalogueCard {...item} />
          </Grid>
        ))}
    </Grid>
  );
}

export default Catalogue;
