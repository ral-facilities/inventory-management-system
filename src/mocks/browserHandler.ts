import { http, HttpResponse, PathParams } from 'msw';
import { ErrorResponse } from 'react-router';
import CatalogueCategoriesJSON from './CatalogueCategories.json';

export const browserHandlers = [
  // --------------------------------- INGEST ------------------------------------------------------

  http.post<
    PathParams,
    { catalogue_category_id: string },
    ErrorResponse | Blob
  >('/spreadsheets/catalogue-items/template', async ({ request }) => {
    const { catalogue_category_id: catalogueCategoryId } = await request.json();
    const response = await fetch('/src/mocks/CatalogueItemsTemplate-test.xlsx');
    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
    const blob = await response.blob();
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CatalogueItemsTemplate-${catalogueCategory?.name}.xlsx"`,
      },
    });
  }),
  http.post<
    PathParams,
    { catalogue_category_id: string },
    ErrorResponse | Blob
  >('/spreadsheets/catalogue-items/validate', async ({ request }) => {
    const data = await request.formData();
    const catalogueCategoryId = data.get('catalogue_category_id');

    const response = await fetch('/src/mocks/CatalogueItemsTemplate-test.xlsx');
    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
    const blob = await response.blob();
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CatalogueItemsTemplate-${catalogueCategory?.name}-Validated.xlsx"`,
        'IMSIngestAPI-Validation-Warnings': '0',
        'IMSIngestAPI-Validation-Errors': '0',
        'IMSIngestAPI-Validation-Valid': 'true',
      },
    });
  }),

  http.post<PathParams, { system_id: string }, ErrorResponse | Blob>(
    '/spreadsheets/items/template',
    async () => {
      const response = await fetch('/src/mocks/ItemsTemplate.xlsx');
      const blob = await response.blob();
      return new HttpResponse(blob, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="ItemsTemplate.xlsx"`,
        },
      });
    }
  ),
  http.post<PathParams, { system_id: string }, ErrorResponse | Blob>(
    '/spreadsheets/items/validate',
    async () => {
      const response = await fetch('/src/mocks/ItemsTemplate.xlsx');
      const blob = await response.blob();
      return new HttpResponse(blob, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="ItemsTemplate-Validated.xlsx"`,
          'IMSIngestAPI-Validation-Warnings': '0',
          'IMSIngestAPI-Validation-Errors': '0',
          'IMSIngestAPI-Validation-Valid': 'true',
        },
      });
    }
  ),
];
