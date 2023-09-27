import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  useTheme,
  Box,
  Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import { useManufacturers } from '../api/manufacturer';

function Manufacturer() {
  const { data: ManufacturerData } = useManufacturers();

  console.log(ManufacturerData);

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const tableHeight = `calc(100vh)-(64px + 36px +50px)`;
  const theme = useTheme();

  return (
    <TableContainer style={{ height: tableHeight }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 2,
            }}
          >
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>
            </TableCell>

            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>URL</Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>Address</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ManufacturerData &&
            ManufacturerData.map((item, index) => (
              <TableRow
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  backgroundColor:
                    hoveredRow === index
                      ? theme.palette.action.hover
                      : 'inherit',
                }}
                key={item.id}
                aria-label={`${item.name} row`}
              >
                <TableCell
                  sx={{ borderRight: '1px solid #e0e0e0', width: '100px' }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${item.name} manufacturer`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${item.name} manufacturer`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  {item.name}
                </TableCell>
                <TableCell
                  sx={{
                    px: '8px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  <Link
                    underline="hover"
                    color={'primary'}
                    href={'http://' + item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.url}
                  </Link>
                </TableCell>
                <TableCell
                  sx={{
                    px: '8px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  {item.address}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Manufacturer;
