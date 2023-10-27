import { rest } from 'msw';
import {
  AddCatalogueCategory,
  CatalogueItem,
  EditCatalogueCategory,
  EditCatalogueItem,
  SystemPost,
} from '../app.types';
import CatalogueBreadcrumbsJSON from './CatalogueBreadcrumbs.json';
import CatalogueCategoryJSON from './CatalogueCategory.json';
import CatalogueItemJSON from './CatalogueItems.json';
import SystemBreadcrumbsJSON from './SystemBreadcrumbs.json';
import SystemsJSON from './Systems.json';

export const handlers = [
  // ------------------------------------ CATALOGUE CATEGORIES ------------------------------------
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
    const parentId = catalogueCategoryParams.get('parent_id');
    let data;

    if (parentId) {
      if (parentId === 'null') {
        data = CatalogueCategoryJSON.filter(
          (catalogueCategory) => catalogueCategory.parent_id === null
        );
      } else {
        data = CatalogueCategoryJSON.filter(
          (catalogueCategory) => catalogueCategory.parent_id === parentId
        );
      }
    }
    return res(ctx.status(200), ctx.json(data));
  }),

  rest.get('/v1/catalogue-categories/:id/breadcrumbs', (req, res, ctx) => {
    const { id } = req.params;
    const data = CatalogueBreadcrumbsJSON.find(
      (catalogueBreadcrumbs) => catalogueBreadcrumbs.id === id
    );
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
        return res(ctx.status(204));
      }
    } else {
      return res(ctx.status(400), ctx.json(''));
    }
  }),

  // ------------------------------------ CATALOGUE ITEMS ------------------------------------

  rest.post('/v1/catalogue-items/', async (req, res, ctx) => {
    const body = (await req.json()) as CatalogueItem;

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

  rest.get('/v1/catalogue-items/', async (req, res, ctx) => {
    const catalogueItemsParams = req.url.searchParams;
    const id = catalogueItemsParams.get('catalogue_category_id');

    if (id) {
      const CatalogueItemData = CatalogueItemJSON.filter(
        (catalogueItem) => catalogueItem.catalogue_category_id === id
      );

      return res(ctx.status(200), ctx.json(CatalogueItemData));
    } else {
      return res(ctx.status(422), ctx.json(''));
    }
  }),
  rest.get('/v1/catalogue-items/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id) {
      const CatalogueItemData = CatalogueItemJSON.find(
        (catalogueItem) => catalogueItem.id === id
      );
      return res(ctx.status(200), ctx.json(CatalogueItemData));
    }
    return res(ctx.status(422), ctx.json({}));
  }),
  rest.delete('/v1/catalogue-items/:id', (req, res, ctx) => {
    const { id } = req.params;
    const validCatalogueItem = CatalogueItemJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueItem) {
      if (id === '6') {
        return res(
          ctx.status(409),
          ctx.json({
            detail:
              'Catalogue item has children elements and cannot be deleted, please delete the children elements first',
          })
        );
      } else {
        return res(ctx.status(204));
      }
    } else {
      return res(ctx.status(400), ctx.json(''));
    }
  }),

  rest.patch('/v1/catalogue-items/:id', async (req, res, ctx) => {
    const body = (await req.json()) as EditCatalogueItem;
    const { id } = req.params;

    const validCatalogueItem = CatalogueItemJSON.find(
      (value) => value.id === id
    );

    if (body.name === 'test_has_children_elements') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'Catalogue item has children elements and cannot be edited, please delete the children elements first',
        })
      );
    }
    if (body.name === 'Error 500') {
      return res(ctx.status(500), ctx.json(''));
    }

    const newBody = {
      catalogue_category_id: validCatalogueItem?.catalogue_category_id,
      name: body.name ?? validCatalogueItem?.name,
      description: body.description ?? validCatalogueItem?.description,
      properties: body.properties ?? validCatalogueItem?.properties,
    };

    return res(
      ctx.status(200),
      ctx.json({
        ...newBody,
        id: id,
      })
    );
  }),

  // ------------------------------------ SYSTEMS ------------------------------------

  rest.get('/v1/systems', (req, res, ctx) => {
    const systemsParams = req.url.searchParams;
    const parentId = systemsParams.get('parent_id');
    let data;

    if (parentId) {
      if (parentId === 'null')
        data = SystemsJSON.filter((system) => system.parent_id === null);
      else data = SystemsJSON.filter((system) => system.parent_id === parentId);
    } else data = SystemsJSON;
    return res(ctx.status(200), ctx.json(data));
  }),

  rest.get('/v1/systems/:id/breadcrumbs', (req, res, ctx) => {
    const { id } = req.params;
    const data = SystemBreadcrumbsJSON.find(
      (systemBreadcrumbs) => systemBreadcrumbs.id === id
    );
    return res(ctx.status(200), ctx.json(data));
  }),

  rest.post('/v1/systems', async (req, res, ctx) => {
    const body = (await req.json()) as SystemPost;

    if (body.name === 'Error 409') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A System with the same name already exists within the same parent System',
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
];
