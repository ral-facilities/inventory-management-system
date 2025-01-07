import { CircularProgress, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { useGetCatalogueItem } from '../../api/catalogueItems';

export interface ObsoleteReplacementLinkProps {
  catalogueItemId: string;
}
const ObsoleteReplacementLink = (props: ObsoleteReplacementLinkProps) => {
  const { catalogueItemId } = props;

  const { data, isLoading } = useGetCatalogueItem(catalogueItemId);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!data) {
    return null;
  }

  return (
    <MuiLink
      underline="hover"
      component={Link}
      to={`/catalogue/${data.catalogue_category_id}/items/${data.id}`}
    >
      Click here
    </MuiLink>
  );
};

export default ObsoleteReplacementLink;
