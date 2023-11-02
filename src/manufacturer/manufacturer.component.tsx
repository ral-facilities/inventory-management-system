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
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import { ManufacturerDetail, ViewManufacturerResponse } from '../app.types';
import ManufacturerDialog from './manufacturerDialog.component';

function Manufacturer() {
  const [Manufacturer, setManufacturer] = React.useState<ManufacturerDetail>({
    name: '',
    url: undefined,
    address: {
      address_line: '',
      town: '',
      county: '',
      postcode: '',
      country: '',
    },
    telephone: '',
  });

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const { data: ManufacturerData } = useManufacturers();

  const [deleteManufacturerDialog, setDeleteManufacturerDialog] =
    React.useState<boolean>(false);

  const [selectedManufacturer, setSelectedManufacturer] = React.useState<
    ViewManufacturerResponse | undefined
  >(undefined);

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
        <ManufacturerDialog
          open={addManufacturerDialogOpen}
          onClose={() => setAddManufacturerDialogOpen(false)}
          manufacturer={Manufacturer}
          onChangeManufacturerDetails={setManufacturer}
          type="create"
        />
        <ManufacturerDialog
          open={editManufacturerDialogOpen}
          onClose={() => setEditManufacturerDialogOpen(false)}
          manufacturer={Manufacturer}
          onChangeManufacturerDetails={setManufacturer}
          type="edit"
          selectedManufacturer={selectedManufacturer}
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
                        onClick={() => {
                          setEditManufacturerDialogOpen(true);
                          setSelectedManufacturer(item);
                          setManufacturer(item);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Delete ${item.name} manufacturer`}
                        onClick={() => {
                          setDeleteManufacturerDialog(true);
                          setSelectedManufacturer(item);
                        }}
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
                    {item.address.country +
                      ' \n' +
                      item.address.address_line +
                      ' \n' +
                      item.address.town +
                      ' \n' +
                      item.address.county +
                      ' \n' +
                      item.address.postcode}
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
      <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
      />
    </Box>
  );
}

export default Manufacturer;
