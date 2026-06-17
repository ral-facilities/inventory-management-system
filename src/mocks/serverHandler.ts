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
];
