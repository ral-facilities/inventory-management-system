export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface AddCatalogueCategory {
  name?: string;
  parent_id?: string;
  is_leaf: boolean;
}

export interface AddCatalogueCategoryResponse {
  name: string;
  code: string;
  path: string;
  parent_path: string;
  parent_id: string | null;
}

export interface ViewCatalogueCategoryResponse {
  id: string;
  name: string;
  parent_path: string;
  path: string;
  parent_id: string | null;
  code: string;
  is_leaf: boolean;
}
