export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface AddCatalogueCategory {
  name?: string;
  parent_id?: string;
  is_leaf: boolean;
}

export interface EditCatalogueCategory {
  name?: string;
  id: string;
}

export interface CatalogueCategory {
  id: string;
  name: string;
  parent_path: string;
  path: string;
  parent_id: string | null;
  code: string;
  is_leaf: boolean;
}
