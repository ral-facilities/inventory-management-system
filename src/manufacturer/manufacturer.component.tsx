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
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import { useManufacturers } from '../api/manufacturer';
import AddManufacturerDialog from './manufacturerDialog.component';
import { ManufacturerDetail } from '../app.types';

function Manufacturer() {
  const [addManufacturer, setAddManufacturer] =
    React.useState<ManufacturerDetail>({
      name: '',
      url: '',
      address: {
        building_number: '',
        street_name: '',
        town: '',
        county: '',
        postCode: '',
      },
      telephone: '',
    });

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const { data: ManufacturerData } = useManufacturers();

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const tableHeight = `calc(100vh)-(64px + 36px +50px)`;
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'right',
          padding: '9.75px', //px to match wdith of catalogue page
          margin: '4px',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setAddManufacturerDialogOpen(true)}
        >
          Add Manufacturer
        </Button>
        <AddManufacturerDialog
          open={addManufacturerDialogOpen}
          onClose={() => setAddManufacturerDialogOpen(false)}
          manufacturer={addManufacturer}
          onChangeManufacturerDetails={setAddManufacturer}
        />
      </Box>
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
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0',
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Telephone</Typography>
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
                    <Link underline="hover" href={item.url}>
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
                    {item.address.building_number +
                      ' \n' +
                      item.address.street_name +
                      ' \n' +
                      item.address.town +
                      ' \n' +
                      item.address.county +
                      ' \n' +
                      item.address.postCode}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.telephone}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Manufacturer;
