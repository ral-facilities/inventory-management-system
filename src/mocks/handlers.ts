import { DefaultBodyType, delay, http, HttpResponse, PathParams } from 'msw';
import {
  APIImage,
  AttachmentMetadata,
  AttachmentMetadataPatch,
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
  ImageMetadataPatch,
  ImagePost,
  Item,
  ItemPatch,
  ItemPost,
  Manufacturer,
  ManufacturerPatch,
  ManufacturerPost,
  SparesDefinition,
  SparesDefinitionPut,
  System,
  SystemPatch,
  SystemPost,
  Unit,
  UnitPost,
  UsageStatus,
  UsageStatusPost,
} from '../api/api.types';
import { generateUniqueId } from '../utils';
import AttachmentsJSON from './Attachments.json';
import CatalogueCategoriesJSON from './CatalogueCategories.json';
import CatalogueCategoryBreadcrumbsJSON from './CatalogueCategoryBreadcrumbs.json';
import CatalogueItemsJSON from './CatalogueItems.json';
import ImagesJSON from './Images.json';
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

  http.get<{ id: string }, DefaultBodyType, CatalogueCategory | ErrorResponse>(
    '/v1/catalogue-categories/:id',
    ({ params }) => {
      const { id } = params;

      const data = CatalogueCategoriesJSON.find(
        (catalogueCategory) => catalogueCategory.id === id
      );
      if (!data) {
        return HttpResponse.json(
          { detail: 'Catalogue category not found' },
          { status: 404 }
        );
      }

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

  http.get<{ id: string }, DefaultBodyType, BreadcrumbsInfo | ErrorResponse>(
    '/v1/catalogue-categories/:id/breadcrumbs',
    ({ params }) => {
      const { id } = params;
      const data = CatalogueCategoryBreadcrumbsJSON.find(
        (catalogueBreadcrumbs) => catalogueBreadcrumbs.id === id
      ) as unknown as BreadcrumbsInfo;

      if (!data) {
        return HttpResponse.json(
          { detail: 'Catalogue category not found' },
          { status: 404 }
        );
      }

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

        if (!CatalogueItemData) {
          return HttpResponse.json(
            { detail: 'Catalogue not found' },
            { status: 404 }
          );
        }

        return HttpResponse.json(CatalogueItemData, { status: 200 });
      }
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
        // find the name of the manufacturer, so it can be used in the error message
        const manufacturerName = ManufacturersJSON?.find(
          (manufacturer) =>
            manufacturer.id === validCatalogueItem?.manufacturer_id
        ) as Manufacturer;
        return HttpResponse.json(
          {
            detail:
              'Unable to update catalogue item properties and manufacturer (' +
              manufacturerName?.name +
              '), as the catalogue item has child elements.',
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

  http.get<{ id: string }, DefaultBodyType, Manufacturer | ErrorResponse>(
    '/v1/manufacturers/:id',
    ({ params }) => {
      const { id } = params;

      const data = ManufacturersJSON.find(
        (manufacturer) => manufacturer.id === id
      ) as Manufacturer;

      if (!data) {
        return HttpResponse.json(
          { detail: 'Manufacturer not found' },
          { status: 404 }
        );
      }

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

      if (!data) {
        return HttpResponse.json({ detail: 'Item not found' }, { status: 404 });
      }

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

  http.get<PathParams, DefaultBodyType, Unit[]>('/v1/units', () => {
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

  http.get<PathParams, DefaultBodyType, UsageStatus[]>(
    '/v1/usage-statuses',
    () => {
      return HttpResponse.json(UsageStatusJSON, { status: 200 });
    }
  ),

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
  >('/attachments', async () => {
    const body = AttachmentsJSON[0];

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
        ...body,
        upload_info: upload_info,
      },
      { status: 201 }
    );
  }),

  http.get('/attachments', ({ request }) => {
    const url = new URL(request.url);
    const attachmentParams = url.searchParams;
    const entityId = attachmentParams.get('entity_id');

    const generateAttachments = () => {
      return Array.from({ length: 20 }, (_, index) => {
        const id = index + 1;
        const attachment = { ...AttachmentsJSON[id % 4] };

        return {
          ...attachment,
          id: String(id), // Ensure the id is a string
          entity_id: entityId,
        };
      });
    };

    return HttpResponse.json(generateAttachments(), { status: 200 });
  }),

  http.patch<
    { id: string },
    AttachmentMetadataPatch,
    AttachmentMetadata | ErrorResponse
  >('/attachments/:id', async ({ request, params }) => {
    const { id } = params;

    const obj = AttachmentsJSON.find((attachment) => attachment.id === id);
    const body = await request.json();

    const fullBody = { ...obj, ...body };

    if (fullBody.file_name === 'Error_500.txt') {
      return HttpResponse.json(
        { detail: 'Something went wrong' },
        { status: 500 }
      );
    }
    return HttpResponse.json(fullBody as AttachmentMetadata, { status: 200 });
  }),

  // ------------------------------------ OBJECT STORAGE ------------------------------------------------

  http.post('/object-storage', async () => {
    await delay(200);
    return new HttpResponse(undefined, {
      status: 204,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        // This is need for uppy
        ETag: '"e76fe3d21078d7a3b9ec95edf437d010"',
      },
    });
  }),

  // ------------------------------------ IMAGES ------------------------------------------------

  http.post<PathParams, ImagePost, APIImage | ErrorResponse>(
    '/images',
    async () => {
      return HttpResponse.json(ImagesJSON[0], { status: 201 });
    }
  ),
  http.get('/images', ({ request }) => {
    const url = new URL(request.url);
    const imageParams = url.searchParams;
    const primary = imageParams.get('primary');
    const entityId = imageParams.get('entity_id');

    if (primary === 'true') {
      if (entityId === '90') {
        return HttpResponse.json([], { status: 200 });
      } else {
        return HttpResponse.json(
          [
            {
              ...ImagesJSON[0],
              primary: true,
              entity_id: entityId,
              ...(entityId === '3' && { thumbnail_base64: 'test' }),
            },
          ],
          { status: 200 }
        );
      }
    }
  }),
  http.get<PathParams, DefaultBodyType, APIImage[]>(
    '/images',
    ({ request }) => {
      const url = new URL(request.url);
      const imageParams = url.searchParams;
      const primary = imageParams.get('primary');
      const entityId = imageParams.get('entity_id');

      if (primary === 'true') {
        if (entityId === '90') {
          return HttpResponse.json([], { status: 200 });
        } else {
          return HttpResponse.json(
            [
              {
                ...ImagesJSON[0],
                primary: true,
                entity_id: entityId ?? '',
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
          let image;

          if (Number(id) % 2 === 0) {
            image = ImagesJSON[0];
          } else {
            image = {
              ...ImagesJSON[1],
              ...(id === 3 && {
                thumbnail_base64: 'test',
                description: undefined,
              }),
            };
          }
          return {
            ...image,
            id: String(id),
          };
        });
      };

      return HttpResponse.json(generateImages(), { status: 200 });
    }
  ),

  http.get<{ id: string }, DefaultBodyType>('/images/:id', ({ params }) => {
    const { id } = params;
    // This is needed otherwise the msw would intercept the
    // mocked image get request for the object store
    if (!isNaN(Number(id))) {
      let image = undefined;
      if (Number(id) % 2 === 0) {
        image = {
          ...ImagesJSON[0],
          view_url: `${window.location.origin}/logo192.png?text=${encodeURIComponent(id as string)}`,
          download_url: `${window.location.origin}/logo192.png?text=${encodeURIComponent(id as string)}`,
        };
      } else {
        if (id === '3') {
          image = {
            ...ImagesJSON[1],
            view_url: 'invalid url',
            download_url: 'invalid url',
            description: undefined,
          };
        } else {
          image = {
            ...ImagesJSON[1],
            view_url: `${window.location.origin}/images/stfc-logo-blue-text.png?text=${encodeURIComponent(id as string)}`,
            download_url: `${window.location.origin}/images/stfc-logo-blue-text.png?text=${encodeURIComponent(id as string)}`,
          };
        }
      }

      if (id === '5') {
        return HttpResponse.error();
      }

      return HttpResponse.json(
        {
          ...image,
          id: id,
        },
        { status: 200 }
      );
    }
  }),

  http.patch<{ id: string }, ImageMetadataPatch, APIImage | ErrorResponse>(
    '/images/:id',
    async ({ request, params }) => {
      const { id } = params;

      const obj = ImagesJSON.find((image) => image.id === id);
      const body = await request.json();

      const fullBody = { ...obj, ...body };

      if (
        // Test case for editing an image's metadata
        fullBody.file_name === 'Error_500.png' ||
        // Test case for setting an image to primary
        (id === '17' && fullBody.primary === true)
      ) {
        return HttpResponse.json(
          { detail: 'Something went wrong' },
          { status: 500 }
        );
      }
      return HttpResponse.json(fullBody as APIImage, { status: 200 });
    }
  ),

  http.delete<
    { id: string },
    DefaultBodyType,
    ErrorResponse | NonNullable<unknown>
  >('/images/:id', ({ params }) => {
    const { id } = params;

    if (id === 'Error 500')
      return HttpResponse.json(
        { detail: 'Something went wrong' },
        { status: 500 }
      );

    return HttpResponse.json(undefined, { status: 204 });
  }),

  // ------------------------------------ SPARES ------------------------------------------------
  http.put<PathParams, SparesDefinitionPut, SparesDefinition | ErrorResponse>(
    '/v1/settings/spares_definition',
    async ({ request }) => {
      const sparesDef = await request.json();

      return HttpResponse.json(
        {
          usage_statuses: sparesDef.usage_statuses
            .map(
              ({ id }) =>
                UsageStatusJSON?.find((status) => status.id === id) || null
            )
            .filter((status): status is UsageStatus => status !== null),
        },
        { status: 200 }
      );
    }
  ),
  http.get<PathParams, DefaultBodyType, SparesDefinition>(
    '/v1/settings/spares_definition',
    () => {
      return HttpResponse.json(
        { usage_statuses: [UsageStatusJSON[0], UsageStatusJSON[2]] },
        { status: 200 }
      );
    }
  ),
];
