import { rest } from 'msw';
import CatalogueCategoryJSON from './CatalogueCategory.json';

export const handlers = [
  rest.get('/v1/catalogue-categories/', (req, res, ctx) => {
    const catalogueCategoryParams = req.url.searchParams;
    const path = catalogueCategoryParams.get('path');
    const parentPath = catalogueCategoryParams.get('parent_path');
    let data;
    if (path) {
      data = CatalogueCategoryJSON.filter(
        (catalogueCategory) => catalogueCategory.path === path
      );
    } else if (parentPath) {
      data = CatalogueCategoryJSON.filter(
        (catalogueCategory) => catalogueCategory.parentPath === parentPath
      );
    }
    return res(ctx.status(200), ctx.json(data));
  }),
];
