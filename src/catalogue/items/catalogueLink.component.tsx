import { Link as MuiLink, type SxProps, type Theme } from '@mui/material';
import type React from 'react';
import { Link } from 'react-router-dom';
import { useGetCatalogueItem } from '../../api/catalogueItems';
import { useGetItem } from '../../api/items';

export interface CatalogueLinkBaseProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export interface CatalogueLinkCatalogueItemProps
  extends CatalogueLinkBaseProps {
  catalogueItemId: string;
  itemId?: never;
}

export interface CatalogueLinkItemProps extends CatalogueLinkBaseProps {
  catalogueItemId?: never;
  itemId: string;
}

export type CatalogueLinkProps =
  | CatalogueLinkCatalogueItemProps
  | CatalogueLinkItemProps;

const CatalogueLink = (props: CatalogueLinkProps) => {
  const { catalogueItemId, itemId, children, sx } = props;

  const { data: item } = useGetItem(itemId);

  const { data: catalogueItem } = useGetCatalogueItem(
    catalogueItemId || item?.catalogue_item_id
  );

  if ((!catalogueItem && !item) || !catalogueItem) {
    return children;
  }
  let link: string = '';

  if (catalogueItem)
    link = `/catalogue/${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}`;

  if (item)
    link = `/catalogue/${catalogueItem.catalogue_category_id}/items/${catalogueItem.id}/items/${item.id}`;

  return (
    <MuiLink underline="hover" component={Link} to={link} sx={sx}>
      {children}
    </MuiLink>
  );
};

export default CatalogueLink;
