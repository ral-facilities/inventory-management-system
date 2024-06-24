import { NavigateNext } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  IconButton,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  styled,
} from '@mui/material';
import { BreadcrumbsInfo } from '../app.types';
import { OverflowTip } from '../utils';

export interface BreadcrumbsProps {
  breadcrumbsInfo?: BreadcrumbsInfo;
  onChangeNode: (newId: string) => void;
  onChangeNavigateHome: () => void;
  navigateHomeAriaLabel: string;
}

const StyledBreadcrumbs = styled(MuiBreadcrumbs)({
  color: 'text.secondary',
});

const Breadcrumbs = (props: BreadcrumbsProps) => {
  const {
    breadcrumbsInfo,
    onChangeNode,
    onChangeNavigateHome,
    navigateHomeAriaLabel,
  } = props;

  const emptyElement = ['', ''];

  const trailPrefix =
    breadcrumbsInfo && !breadcrumbsInfo.full_trail
      ? [emptyElement, ['', <MoreHorizIcon key="trailPrefix" />]]
      : [emptyElement];
  // Defines the maximum width of each breadcrumb item within the navigation bar,
  // ensuring it occupies 100% of the view width minus 10% for the sci-gateway navigation,
  // dynamically adjusting based on the number of breadcrumbs available.
  const breadcrumbMaxWidth = `${(100 - 10) / trailPrefix.concat(breadcrumbsInfo?.trail ?? emptyElement).length}vw`;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={onChangeNavigateHome}
        aria-label={navigateHomeAriaLabel}
      >
        <HomeIcon />
      </IconButton>
      <StyledBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        itemsBeforeCollapse={9}
      >
        {breadcrumbsInfo &&
          trailPrefix.concat(breadcrumbsInfo.trail).map((value, currIndex) => {
            const name = value[1];
            const id = value[0];

            // final node, render as non-"link"
            if (
              currIndex ===
              breadcrumbsInfo.trail.length + trailPrefix.length - 1
            ) {
              return typeof name === 'string' && name != '' ? (
                <OverflowTip
                  key={id as string}
                  sx={{ color: 'text.primary', maxWidth: breadcrumbMaxWidth }}
                >
                  {name}
                </OverflowTip>
              ) : (
                <Box key={currIndex} sx={{ paddingTop: '6px' }}>
                  {name}
                </Box>
              );
            } else if (typeof name === 'object') {
              return (
                <Box key={currIndex} sx={{ paddingTop: '6px' }}>
                  {name}
                </Box>
              );
            } else {
              return typeof name === 'string' && name != '' ? (
                <Link
                  aria-label={name}
                  key={id as string}
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    onChangeNode(id as string);
                  }}
                >
                  <OverflowTip sx={{ maxWidth: breadcrumbMaxWidth }}>
                    {name}
                  </OverflowTip>
                </Link>
              ) : (
                <Box key={currIndex} sx={{ paddingTop: '6px' }}>
                  {name}
                </Box>
              );
            }
          })}
      </StyledBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
