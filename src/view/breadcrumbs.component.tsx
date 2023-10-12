import { NavigateNext } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  styled,
  IconButton,
} from '@mui/material';
import React from 'react';
import { BreadcrumbsInfo } from '../app.types';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbsProps {
  onChangeNode: (newId: string) => void;
  breadcrumbsInfo: BreadcrumbsInfo | undefined;
  onChangeNavigateHome: () => void;
}

const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  color: 'rgba(0, 0, 0, 0.6)',
}));

const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { onChangeNode, breadcrumbsInfo, onChangeNavigateHome } = props;

  const emptyElement = ['', ''];

  const trailPrefix =
    breadcrumbsInfo && !breadcrumbsInfo.full_trail
      ? [emptyElement, [<MoreHorizIcon />, '']]
      : [emptyElement];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={onChangeNavigateHome}
        aria-label="navigate to catalogue home"
      >
        <HomeIcon />
      </IconButton>
      <StyledBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbsInfo &&
          trailPrefix.concat(breadcrumbsInfo.trail).map((value, currIndex) => {
            const name = value[0];
            const id = value[1];

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
