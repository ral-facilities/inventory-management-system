import { NavigateNext } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  styled,
} from '@mui/material';
import React from 'react';

export interface BreadcrumbsProps {
  currNode: string;
  onChangeNode: (newNode: string) => void;
}

const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  color: 'rgba(0, 0, 0, 0.6)',
}));
const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { currNode, onChangeNode } = props;
  // special handling for '/' otherwise we get ['','']
  const nodePath = currNode === '/' ? [''] : currNode.split('/');

  return (
    <Box>
      <StyledBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        {nodePath.map((value, currIndex) => {
          const label = value.length ? value : '';

          // final node, render as non-"link"
          if (currIndex === nodePath.length - 1) {
            return (
              <Typography key={label} color="text.primary">
                {label}
              </Typography>
            );
          } else {
            return (
              <Link
                key={label}
                href="#"
                onClick={(ev) => {
                  // prevent default to stop the href="#" adding a hash to the URL
                  // and potentially jumping the page
                  ev.preventDefault();
                  onChangeNode(nodePath.slice(0, currIndex + 1).join('/'));
                }}
              >
                {label}
              </Link>
            );
          }
        })}
      </StyledBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
