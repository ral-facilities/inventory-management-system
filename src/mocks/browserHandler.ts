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
    const response = await fetch('/src/mocks/CatalogueItemTemplate-test.xlsx');
    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
    const blob = await response.blob();
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CatalogueItemTemplate-${catalogueCategory?.name}.xlsx"`,
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

    const response = await fetch('/src/mocks/CatalogueItemTemplate-test.xlsx');
    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
    const blob = await response.blob();
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CatalogueItemTemplate-${catalogueCategory?.name}-Validated.xlsx"`,
        'IMSIngestAPI-Validation-Warnings': '0',
        'IMSIngestAPI-Validation-Errors': '0',
        'IMSIngestAPI-Validation-Valid': 'true',
      },
    });
  }),
];
