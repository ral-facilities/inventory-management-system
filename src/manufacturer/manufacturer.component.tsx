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
import AddManufacturerDialog from './addManufacturerDialog.component';
import { ViewManufacturerResponse } from '../app.types';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';

function Manufacturer() {
  const [manufacturerDialogOpen, setManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const { data: ManufacturerData, refetch: manufacturerDataRefetch } =
    useManufacturers();

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
          onClick={() => setManufacturerDialogOpen(true)}
        >
          Add Manufacturer
        </Button>
        <AddManufacturerDialog
          open={manufacturerDialogOpen}
          onClose={() => setManufacturerDialogOpen(false)}
          refetchData={() => manufacturerDataRefetch()}
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
      <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
        refetchData={() => manufacturerDataRefetch()}
      />
    </Box>
  );
}

export default Manufacturer;
