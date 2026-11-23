import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component.tsx';
import BaseLayoutHeader from '../common/baseLayoutHeader.component.tsx';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, redirect } from 'react-router';
import { CodeContentSchema } from './codeContent.schema.tsx';
import { getItemQuery } from '../api/items.tsx';
import { getCatalogueItemQuery } from '../api/catalogueItems.tsx';
import paths from '../paths.tsx';

export const CodeRedirectErrorComponent = () => (
  <PageNotFoundComponent homeLocation="Catalogue" />
);

export const CodeRedirectLayoutErrorComponent = () => {
  return (
    <BaseLayoutHeader homeLocation="Catalogue">
      <CodeRedirectErrorComponent />
    </BaseLayoutHeader>
  );
};

export const codeRedirectLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    const { oid, type } = CodeContentSchema.parse(
      Object.fromEntries(searchParams)
    );

    switch (type) {
      case 'system': {
        return redirect(paths.system.replace(':system_id', oid));
      }
      case 'item': {
        const item = await queryClient.ensureQueryData(getItemQuery(oid, true));
        const catalogueItem = await queryClient.ensureQueryData(
          getCatalogueItemQuery(item.catalogue_item_id, true)
        );
        return redirect(
          paths.item
            .replace(
              ':catalogue_category_id',
              catalogueItem.catalogue_category_id
            )
            .replace(':catalogue_item_id', catalogueItem.id)
            .replace(':item_id', item.id)
        );
      }
    }
  };
