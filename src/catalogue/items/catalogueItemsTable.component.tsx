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
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CatalogueCategoryFormData, CatalogueItem } from '../../app.types';

export interface CatalogueItemsTableProps {
  tableHeight: string;
  data: CatalogueItem[];
  catalogueItemProperties: CatalogueCategoryFormData[];
}

const CatalogueItemsTable: React.FC<CatalogueItemsTableProps> = (props) => {
  const { tableHeight, data, catalogueItemProperties } = props;

  const theme = useTheme();

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  return (
    <TableContainer style={{ height: tableHeight }}>
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
              <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                backgroundColor:
                  hoveredRow === index ? theme.palette.action.hover : 'inherit',
              }}
              key={item.id}
            >
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CatalogueItemsTable;
