import React from 'react';
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
  Tooltip,
  Link,
  LinearProgress,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CatalogueCategory } from '../../app.types';
import { useCatalogueItems } from '../../api/catalogueItem';

export interface CatalogueItemsTableProps {
  parentInfo: CatalogueCategory;
}

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const { parentInfo } = props;
  // SG header + SG footer + tabs #add breadcrumbs
  const tableHeight = `calc(100vh - (64px + 36px + 50px)`;

  const catalogueItemProperties = parentInfo.catalogue_item_properties ?? [];

  const { data, isLoading } = useCatalogueItems(parentInfo.id);

  const theme = useTheme();

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  return (
    <TableContainer style={{ height: tableHeight }}>
      {isLoading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 2, // Add z-index to keep headers above action buttons
            }}
          >
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                Description
              </Typography>
            </TableCell>
            {catalogueItemProperties &&
              catalogueItemProperties.map((property) => (
                <TableCell
                  key={property.name}
                  sx={{
                    borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                    borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {property.unit
                      ? `${property.name} (${property.unit})`
                      : property.name}
                  </Typography>
                </TableCell>
              ))}
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Manufacturer Name
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Manufacturer URL
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Manufacturer Address
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.map((item, index) => (
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
                      aria-label={`Edit ${item.name} catalogue item`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${item.name} catalogue item`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    px: '8px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
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
                    width: '100px',
                  }}
                >
                  {item.description !== '' && (
                    <Tooltip
                      title={item.description}
                      placement="top"
                      enterTouchDelay={0}
                      arrow
                      aria-label={`Catalogue item description: ${item.description}`}
                    >
                      <InfoOutlinedIcon />
                    </Tooltip>
                  )}
                </TableCell>
                {catalogueItemProperties &&
                  catalogueItemProperties.length >= 1 &&
                  catalogueItemProperties.map((property, index) => (
                    <TableCell
                      sx={{
                        px: '8px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        borderRight: '1px solid #e0e0e0',
                      }}
                      key={index}
                    >
                      {item.properties
                        ? String(
                            item.properties.find(
                              (prop) => prop.name === property.name
                            )?.value !== undefined
                              ? item.properties.find(
                                  (prop) => prop.name === property.name
                                )?.value
                              : ''
                          )
                        : ''}
                    </TableCell>
                  ))}
                <TableCell
                  sx={{
                    px: '8px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  {item.manufacturer.name}
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
                    target="_blank"
                    href={item.manufacturer.web_url}
                  >
                    {item.manufacturer.web_url}
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
                  {item.manufacturer.address}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {!data?.length && !isLoading && (
        <Box
          sx={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>No results found</Typography>
          <Typography>
            There are no items. Try adding an item by using the Add Catalogue
            Item button in the top right of your screen
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default CatalogueItemsTable;
