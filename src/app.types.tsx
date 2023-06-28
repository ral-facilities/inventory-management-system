export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface CatalogueCategory {
  name?: string;
  parent_id?: string;
}

export interface CatalogueCategoryResponse {
  name: string;
  code: string;
  path: string;
  parent_path: string;
  parent_id: string | null;
}
