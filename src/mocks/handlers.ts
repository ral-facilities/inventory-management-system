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
import ImageJSON from './image.json';

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
  http.get('/images', ({ request }) => {
    const url = new URL(request.url);
    const imageParams = url.searchParams;
    const primary = imageParams.get('primary');
    const entityId = imageParams.get('entity_id');

    const thumbnail2 =
      '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';
    if (primary === 'true') {
      if (entityId === '90') {
        return HttpResponse.json([], { status: 200 });
      } else {
        return HttpResponse.json(
          [
            {
              ...ImageJSON,
              primary: true,
              entity_id: entityId,
              ...(entityId === '3' && { thumbnail_base64: 'test' }),
            },
          ],
          { status: 200 }
        );
      }
    }

    const generateImages = () => {
      return Array.from({ length: 20 }, (_, index) => {
        const id = index + 1;
        let thumbnail;
        let fileName;

        if (Number(id) % 2 === 0) {
          thumbnail = ImageJSON.thumbnail_base64;
          fileName = ImageJSON.file_name;
        } else {
          thumbnail = id === 3 ? 'test' : thumbnail2;
          fileName = 'stfc-logo-blue-text.png';
        }
        return {
          ...ImageJSON,
          id: String(id),
          thumbnail_base64: thumbnail,
          file_name: fileName,
        };
      });
    };

    return HttpResponse.json(generateImages(), { status: 200 });
  }),

  http.get('/images/:id', ({ params }) => {
    const { id } = params;
    if (!isNaN(Number(id))) {
      let downloadUrl;
      let fileName;
      if (Number(id) % 2 === 0) {
        downloadUrl = `${window.location.origin}/logo192.png?text=${encodeURIComponent(id as string)}`;
        fileName = ImageJSON.file_name;
      } else {
        if (Number(id) === 3) {
          downloadUrl = 'test';
        } else {
          downloadUrl = `${window.location.origin}/images/stfc-logo-blue-text.png?text=${encodeURIComponent(id as string)}`;
        }
        fileName = 'stfc-logo-blue-text.png';
      }

      return HttpResponse.json(
        {
          ...ImageJSON,
          id: id,
          download_url: downloadUrl,
          file_name: fileName,
        },
        { status: 200 }
      );
    }
  }),
];
