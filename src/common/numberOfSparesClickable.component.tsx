import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Button, Link as MuiLink } from '@mui/material';
import LZString from 'lz-string';
import { MRT_ColumnFiltersState } from 'material-react-table';
import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CatalogueItem } from '../api/api.types';
import { useGetSparesDefinition } from '../api/settings';
import { areListsEqual } from '../utils';
import { State } from './preservedTableState.component';

export interface NumberOfSparesClickableProps {
  catalogueItem: CatalogueItem;
  type: 'link' | 'button';
  label?: string;
}

const extractValues = (filters: MRT_ColumnFiltersState) =>
  filters.flatMap((status) =>
    Array.isArray(status.value) ? status.value.map((val) => val.value) : []
  );

const NumberOfSparesClickable = (props: NumberOfSparesClickableProps) => {
  const { catalogueItem, type, label } = props;

  const { data: sparesDefinition } = useGetSparesDefinition();
  const [searchParams, _] = useSearchParams();
  const location = useLocation();

  const sparesFilter = sparesDefinition?.usage_statuses.map((status) => ({
    type: 'string',
    value: status.value,
  }));

  const sparesColumnsFilters: { cF: MRT_ColumnFiltersState } = React.useMemo(
    () => ({
      cF: [{ id: 'item.usage_status', value: sparesFilter ?? [] }],
    }),
    [sparesFilter]
  );
  const stringSparesColumnsFilters = JSON.stringify(sparesColumnsFilters);

  const sparesFilterState = sparesFilter
    ? `?state=${LZString.compressToEncodedURIComponent(stringSparesColumnsFilters)}`
    : '';

  const sparesLink = `/catalogue/item/${catalogueItem.id}/items${sparesFilterState}`;

  const [isCurrentState, setIsCurrentState] = React.useState<boolean>(false);

  const currentSearchParams = searchParams.get('state');

  React.useEffect(() => {
    if (currentSearchParams) {
      const decodedCurrentState: State = JSON.parse(
        LZString.decompressFromEncodedURIComponent(currentSearchParams)
      );

      const isUrlMatching =
        location.pathname === `/catalogue/item/${catalogueItem.id}/items`;

      const isOnlyCF =
        JSON.stringify(Object.keys(decodedCurrentState)) ===
        JSON.stringify(Object.keys(sparesColumnsFilters));

      setIsCurrentState(
        isUrlMatching &&
          isOnlyCF &&
          areListsEqual(
            extractValues(decodedCurrentState.cF),
            extractValues(sparesColumnsFilters.cF)
          )
      );
    } else {
      setIsCurrentState(false);
    }
  }, [catalogueItem.id, currentSearchParams, location, sparesColumnsFilters]);

  const displayValue = label?.trim() || catalogueItem.number_of_spares;
  return type === 'link' ? (
    <MuiLink underline="hover" component={Link} to={sparesLink}>
      {displayValue}
    </MuiLink>
  ) : (
    <Button
      variant="outlined"
      startIcon={<Inventory2OutlinedIcon />}
      sx={{ mx: 0.5 }}
      disabled={isCurrentState || sparesDefinition === undefined}
      component={Link}
      to={sparesLink}
    >
      {displayValue}
    </Button>
  );
};

export default NumberOfSparesClickable;
