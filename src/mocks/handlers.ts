import { DefaultBodyType, delay, http, HttpResponse, PathParams } from 'msw';
import {
  AttachmentPostMetadata,
  AttachmentPostMetadataResponse,
  AttachmentUploadInfo,
  BreadcrumbsInfo,
  CatalogueCategory,
  CatalogueCategoryPatch,
  CatalogueCategoryPost,
  CatalogueCategoryProperty,
  CatalogueCategoryPropertyPatch,
  CatalogueCategoryPropertyPost,
  CatalogueItem,
  CatalogueItemPatch,
  CatalogueItemPost,
  Item,
  ItemPatch,
  ItemPost,
  Manufacturer,
  ManufacturerPatch,
  ManufacturerPost,
  System,
  SystemPatch,
  SystemPost,
  Unit,
  UnitPost,
  UsageStatus,
  UsageStatusPost,
} from '../api/api.types';
import { generateUniqueId } from '../utils';
import CatalogueCategoriesJSON from './CatalogueCategories.json';
import CatalogueCategoryBreadcrumbsJSON from './CatalogueCategoryBreadcrumbs.json';
import CatalogueItemsJSON from './CatalogueItems.json';
import ItemsJSON from './Items.json';
import ManufacturersJSON from './Manufacturers.json';
import SystemBreadcrumbsJSON from './SystemBreadcrumbs.json';
import SystemsJSON from './Systems.json';
import UnitsJSON from './Units.json';
import UsageStatusJSON from './UsageStatuses.json';

/* MSW v2 expects types for responses, this interface covers any empty body
   or error with detail */
interface ErrorResponse {
  detail?: string;
}

export const handlers = [
  // ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

  http.post<
    PathParams,
    CatalogueCategoryPost,
    CatalogueCategory | ErrorResponse
  >('/v1/catalogue-categories', async ({ request }) => {
    let body = await request.json();

    if (body.name === 'test_dup') {
      return HttpResponse.json(
        {
          detail:
            'A catalogue category with the same name already exists within the parent catalogue category',
        },
        { status: 409 }
      );
    }

    if (body.name === 'Error 500') {
      return HttpResponse.json(
        { detail: 'Something went wrong' },
        { status: 500 }
      );
    }

    if (!body.parent_id) {
      body = {
        ...body,
        parent_id: null,
      };
    }

    body = {
      ...body,
      properties: body.properties?.map((property) => ({
        ...property,
        id: generateUniqueId('test_id_'),
        unit:
          UnitsJSON.find((unit) => unit.id === property.unit_id)?.value ?? null,
      })),
    };
    return HttpResponse.json(
      {
        id: '1',
        ...body,
      } as CatalogueCategory,
      { status: 200 }
    );
  }),

  http.get<{ id: string }, DefaultBodyType, CatalogueCategory>(
    '/v1/catalogue-categories/:id',
    ({ params }) => {
      const { id } = params;

      const data = CatalogueCategoriesJSON.find(
        (catalogueCategory) => catalogueCategory.id === id
      );

      return HttpResponse.json(data as CatalogueCategory, { status: 200 });
    }
  ),

  http.get<PathParams, DefaultBodyType, CatalogueCategory[]>(
    '/v1/catalogue-categories',
    ({ request }) => {
      const url = new URL(request.url);
      const catalogueCategoryParams = url.searchParams;
      const parentId = catalogueCategoryParams.get('parent_id');
      let data;

      if (parentId) {
        if (parentId === 'null') {
          data = CatalogueCategoriesJSON.filter(
            (catalogueCategory) => catalogueCategory.parent_id === null
          ) as CatalogueCategory[];
        } else {
          data = CatalogueCategoriesJSON.filter(
            (catalogueCategory) => catalogueCategory.parent_id === parentId
          ) as CatalogueCategory[];
        }
      }

      return HttpResponse.json(data, { status: 200 });
    }
  ),

  http.get<{ id: string }, DefaultBodyType, BreadcrumbsInfo>(
    '/v1/catalogue-categories/:id/breadcrumbs',
    ({ params }) => {
      const { id } = params;
      const data = CatalogueCategoryBreadcrumbsJSON.find(
        (catalogueBreadcrumbs) => catalogueBreadcrumbs.id === id
      ) as unknown as BreadcrumbsInfo;
      return HttpResponse.json(data, {
        status: 200,
      });
    }
  ),

  http.patch<
    { id: string },
    CatalogueCategoryPatch,
    CatalogueCategory | ErrorResponse
  >('/v1/catalogue-categories/:id', async ({ request, params }) => {
    const { id } = params;

    const obj = CatalogueCategoriesJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    );
    const body = await request.json();

    const fullBody = { ...obj, ...body };

    if (fullBody.name === 'test_dup') {
      return HttpResponse.json(
        {
          detail:
            'A catalogue category with the same name already exists within the parent catalogue category',
        },
        { status: 409 }
      );
    }

    if (fullBody.name === 'Error 500') {
      return HttpResponse.json(
        { detail: 'Something went wrong' },
        { status: 500 }
      );
    }
    return HttpResponse.json(fullBody as CatalogueCategory, { status: 200 });
  }),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/catalogue-categories/:id', ({ params }) => {
    const { id } = params;
    const validCatalogueCategory = CatalogueCategoriesJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueCategory) {
      if (id === '2') {
        return HttpResponse.json(
          {
            detail:
              'Catalogue category has children elements and cannot be deleted',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 400 });
    }
  }),

  http.post<
    PathParams,
    CatalogueCategoryPropertyPost,
    CatalogueCategoryProperty | ErrorResponse
  >(
    '/v1/catalogue-categories/:catalogue_category_id/properties',
    async ({ request }) => {
      const body = await request.json();

      const unitValue = UnitsJSON.find(
        (unit) => body.unit_id === unit.id
      )?.value;

      if (body.name == 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }
      delete body.default_value;
      return HttpResponse.json(
        {
          id: '1',
          ...body,
          unit: unitValue ?? null,
        } as CatalogueCategoryProperty,
        { status: 200 }
      );
    }
  ),

  http.patch<
    PathParams,
    CatalogueCategoryPropertyPatch,
    CatalogueCategoryProperty | ErrorResponse
  >(
    '/v1/catalogue-categories/:catalogue_category_id/properties/:property_id',
    async ({ request, params }) => {
      const body = await request.json();

      if (body.name == 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      const { catalogue_category_id, property_id } = params;

      const property = CatalogueCategoriesJSON.find(
        (category) => category.id === catalogue_category_id
      )?.properties?.find((property) => property.id === property_id);

      return HttpResponse.json(
        { id: '1', ...property, ...body } as CatalogueCategoryProperty,
        { status: 200 }
      );
    }
  ),

  // ------------------------------------ CATALOGUE ITEMS ------------------------------------

  http.post<PathParams, CatalogueItemPost, CatalogueItem | ErrorResponse>(
    '/v1/catalogue-items',
    async ({ request }) => {
      let body = await request.json();

      if (
        body.name === 'Error 500' ||
        body.catalogue_category_id === 'Error 500'
      ) {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      const catalogueCategoryProperties = CatalogueCategoriesJSON.find(
        (category) => category.id === body.catalogue_category_id
      )?.properties;

      body = {
        ...body,
        properties: body.properties?.map((property) => {
          const extraPropertyData = catalogueCategoryProperties?.find(
            (catalogueCategoryProperty) =>
              property.id === catalogueCategoryProperty.id
          );
          return {
            ...property,
            unit: extraPropertyData?.unit,
            unit_id: extraPropertyData?.unit_id,
            name: extraPropertyData?.name,
          };
        }),
      };
      return HttpResponse.json(
        {
          ...body,
          id: '1',
        } as CatalogueItem,
        { status: 200 }
      );
    }
  ),

  http.get<{ id: string }, DefaultBodyType, CatalogueItem | ErrorResponse>(
    '/v1/catalogue-items/:id',
    ({ params }) => {
      const { id } = params;
      if (id) {
        const CatalogueItemData = CatalogueItemsJSON.find(
          (catalogueItem) => catalogueItem.id === id
        );
        return HttpResponse.json(CatalogueItemData, { status: 200 });
      }
      return HttpResponse.json({ detail: '' }, { status: 422 });
    }
  ),

  http.get<PathParams, DefaultBodyType, CatalogueItem[] | ErrorResponse>(
    '/v1/catalogue-items',
    async ({ request }) => {
      const url = new URL(request.url);
      const catalogueItemsParams = url.searchParams;
      const id = catalogueItemsParams.get('catalogue_category_id');

      if (id) {
        const CatalogueItemData = CatalogueItemsJSON.filter(
          (catalogueItem) => catalogueItem.catalogue_category_id === id
        );

        return HttpResponse.json(CatalogueItemData, { status: 200 });
      } else {
        return HttpResponse.json({ detail: '' }, { status: 422 });
      }
    }
  ),

  http.patch<{ id: string }, CatalogueItemPatch, CatalogueItem | ErrorResponse>(
    '/v1/catalogue-items/:id',
    async ({ request, params }) => {
      const body = await request.json();
      const { id } = params;

      const validCatalogueItem = CatalogueItemsJSON.find(
        (value) => value.id === id
      );

      const newBody = {
        catalogue_category_id:
          body.catalogue_category_id ??
          validCatalogueItem?.catalogue_category_id,
        name: body.name ?? validCatalogueItem?.name,
        description: body.description ?? validCatalogueItem?.description,
        properties: body.properties ?? validCatalogueItem?.properties,
      };

      if (body.name === 'test_has_children_elements') {
        return HttpResponse.json(
          {
            detail: 'Catalogue item has child elements and cannot be edited',
          },
          { status: 409 }
        );
      }
      if (
        body.name === 'Error 500' ||
        body.obsolete_reason === 'Error 500' ||
        body.catalogue_category_id === 'Error 500'
      )
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );

      return HttpResponse.json(
        {
          ...newBody,
          id: id,
        } as CatalogueItem,
        { status: 200 }
      );
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/catalogue-items/:id', ({ params }) => {
    const { id } = params;
    const validCatalogueItem = CatalogueItemsJSON.find(
      (value) => value.id === id
    );
    if (validCatalogueItem) {
      if (id === '6') {
        return HttpResponse.json(
          {
            detail: 'Catalogue item has child elements and cannot be deleted',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 400 });
    }
  }),

  // ------------------------------------ MANUFACTURERS ------------------------------------

  http.post<PathParams, ManufacturerPost, Manufacturer | ErrorResponse>(
    '/v1/manufacturers',
    async ({ request }) => {
      const body = await request.json();

      if (body.name === 'Manufacturer A') {
        return HttpResponse.json({ detail: '' }, { status: 409 });
      }

      if (body.name === 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      return HttpResponse.json(
        {
          id: '4',
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
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
        { status: 200 }
      );
    }
  ),

  http.get<PathParams, DefaultBodyType, Manufacturer[]>(
    '/v1/manufacturers',
    () => {
      return HttpResponse.json(ManufacturersJSON as Manufacturer[], {
        status: 200,
      });
    }
  ),

  http.get<{ id: string }, DefaultBodyType, Manufacturer>(
    '/v1/manufacturers/:id',
    ({ params }) => {
      const { id } = params;

      const data = ManufacturersJSON.find(
        (manufacturer) => manufacturer.id === id
      ) as Manufacturer;

      return HttpResponse.json(data, { status: 200 });
    }
  ),

  http.patch<{ id: string }, ManufacturerPatch, Manufacturer | ErrorResponse>(
    '/v1/manufacturers/:id',
    async ({ request }) => {
      const body = await request.json();

      if (body.name === 'test_dup') {
        return HttpResponse.json(
          {
            detail:
              'A manufacturer with the same name already exists. Please enter a different name',
          },
          { status: 409 }
        );
      }
      if (body.name === 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }
      return HttpResponse.json(
        {
          id: '1',
          name: 'test',
          code: 'test',
          url: null,
          address: {
            address_line: 'test',
            town: 'test',
            county: 'test',
            country: 'test',
            postcode: 'test',
          },
          telephone: '0000000000',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
        { status: 200 }
      );
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/manufacturers/:id', ({ params }) => {
    const { id } = params;
    const validManufacturer = ManufacturersJSON.find(
      (value) => value.id === id
    );
    if (validManufacturer) {
      if (id === '2') {
        return HttpResponse.json(
          {
            detail: 'The specified manufacturer is a part of a Catalogue Item',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 400 });
    }
  }),

  // ------------------------------------ SYSTEMS ------------------------------------

  http.post<PathParams, SystemPost, System | ErrorResponse>(
    '/v1/systems',
    async ({ request }) => {
      const body = await request.json();

      if (body.name === 'Error 409') {
        return HttpResponse.json(
          {
            detail:
              'A System with the same name already exists within the same parent System',
          },
          { status: 409 }
        );
      } else if (body.name === 'Error 500')
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      return HttpResponse.json(
        {
          ...body,
          id: '1',
        } as System,
        { status: 200 }
      );
    }
  ),

  http.get<{ id: string }, DefaultBodyType, System | ErrorResponse>(
    '/v1/systems/:id',
    ({ params }) => {
      const { id } = params;
      const data = SystemsJSON.find((system) => system.id === id) as System;
      if (data !== undefined) return HttpResponse.json(data, { status: 200 });
      else
        return HttpResponse.json(
          { detail: 'A System with such ID was not found' },
          { status: 404 }
        );
    }
  ),

  http.get<PathParams, DefaultBodyType, System[]>(
    '/v1/systems',
    ({ request }) => {
      const url = new URL(request.url);
      const systemsParams = url.searchParams;
      const parentId = systemsParams.get('parent_id');
      let data;

      if (parentId) {
        if (parentId === 'null')
          data = SystemsJSON.filter(
            (system) => system.parent_id === null
          ) as System[];
        else
          data = SystemsJSON.filter(
            (system) => system.parent_id === parentId
          ) as System[];
      } else data = SystemsJSON as System[];
      return HttpResponse.json(data, { status: 200 });
    }
  ),

  http.get<{ id: string }, DefaultBodyType, BreadcrumbsInfo>(
    '/v1/systems/:id/breadcrumbs',
    ({ params }) => {
      const { id } = params;
      const data = SystemBreadcrumbsJSON.find(
        (systemBreadcrumbs) => systemBreadcrumbs.id === id
      ) as unknown as BreadcrumbsInfo;
      return HttpResponse.json(data, { status: 200 });
    }
  ),

  http.patch<{ id: string }, SystemPatch, System | ErrorResponse>(
    '/v1/systems/:id',
    async ({ request, params }) => {
      const body = await request.json();

      const { id } = params;

      if (body.name === 'Error 409' || id === 'Error 409') {
        return HttpResponse.json(
          {
            detail:
              'A System with the same name already exists within the same parent System',
          },
          { status: 409 }
        );
      } else if (body.name === 'Error 500')
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );

      const validSystem = SystemsJSON.find(
        (value) => value.id === id
      ) as System;

      if (validSystem) {
        return HttpResponse.json({ ...validSystem, ...body }, { status: 200 });
      } else return HttpResponse.json({ detail: '' }, { status: 404 });
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/systems/:id', ({ params }) => {
    const { id } = params;
    const validSystem = SystemsJSON.find((value) => value.id === id);
    if (validSystem) {
      if (SystemsJSON.find((value) => value.parent_id === validSystem.id)) {
        return HttpResponse.json(
          {
            detail: 'System has child elements and cannot be deleted',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 404 });
    }
  }),

  // ------------------------------------ ITEMS ------------------------------------------------

  http.post<PathParams, ItemPost, Item | ErrorResponse>(
    '/v1/items',
    async ({ request }) => {
      let body = await request.json();

      if (body.serial_number === 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      const catalogueItem = CatalogueItemsJSON.find(
        (catalogueItem) => catalogueItem.id === body.catalogue_item_id
      );
      const catalogueCategoryProperties = CatalogueCategoriesJSON.find(
        (category) => category.id === catalogueItem?.catalogue_category_id
      )?.properties;

      const usageStatus = UsageStatusJSON.find(
        (usageStatus) => usageStatus.id == body.usage_status_id
      );

      body = {
        ...body,
        properties: body.properties?.map((property) => {
          const extraPropertyData = catalogueCategoryProperties?.find(
            (catalogueCategoryProperty) =>
              property.id === catalogueCategoryProperty.id
          );
          return {
            ...property,
            unit: extraPropertyData?.unit ?? null,
            name: extraPropertyData?.name,
          };
        }),
      };

      return HttpResponse.json(
        {
          ...body,
          id: '1',
          usage_status: usageStatus?.value,
        } as Item,
        { status: 200 }
      );
    }
  ),

  http.get<{ id: string }, DefaultBodyType, Item | ErrorResponse>(
    '/v1/items/:id',
    ({ params }) => {
      const { id } = params;

      const data = ItemsJSON.find((items) => items.id === id);

      return HttpResponse.json(data, { status: 200 });
    }
  ),

  http.get<PathParams, DefaultBodyType, Item[]>('/v1/items', ({ request }) => {
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

  http.patch<{ id: string }, ItemPatch, Item | ErrorResponse>(
    '/v1/items/:id',
    async ({ request, params }) => {
      const body = await request.json();
      const { id } = params;

      if (id === 'Error 409')
        return HttpResponse.json(
          {
            detail: 'The specified system ID does not exist',
          },
          { status: 409 }
        );

      const validItem = ItemsJSON.find((value) => value.id === id);
      const usageStatus = UsageStatusJSON.find(
        (usageStatus) => usageStatus.id == body.usage_status_id
      );

      if (body.serial_number === 'Error 500')
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );

      return HttpResponse.json(
        {
          ...validItem,
          ...body,
          id: id,
          usage_status: usageStatus?.value,
        } as Item,
        { status: 200 }
      );
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/items/:id', ({ params }) => {
    const { id } = params;

    if (id === 'Error 500')
      return HttpResponse.json(
        { detail: 'Something went wrong' },
        { status: 500 }
      );

    return HttpResponse.json(undefined, { status: 204 });
  }),

  // ------------------------------------ UNITS ------------------------------------------------

  http.get('/v1/units', () => {
    return HttpResponse.json(UnitsJSON, { status: 200 });
  }),

  http.post<PathParams, UnitPost, Unit | ErrorResponse>(
    '/v1/units',
    async ({ request }) => {
      const body = await request.json();

      if (body.value === 'test_dup') {
        return HttpResponse.json(
          {
            detail: 'A unit with the same value already exists',
          },
          { status: 409 }
        );
      }
      if (body.value === 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      return HttpResponse.json(
        {
          id: '10',
          value: 'Kelvin',
          code: 'kelvin',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
        { status: 200 }
      );
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/units/:id', ({ params }) => {
    const { id } = params;
    const validUnit = UnitsJSON.find((value) => value.id === id);
    if (validUnit) {
      if (id === '2') {
        return HttpResponse.json(
          {
            detail: 'The specified unit is part of a Catalogue category',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 400 });
    }
  }),

  // ------------------------------------ USAGE STATUSES ------------------------------------------------

  http.get('/v1/usage-statuses', () => {
    return HttpResponse.json(UsageStatusJSON, { status: 200 });
  }),

  http.post<PathParams, UsageStatusPost, UsageStatus | ErrorResponse>(
    '/v1/usage-statuses',
    async ({ request }) => {
      const body = await request.json();

      if (body.value === 'test_dup') {
        return HttpResponse.json(
          {
            detail: 'A Usage Status with the same value already exists',
          },
          { status: 409 }
        );
      }
      if (body.value === 'Error 500') {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }

      return HttpResponse.json(
        {
          id: '5',
          value: 'Archived',
          code: 'archived',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
        { status: 200 }
      );
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/v1/usage-statuses/:id', ({ params }) => {
    const { id } = params;
    const validUsageStatus = UsageStatusJSON.find((value) => value.id === id);
    if (validUsageStatus) {
      if (id === '2') {
        return HttpResponse.json(
          {
            detail: 'The specified usage status is a part of an Item',
          },
          { status: 409 }
        );
      } else {
        return HttpResponse.json(undefined, { status: 204 });
      }
    } else {
      return HttpResponse.json({ detail: '' }, { status: 400 });
    }
  }),

  // ------------------------------------ ATTACHMENTS ------------------------------------------------

  http.post<
    PathParams,
    AttachmentPostMetadata,
    AttachmentPostMetadataResponse | ErrorResponse
  >('/attachments', async ({ request }) => {
    const body = (await request.json()) as AttachmentPostMetadata;

    const upload_info: AttachmentUploadInfo = {
      url: `http://localhost:3000/object-storage`,
      fields: {
        'Content-Type': 'multipart/form-data',
        key: `attachments/test`,
        AWSAccessKeyId: 'root',
        policy: 'policy-test',
        signature: 'signature-test',
      },
    };

    return HttpResponse.json(
      {
        id: '1',
        ...body,
        title: body.title || '',
        description: body.description || '',
        upload_info: upload_info,
        modified_time: '2024-01-02T13:10:10.000+00:00',
        created_time: '2024-01-01T12:00:00.000+00:00',
      },
      { status: 200 }
    );
  }),

  // ------------------------------------ OBJECT STORAGE ------------------------------------------------

  http.post('/object-storage', async () => {
    await delay(200);
    return HttpResponse.json(undefined, { status: 200 });
  }),

  // ------------------------------------ IMAGES ------------------------------------------------

  http.post('/images', async () => {
    return HttpResponse.json(
      {
        entity_id: '6707ff91d32eaac11c6d8f01',
        title: null,
        description: null,
        created_time: '2024-10-12T20:51:47.687000Z',
        modified_time: '2024-10-12T20:51:47.687000Z',
        id: '670ae163532106fbaa41f348',
        file_name: 'logo.png',
        thumbnail:
          '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',
      },
      { status: 200 }
    );
  }),
];
