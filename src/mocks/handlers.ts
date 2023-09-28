import { rest } from 'msw';
import CatalogueCategoryJSON from './CatalogueCategory.json';
import ManufacturerJSON from './manufacturer.json';
import { AddCatalogueCategory, AddManufacturer } from '../app.types';

export const handlers = [
  rest.post('/v1/catalogue-categories', async (req, res, ctx) => {
    const body = (await req.json()) as AddCatalogueCategory;

    if (!body.name) {
      return res(ctx.status(422), ctx.json(''));
    } else if (body.name === 'test_dup') {
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

  rest.post('/v1/manufacturer', async (req, res, ctx) => {
    const body = (await req.json()) as AddManufacturer;

    if (!body.name) {
      return res(ctx.status(422), ctx.json(''));
    } else if (!body.url) {
      return res(ctx.status(422), ctx.json(''));
    } else if (!body.address) {
      return res(ctx.status(422), ctx.json(''));
    } else if (body.name === 'Manufacturer A') {
      return res(ctx.status(409), ctx.json(''));
    }

    return res(
      ctx.status(200),
      ctx.json({
        name: 'Manufacturer D',
        code: 'manufacturer-d',
        url: 'http://test.co.uk',
        address: '13 My Street',
        id: '4',
      })
    );
  }),

  rest.delete('/v1/catalogue-categories/:id', (req, res, ctx) => {
    const { id } = req.params;
    const validCatalogueCategory = CatalogueCategoryJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueCategory) {
      if (id === '2') {
        return res(
          ctx.status(409),
          ctx.json({
            detail:
              'Catalogue category has children elements and cannot be deleted',
          })
        );
      } else {
        return res(ctx.status(200), ctx.json(''));
      }
    } else {
      return res(ctx.status(400), ctx.json(''));
    }
  }),
];
