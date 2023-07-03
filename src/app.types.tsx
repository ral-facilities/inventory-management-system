export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface ViewCatalogueCategoryResponse {
  id: string;
  name: string;
  parent_path: string;
  path: string;
  parent_id: string;
  code: string;
  is_leaf: boolean;
}
