import { rest } from 'msw';
import {
  AddItem,
  AddSystem,
  CatalogueItem,
  EditCatalogueCategory,
  EditCatalogueItem,
  EditManufacturer,
  EditSystem,
  Manufacturer,
} from '../app.types';
import CatalogueBreadcrumbsJSON from './CatalogueBreadcrumbs.json';
import CatalogueCategoryJSON from './CatalogueCategory.json';
import CatalogueItemJSON from './CatalogueItems.json';
import SystemBreadcrumbsJSON from './SystemBreadcrumbs.json';
import SystemsJSON from './Systems.json';
import ManufacturerJSON from './manufacturer.json';
import ItemsJSON from './Items.json';

export const handlers = [
  // ------------------------------------ CATALOGUE CATEGORIES ------------------------------------
  rest.post('/v1/catalogue-categories', async (req, res, ctx) => {
    let body = await req.json();

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

    if (!body.parent_id) {
      body = {
        ...body,
        parent_id: null,
      };
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        ...body,
      })
    );
  }),
  rest.patch('/v1/catalogue-categories/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const itemData = CatalogueItemJSON.filter(
      (catalogueItem) => catalogueItem.catalogue_category_id === id
    );

    const catalogueData = CatalogueCategoryJSON.filter(
      (catalogueData) => catalogueData.parent_id === id
    );

    const obj = CatalogueCategoryJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    );
    const body = (await req.json()) as EditCatalogueCategory;

    const fullBody = { ...obj, ...body };
    if (fullBody.name === 'test_dup') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A catalogue category with the same name already exists within the parent catalogue category',
        })
      );
    }
    if (body.catalogue_item_properties !== undefined) {
      if (itemData.length > 0) {
        return res(
          ctx.status(409),
          ctx.json({
            detail:
              'Catalogue category has child elements and cannot be updated',
          })
        );
      } else if (catalogueData.length > 0) {
        return res(
          ctx.status(409),
          ctx.json({
            detail:
              'Catalogue category has child elements and cannot be updated',
          })
        );
      }
    }

    if (fullBody.name === 'Error 500') {
      return res(ctx.status(500), ctx.json(''));
    }
    return res(ctx.status(200), ctx.json(fullBody));
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
  rest.post('/v1/catalogue-items/', async (req, res, ctx) => {
    const body = (await req.json()) as CatalogueItem;

    if (
      body.name === 'Error 500' ||
      body.catalogue_category_id === 'Error 500'
    ) {
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
    if (
      body.name === 'Error 500' ||
      body.obsolete_reason === 'Error 500' ||
      body.catalogue_category_id === 'Error 500'
    )
      return res(ctx.status(500), ctx.json(''));

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

  // ------------------------------------ MANUFACTURERS ------------------------------------

  rest.get('/v1/manufacturers', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(ManufacturerJSON));
  }),

  rest.get('/v1/manufacturers/:id', (req, res, ctx) => {
    const { id } = req.params;

    const data = ManufacturerJSON.find(
      (manufacturer) => manufacturer.id === id
    );

    return res(ctx.status(200), ctx.json(data));
  }),

  rest.post('/v1/manufacturers', async (req, res, ctx) => {
    const body = (await req.json()) as Manufacturer;

    if (body.name === 'Manufacturer A') {
      return res(ctx.status(409), ctx.json(''));
    }

    return res(
      ctx.status(200),
      ctx.json({
        name: 'Manufacturer D',
        code: 'manufacturer-d',
        url: 'http://test.co.uk',
        address: {
          address_line: '4 Example Street',
          country: 'United Kingdom',
          town: 'Oxford',
          county: 'Oxfordshire',
          postcode: 'OX1 2AB',
        },
        telephone: '07349612203',
        id: '4',
      })
    );
  }),

  rest.delete('/v1/manufacturers/:id', (req, res, ctx) => {
    const { id } = req.params;
    const validManufacturer = ManufacturerJSON.find((value) => value.id === id);
    if (validManufacturer) {
      if (id === '2') {
        return res(
          ctx.status(409),
          ctx.json({
            detail: 'The specified manufacturer is a part of a Catalogue Item',
          })
        );
      } else {
        return res(ctx.status(200), ctx.json(''));
      }
    } else {
      return res(ctx.status(400), ctx.json(''));
    }
  }),

  rest.patch('/v1/manufacturers/:id', async (req, res, ctx) => {
    const body = (await req.json()) as EditManufacturer;

    if (body.name === 'test_dup') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A manufacturer with the same name has been found. Please enter a different name',
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
        address: {
          building_number: '100',
          street_name: 'test',
          town: 'test',
          county: 'test',
          postcode: 'test',
        },
        telephone: '0000000000',
        id: '1',
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

  rest.get('/v1/systems/:id', (req, res, ctx) => {
    const { id } = req.params;
    const data = SystemsJSON.find((system) => system.id === id);
    if (data !== undefined) return res(ctx.status(200), ctx.json(data));
    else
      return res(
        ctx.status(404),
        ctx.json({ detail: 'A System with such ID was not found' })
      );
  }),

  rest.get('/v1/systems/:id/breadcrumbs', (req, res, ctx) => {
    const { id } = req.params;
    const data = SystemBreadcrumbsJSON.find(
      (systemBreadcrumbs) => systemBreadcrumbs.id === id
    );
    return res(ctx.status(200), ctx.json(data));
  }),

  rest.post('/v1/systems', async (req, res, ctx) => {
    const body = (await req.json()) as AddSystem;

    if (body.name === 'Error 409') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A System with the same name already exists within the same parent System',
        })
      );
    } else if (body.name === 'Error 500')
      return res(ctx.status(500), ctx.json(''));
    return res(
      ctx.status(200),
      ctx.json({
        ...body,
        id: '1',
      })
    );
  }),

  rest.patch('/v1/systems/:id', async (req, res, ctx) => {
    const body = (await req.json()) as EditSystem;

    const { id } = req.params;
    if (body.name === 'Error 409' || id === 'Error 409') {
      return res(
        ctx.status(409),
        ctx.json({
          detail:
            'A System with the same name already exists within the same parent System',
        })
      );
    } else if (body.name === 'Error 500')
      return res(ctx.status(500), ctx.json(''));

    const validSystem = SystemsJSON.find((value) => value.id === id);

    if (validSystem) {
      return res(ctx.status(200), ctx.json({ ...validSystem, ...body }));
    } else return res(ctx.status(404), ctx.json(''));
  }),

  rest.delete('/v1/systems/:id', (req, res, ctx) => {
    const { id } = req.params;
    const validSystem = SystemsJSON.find((value) => value.id === id);
    if (validSystem) {
      if (SystemsJSON.find((value) => value.parent_id === validSystem.id)) {
        return res(
          ctx.status(409),
          ctx.json({
            detail: 'System has child elements and cannot be deleted',
          })
        );
      } else {
        return res(ctx.status(204));
      }
    } else {
      return res(ctx.status(404), ctx.json(''));
    }
  }),
  // ------------------------------------ ITEMS ------------------------------------------------
  rest.post('/v1/items/', async (req, res, ctx) => {
    const body = (await req.json()) as AddItem;

    if (body.serial_number === 'Error 500') {
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

  rest.get('/v1/items/', (req, res, ctx) => {
    const itemsParams = req.url.searchParams;
    const catalogueItemId = itemsParams.get('catalogue_item_id');
    const systemId = itemsParams.get('system_id');
    let data;

    if (catalogueItemId) {
      data = ItemsJSON.filter(
        (items) => items.catalogue_item_id === catalogueItemId
      );
    }

    if (systemId) {
      data = ItemsJSON.filter((items) => items.system_id === systemId);
    }

    return res(ctx.status(200), ctx.json(data));
  }),
  rest.get('/v1/items/:id', (req, res, ctx) => {
    const { id } = req.params;

    const data = ItemsJSON.find((items) => items.id === id);

    return res(ctx.status(200), ctx.json(data));
  }),
  rest.delete('/v1/items/:id', (req, res, ctx) => {
    const { id } = req.params;

    if (id === 'Error 500') return res(ctx.status(500));

    return res(ctx.status(204));
  }),
];
