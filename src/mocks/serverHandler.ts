import * as fs from 'fs';
import { http, HttpResponse, PathParams } from 'msw';
import * as path from 'path';
import { ErrorResponse } from 'react-router';
import CatalogueCategoriesJSON from './CatalogueCategories.json';

const filePath = path.resolve(
  __dirname,
  '../mocks/CatalogueItemTemplate-test.xlsx'
);

export const serverHandlers = [
  // --------------------------------- INGEST ------------------------------------------------------
  http.post<
    PathParams,
    { catalogue_category_id: string },
    ErrorResponse | Blob
  >('/spreadsheets/catalogue-items/template', async ({ request }) => {
    const { catalogue_category_id: catalogueCategoryId } = await request.json();

    const fileBuffer = fs.readFileSync(filePath);

    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
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
    const text = await request.text();

    // Extract the `catalogue_category_id` value from the raw multipart body.
    // We match the form field name, skip the blank line after headers, and capture
    // the following line as the field value.
    // This is needed because request.formData() fails in tests due to malformed
    // multipart data produced by Uppy/JSDOM ("[object Blob]").
    const match = text.match(
      /name="catalogue_category_id"\s*\r?\n\r?\n([^\r\n]+)/
    );

    const catalogueCategoryId = match?.[1];

    const fileBuffer = fs.readFileSync(filePath);

    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const catalogueCategory = CatalogueCategoriesJSON.find(
      (val) => val.id === catalogueCategoryId
    );
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
