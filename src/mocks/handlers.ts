import { rest } from 'msw';
import CatalogueCategoryJSON from './CatalogueCategory.json';
import CatalogueItemJSON from './CatalogueItems.json';
import {
  AddCatalogueCategory,
  CatalogueItem,
  EditCatalogueCategory,
} from '../app.types';

export const handlers = [
  rest.post('/v1/catalogue-categories', async (req, res, ctx) => {
    const body = (await req.json()) as AddCatalogueCategory;

    if (body.name === 'test_dup') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A catalogue category with the same name already exists within the parent catalogue category',
        })
      );
    }

    if (body.name === 'Error 500') {
      return res(ctx.status(500), ctx.json(''));
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
  rest.patch('/v1/catalogue-categories/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = CatalogueCategoryJSON.filter(
      (catalogueCategory) => catalogueCategory.parent_id === id
    );
    const body = (await req.json()) as EditCatalogueCategory;
    if (body.name === 'test_dup') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A catalogue category with the same name already exists within the parent catalogue category',
        })
      );
    }

    if (data.length > 0) {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'Catalogue category has children elements and cannot be updated',
        })
      );
    }

    if (body.name === 'Error 500') {
      return res(ctx.status(500), ctx.json(''));
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

  rest.get('/v1/catalogue-categories/:id', (req, res, ctx) => {
    const { id } = req.params;

    const data = CatalogueCategoryJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    );

    return res(ctx.status(200), ctx.json(data));
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
  rest.post('/v1/catalogue-items', async (req, res, ctx) => {
    const body = (await req.json()) as CatalogueItem;

    if (body.name === 'test_dup') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A catalogue item with the same name already exists within the catalogue category',
        })
      );
    }
    if (body.name === 'Error 500') {
      return res(ctx.status(500), ctx.json(''));
    }
    return res(
      ctx.status(200),
      ctx.json({
        ...body,
        id: '1',
      })
    );
  }),

  rest.get('/v1/catalogue-items', (req, res, ctx) => {
    const catalogueItemsParams = req.url.searchParams;
    const id = catalogueItemsParams.get('catalogue_category_id');

    if (id) {
      const CatalogueItemData = CatalogueItemJSON.filter(
        (catalogueitem) => catalogueitem.catalogue_category_id === id
      );

      return res(ctx.status(200), ctx.json(CatalogueItemData));
    } else {
      return res(ctx.status(422), ctx.json(''));
    }
  }),
];
