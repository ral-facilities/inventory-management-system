import { rest } from 'msw';
import CatalogueCategoryJSON from './CatalogueCategory.json';
import ManufacturerJSON from './manufacturer.json';

export const handlers = [
  rest.post('/v1/catalogue-categories', async (req, res, ctx) => {
    const body = await req.text();
    if (body === '{"is_leaf":false}') {
      return res(ctx.status(422), ctx.json(''));
    } else if (body === '{"is_leaf":true}') {
      return res(ctx.status(422), ctx.json(''));
    } else if (body === '{"name":"test_dup","is_leaf":false}') {
      return res(ctx.status(409), ctx.json(''));
    } else if (body === '{"name":"test_dup","is_leaf":true}') {
      return res(ctx.status(409), ctx.json(''));
    }
    return res(
      ctx.status(200),
      ctx.json({
        name: 'test',
        parent_id: null,
        id: '1',
        code: 'test',
        path: '/test',
        parent_path: '/',
        is_leaf: false,
      })
    );
  }),

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
        (catalogueCategory) => catalogueCategory.parent_path === parentPath
      );
    }
    return res(ctx.status(200), ctx.json(data));
  }),

  rest.get('/v1/manufacturer', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(ManufacturerJSON));
  }),
];
