import { http, HttpResponse } from 'msw';
import {
  AddItem,
  AddSystem,
  CatalogueItem,
  EditCatalogueCategory,
  EditCatalogueItem,
  EditItem,
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
import unitsJSON from './units.json';

export const handlers = [
  // ------------------------------------ CATALOGUE CATEGORIES ------------------------------------
  http.post('/v1/catalogue-categories', async ({ request }) => {
    let body = await request.json();

    if (body.name === 'test_dup') {
        return HttpResponse.json({
            detail:
                'A catalogue category with the same name already exists within the parent catalogue category',
        }, { status: 409 });
    }

    if (body.name === 'Error 500') {
        return HttpResponse.json('', { status: 500 });
    }

    if (!body.parent_id) {
      body = {
        ...body,
        parent_id: null,
      };
    }

      return HttpResponse.json({
          id: '1',
          ...body,
      }, { status: 200 });
  }),
  http.patch('/v1/catalogue-categories/:id', async ({ request, params }) => {
    const { id } = params;
    const itemData = CatalogueItemJSON.filter(
      (catalogueItem) => catalogueItem.catalogue_category_id === id
    );

    const catalogueData = CatalogueCategoryJSON.filter(
      (catalogueData) => catalogueData.parent_id === id
    );

    const obj = CatalogueCategoryJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    );
    const body = (await request.json()) as EditCatalogueCategory;

    const fullBody = { ...obj, ...body };

    if (fullBody.name === 'test_dup') {
        return HttpResponse.json({
            detail:
                'A catalogue category with the same name already exists within the parent catalogue category',
        }, { status: 409 });
    }
    if (body.catalogue_item_properties !== undefined) {
      if (itemData.length > 0) {
          return HttpResponse.json({
              detail:
                  'Catalogue category has child elements and cannot be updated',
          }, { status: 409 });
      } else if (catalogueData.length > 0) {
          return HttpResponse.json({
              detail:
                  'Catalogue category has child elements and cannot be updated',
          }, { status: 409 });
      }
    }

    if (fullBody.name === 'Error 500') {
        return HttpResponse.json('', { status: 500 });
    }
      return HttpResponse.json(fullBody, { status: 200 });
  }),

  http.get('/v1/catalogue-categories/:id', ({ params }) => {
    const { id } = params;

    const data = CatalogueCategoryJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    );

      return HttpResponse.json(data, { status: 200 });
  }),

  http.get('/v1/catalogue-categories', ({ request }) => {
      const url = new URL(request.url);
    const catalogueCategoryParams = url.searchParams;
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

      return HttpResponse.json(data, { status: 200 });
  }),

  http.get('/v1/catalogue-categories/:id/breadcrumbs', ({ params }) => {
    const { id } = params;
    const data = CatalogueBreadcrumbsJSON.find(
      (catalogueBreadcrumbs) => catalogueBreadcrumbs.id === id
    );
      return HttpResponse.json(data, { status: 200 });
  }),

  http.delete('/v1/catalogue-categories/:id', ({ params }) => {
    const { id } = params;
    const validCatalogueCategory = CatalogueCategoryJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueCategory) {
      if (id === '2') {
          return HttpResponse.json({
              detail:
                  'Catalogue category has children elements and cannot be deleted',
          }, { status: 409 });
      } else {
          return HttpResponse.json(null, { status: 204 });
      }
    } else {
        return HttpResponse.json('', { status: 400 });
    }
  }),

  // ------------------------------------ CATALOGUE ITEMS ------------------------------------

  http.delete('/v1/catalogue-categories/:id', ({ params }) => {
    const { id } = params;
    const validCatalogueCategory = CatalogueCategoryJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueCategory) {
      if (id === '2') {
          return HttpResponse.json({
              detail:
                  'Catalogue category has children elements and cannot be deleted',
          }, { status: 409 });
      } else {
          return HttpResponse.json(null, { status: 204 });
      }
    } else {
        return HttpResponse.json('', { status: 400 });
    }
  }),
  http.post('/v1/catalogue-items', async ({ request }) => {
    const body = (await request.json()) as CatalogueItem;

    if (
      body.name === 'Error 500' ||
      body.catalogue_category_id === 'Error 500'
    ) {
        return HttpResponse.json('', { status: 500 });
    }

      return HttpResponse.json({
          ...body,
          id: '1',
      }, { status: 200 });
  }),

  http.get('/v1/catalogue-items', async ({ request }) => {
      const url = new URL(request.url);
    const catalogueItemsParams = url.searchParams;
    const id = catalogueItemsParams.get('catalogue_category_id');

    if (id) {
      const CatalogueItemData = CatalogueItemJSON.filter(
        (catalogueItem) => catalogueItem.catalogue_category_id === id
      );

        return HttpResponse.json(CatalogueItemData, { status: 200 });
    } else {
        return HttpResponse.json('', { status: 422 });
    }
  }),
  http.get('/v1/catalogue-items/:id', ({ params }) => {
    const { id } = params;
    if (id) {
      const CatalogueItemData = CatalogueItemJSON.find(
        (catalogueItem) => catalogueItem.id === id
      );
        return HttpResponse.json(CatalogueItemData, { status: 200 });
    }
      return HttpResponse.json({}, { status: 422 });
  }),
  http.delete('/v1/catalogue-items/:id', ({ params }) => {
    const { id } = params;
    const validCatalogueItem = CatalogueItemJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueItem) {
      if (id === '6') {
          return HttpResponse.json({
              detail: 'Catalogue item has child elements and cannot be deleted',
          }, { status: 409 });
      } else {
          return HttpResponse.json(null, { status: 204 });
      }
    } else {
        return HttpResponse.json('', { status: 400 });
    }
  }),

  http.patch('/v1/catalogue-items/:id', async ({ request, params }) => {
    const body = (await request.json()) as EditCatalogueItem;
    const { id } = params;

    const validCatalogueItem = CatalogueItemJSON.find(
      (value) => value.id === id
    );

    const newBody = {
      catalogue_category_id:
        body.catalogue_category_id ?? validCatalogueItem?.catalogue_category_id,
      name: body.name ?? validCatalogueItem?.name,
      description: body.description ?? validCatalogueItem?.description,
      properties: body.properties ?? validCatalogueItem?.properties,
    };

    if (body.name === 'test_has_children_elements') {
        return HttpResponse.json({
            detail: 'Catalogue item has child elements and cannot be edited',
        }, { status: 409 });
    }
    if (
      body.name === 'Error 500' ||
      body.obsolete_reason === 'Error 500' ||
      body.catalogue_category_id === 'Error 500'
    )
        return HttpResponse.json('', { status: 500 });

      return HttpResponse.json({
          ...newBody,
          id: id,
      }, { status: 200 });
  }),

  // ------------------------------------ MANUFACTURERS ------------------------------------

  http.get('/v1/manufacturers', () => {
      return HttpResponse.json(ManufacturerJSON, { status: 200 });
  }),

  http.get('/v1/manufacturers/:id', ({ params }) => {
    const { id } = params;

    const data = ManufacturerJSON.find(
      (manufacturer) => manufacturer.id === id
    );

      return HttpResponse.json(data, { status: 200 });
  }),

  http.post('/v1/manufacturers', async ({ request }) => {
    const body = (await request.json()) as Manufacturer;

    if (body.name === 'Manufacturer A') {
        return HttpResponse.json('', { status: 409 });
    }

    if (body.name === 'Error 500') {
        return HttpResponse.json('', { status: 500 });
    }

      return HttpResponse.json({
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
      }, { status: 200 });
  }),

  http.delete('/v1/manufacturers/:id', ({ params }) => {
    const { id } = params;
    const validManufacturer = ManufacturerJSON.find((value) => value.id === id);
    if (validManufacturer) {
      if (id === '2') {
          return HttpResponse.json({
              detail: 'The specified manufacturer is a part of a Catalogue Item',
          }, { status: 409 });
      } else {
          return HttpResponse.json('', { status: 200 });
      }
    } else {
        return HttpResponse.json('', { status: 400 });
    }
  }),

  http.patch('/v1/manufacturers/:id', async ({ request }) => {
    const body = (await request.json()) as EditManufacturer;

    if (body.name === 'test_dup') {
        return HttpResponse.json({
            detail:
                'A manufacturer with the same name has been found. Please enter a different name',
        }, { status: 409 });
    }
    if (body.name === 'Error 500') {
        return HttpResponse.json('', { status: 500 });
    }
      return HttpResponse.json({
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
      }, { status: 200 });
  }),

  // ------------------------------------ SYSTEMS ------------------------------------

  http.get('/v1/systems', ({ request }) => {
      const url = new URL(request.url);
    const systemsParams = url.searchParams;
    const parentId = systemsParams.get('parent_id');
    let data;

    if (parentId) {
      if (parentId === 'null')
        data = SystemsJSON.filter((system) => system.parent_id === null);
      else data = SystemsJSON.filter((system) => system.parent_id === parentId);
    } else data = SystemsJSON;
      return HttpResponse.json(data, { status: 200 });
  }),

  http.get('/v1/systems/:id', ({ params }) => {
    const { id } = params;
    const data = SystemsJSON.find((system) => system.id === id);
      if (data !== undefined) return HttpResponse.json(data, { status: 200 });
    else
          return HttpResponse.json({ detail: 'A System with such ID was not found' }, { status: 404 });
  }),

  http.get('/v1/systems/:id/breadcrumbs', ({ params }) => {
    const { id } = params;
    const data = SystemBreadcrumbsJSON.find(
      (systemBreadcrumbs) => systemBreadcrumbs.id === id
    );
      return HttpResponse.json(data, { status: 200 });
  }),

  http.post('/v1/systems', async ({ request }) => {
    const body = (await request.json()) as AddSystem;

    if (body.name === 'Error 409') {
        return HttpResponse.json({
            detail:
                'A System with the same name already exists within the same parent System',
        }, { status: 409 });
    } else if (body.name === 'Error 500')
        return HttpResponse.json('', { status: 500 });
      return HttpResponse.json({
          ...body,
          id: '1',
      }, { status: 200 });
  }),

  http.patch('/v1/systems/:id', async ({ request, params }) => {
    const body = (await request.json()) as EditSystem;

    const { id } = params;

    if (body.name === 'Error 409' || id === 'Error 409') {
        return HttpResponse.json({
            detail:
                'A System with the same name already exists within the same parent System',
        }, { status: 409 });
    } else if (body.name === 'Error 500')
        return HttpResponse.json('', { status: 500 });

    const validSystem = SystemsJSON.find((value) => value.id === id);

    if (validSystem) {
        return HttpResponse.json({ ...validSystem, ...body }, { status: 200 });
    } else return HttpResponse.json('', { status: 404 });
  }),

  http.delete('/v1/systems/:id', ({ params }) => {
    const { id } = params;
    const validSystem = SystemsJSON.find((value) => value.id === id);
    if (validSystem) {
      if (SystemsJSON.find((value) => value.parent_id === validSystem.id)) {
          return HttpResponse.json({
              detail: 'System has child elements and cannot be deleted',
          }, { status: 409 });
      } else {
          return HttpResponse.json(null, { status: 204 });
      }
    } else {
        return HttpResponse.json('', { status: 404 });
    }
  }),
  // ------------------------------------ ITEMS ------------------------------------------------
  http.post('/v1/items', async ({ request }) => {
    const body = (await request.json()) as AddItem;

    if (body.serial_number === 'Error 500') {
        return HttpResponse.json('', { status: 500 });
    }

      return HttpResponse.json({
          ...body,
          id: '1',
      }, { status: 200 });
  }),

  http.get('/v1/items', ({ request }) => {
      const url = new URL(request.url);
    const itemsParams = url.searchParams;
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

      return HttpResponse.json(data, { status: 200 });
  }),
  http.get('/v1/items/:id', ({ params }) => {
    const { id } = params;

    const data = ItemsJSON.find((items) => items.id === id);

      return HttpResponse.json(data, { status: 200 });
  }),
  http.delete('/v1/items/:id', ({ params }) => {
    const { id } = params;

      if (id === 'Error 500') return HttpResponse.json(null, { status: 500 });

      return HttpResponse.json(null, { status: 204 });
  }),
  http.patch('/v1/items/:id', async ({ request, params }) => {
    const body = (await request.json()) as EditItem;
    const { id } = params;

    if (id === 'Error 409')
        return HttpResponse.json({
            detail: 'The specified system ID does not exist',
        }, { status: 409 });

    const validItem = ItemsJSON.find((value) => value.id === id);

    if (body.serial_number === 'Error 500')
        return HttpResponse.json('', { status: 500 });

      return HttpResponse.json({
          ...validItem,
          ...body,
          id: id,
      }, { status: 200 });
  }),
  // ------------------------------------ Units ------------------------------------------------

  http.get('/v1/units', () => {
      return HttpResponse.json(unitsJSON, { status: 200 });
  }),
];
