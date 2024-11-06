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
        title: body.title ?? null,
        description: body.description ?? null,
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
    return new HttpResponse(undefined, { status: 200 });
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
        primary: false,
        thumbnail_base64:
          'UklGRp4FAABXRUJQVlA4IJIFAACwGgCdASpAAEAAPm0mj0WkIaEZ+zaoQAbEtgBajeFfGkY2nr7M4eZ1zR44/UB5gHOA8wH7VelB6gP716gH+J6gD0APLZ9jv9uP3U9p/NGP412Wf5boT/bj9XxM/aH9Lwg7Xn+H3gjkX9T70bUCVBKAH5Q8+vNt9PewV+YHrLevL9zvY7/YBzAAnpq9X9UyzVdGM4xoEajakW2OY9gwwKhtAGcXjTfn/2alORgCXWzVF88eQzk6tm58uaTsmzinz5D3/kaSS19P3+Z4FBs1wUmBaE13W+mibzkERT9QRMgA/vCG0oaXFgVbo3Sp3Gho5LvuHRj/1N/26GB5gHxE+e8YU4Hi8GYsiQH2OV9IfWpOfj5UTnzyi5NZYO2pFC1TPEbYJlyoQRbBH7PeMaW/L22irx9GRnoj6onjImzAvfx7cVur2RJkejeihP+cFEyPpxTr9/b8p7dOK5R74V6JXM2c4SQGRxKrEPSp+VbTz864Z/eHBcbFJMl13N7wBb2lRm44irXnEC6992xxX2oIqp+I8QuDnGb813kHOZMmOT/Gc9Hprf0BHNAHEIXB5mg7whrp0yMDvnUzCH4uTHy0pWE7J2TyOiUQ4WuYZCwezaZWbQykXfriecUWK0d4/b6WoUeUSRLRCCRcZ5RsFrKUpHgqb7/c4qRlbG6XpuYAibJ/70JP8YhTA9/B8BLoFjQ3IGcChPnMk/vikMdxbledsUb4Ng5eaj982+y4dCkLnngZf6pUJV5fWQn3KPrvb6Y9xqAoz2CBNmOqqnE9S2r6pP7le9S4156+nVuw3zDWpdyb9VBmePxDYhpoQTRoyFzELNLHNItygB6bKbDlfAaHFQRP2H5ohce20pg9SuTlgFp2lK7F7WjSkwU3mx/OZhM3KsuyVcdb5a/m9TstlEvkYEKfu11xV4nuJcg3eeczuI2zmcxWQziWTL0XHs/guxxsO5BZtBZCeLCJ0c78x9S7VOC++kUXK+464jPfUXEwuse5ggbEG1bT2Dc4wHyQFhu7YakHzKsnHsXYNk/bH+7Nx18Ec9xGbilZeb+ebY6bm3ES7LnHXMpKhQjJmIQZktPidLHH0cuJ+9oImAcnr76cXhgx+pxIlm8TDXqcA17H9VVJ45MRUbdd295LK5XjjBJTigh9dtBq3/UsdW4axmNHC7VadMTwYJVbkTGyJHtHkOG1p7nvDQkLHP71iPrOd2Q9cy10/Iv4K/IInF01tpJ6NmAabEis0rV+Bo1thW50bTV9JE6DCPiOfCrbtdSvMlvNYbnbqOMyn5xdnhKCzCLVCNpKYjIQfVaZ7Bvb9GwXSEP/bbgn8vjYuK9XfnrjVf5MUlJTQiYhxMdWmtdjkr8YtHGTQuRYgESzn/ozLBoXJdioMfcb6J9sexU3UI4f18/Z+blRxk6RulDUL7A8gIKlUyXFBI5/HJfLbChiVunr9aHCd1y9xAS7KNyoMwzxo6X+62x10Izj1IW1b7BOjqABY4RBlZDpKuQoJGICZDizZEXRgfEPQ5G5LsJWGZ0+y42ExIphG/gRmg0IvWzmX1LeSoP8ON4sZEWXbB47AxL3egs5HDMKHNUDfj/EMfxMSYDdjLuyBOmKc4eEmNzZ2FFaddbAhm8Q2GRwh6gTdU5leovVCPyjYVeyk0keaOEEXTxjrW2SpFlF4eH7ejwAgRjIJIfjt+eExwS4Fu9LXXG7rTRXY/4vMN/6bdtasiLPgCR2sG2vqLe0RVEN3NEBGKaCFaE6UzXt6p/cAqedPQCKOEcfCCGbvfAMal692D9Ind1Q1Ga6z5Eg2Ww76AOkF7fAtiwDuj0/VnTYX5XN94UxVENkfx+PUw0JO4ZW5p9fDnr6vj+UFWdETmDZ6ypyoDxcMIiaVx8Un+od6niv6gnORP1gAAAA',
      },
      { status: 200 }
    );
  }),
];
