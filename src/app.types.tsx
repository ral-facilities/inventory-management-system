export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface AddCatalogueCategory {
  name?: string;
  parent_id?: string;
  is_leaf: boolean;
  catalogue_item_properties?: CatalogueCategoryFormData[];
}

export interface AddCatalogueCategoryResponse {
  name: string;
  code: string;
  path: string;
  parent_path: string;
  parent_id: string | null;
  is_leaf: boolean;
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

export interface CatalogueCategoryFormData {
  name: string;
  type: string;
  unit?: string;
  mandatory: boolean | null;
}

export interface ErrorParsing {
  detail: string;
}
