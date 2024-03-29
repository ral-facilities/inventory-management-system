import { NavigateNext } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  styled,
  IconButton,
} from '@mui/material';
import { BreadcrumbsInfo } from '../app.types';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HomeIcon from '@mui/icons-material/Home';

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
              return (
                <Typography key={name as string} color="text.primary">
                  {name as string}
                </Typography>
              );
            } else if (typeof name === 'object') {
              return (
                <Box key={currIndex} sx={{ paddingTop: '6px' }}>
                  {name}
                </Box>
              );
            } else {
              return (
                <Link
                  key={id as string}
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    onChangeNode(id as string);
                  }}
                >
                  {name}
                </Link>
              );
            }
          })}
      </StyledBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
