import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { CatalogueItemPropertyTemplate } from '../app.types';
import { imsApi } from './api';

const fetchCatalogueItemPropertyTemplates = async (): Promise<
  CatalogueItemPropertyTemplate[]
> => {
  return imsApi
    .get('/v1/catalogue-item-property-templates')
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueItemPropertyTemplates = (): UseQueryResult<
  CatalogueItemPropertyTemplate[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['CatalogueItemPropertyTemplates'],
    queryFn: () => {
      return fetchCatalogueItemPropertyTemplates();
    },
  });
};
