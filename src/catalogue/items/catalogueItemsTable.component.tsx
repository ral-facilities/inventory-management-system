import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItems } from '../../api/catalogueItem';
import {
  CatalogueCategory,
  CatalogueItem,
  CatalogueItemDetailsPlaceholder,
  CatalogueItemManufacturer,
} from '../../app.types';
import { matchCatalogueItemProperties } from '../catalogue.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import DeleteCatalogueItemsDialog from './deleteCatalogueItemDialog.component';

function generateUniqueName(
  existingNames: (string | undefined)[],
  originalName: string
) {
  let newName = originalName;
  let copyIndex = 1;

  while (existingNames.includes(newName)) {
    newName = `${originalName}_copy${copyIndex}`;
    copyIndex++;
  }

  return newName;
}
export interface CatalogueItemsTableProps {
  parentInfo: CatalogueCategory;
  catalogueItemDetails: CatalogueItemDetailsPlaceholder;
  onChangeCatalogueItemDetails: (
    catalogueItemDetails: CatalogueItemDetailsPlaceholder
  ) => void;
  catalogueItemManufacturer: CatalogueItemManufacturer;
  onChangeCatalogueItemManufacturer: (
    catalogueItemManufacturer: CatalogueItemManufacturer
  ) => void;
  catalogueItemPropertyValues: (string | number | boolean | null)[];
  onChangeCatalogueItemPropertyValues: (
    propertyValues: (string | number | boolean | null)[]
  ) => void;
  onChangeAddItemDialogOpen: (addItemDialogOpen: boolean) => void;
}

const CatalogueItemsTable = (props: CatalogueItemsTableProps) => {
  const {
    parentInfo,
    catalogueItemDetails,
    onChangeCatalogueItemDetails,
    catalogueItemManufacturer,
    onChangeCatalogueItemManufacturer,
    catalogueItemPropertyValues,
    onChangeCatalogueItemPropertyValues,
    onChangeAddItemDialogOpen,
  } = props;
  // SG header + SG footer + tabs #add breadcrumbs
  const tableHeight = `calc(100vh - (64px + 36px + 50px)`;

  const viewCatalogueItemProperties =
    parentInfo.catalogue_item_properties ?? [];

  const { data, isLoading } = useCatalogueItems(parentInfo.id);

  const theme = useTheme();

  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] =
    React.useState<boolean>(false);

  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);

  const [selectedCatalogueItem, setSelectedCatalogueItem] = React.useState<
    CatalogueItem | undefined
  >(undefined);

  const catalogueCategoryNames: (string | undefined)[] =
    data?.map((item) => item.name) || [];

  return (
    <TableContainer style={{ height: tableHeight }}>
      {isLoading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      {!isLoading && (
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

              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Obsolete
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Obsolete replacement link
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Obsolete reason
                </Typography>
              </TableCell>

              {viewCatalogueItemProperties &&
                viewCatalogueItemProperties.map((property) => (
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
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Cost (£)
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Cost to rework (£)
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Time to replace (days)
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Time to rework (days)
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Drawing Number
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderRight: '1px solid #e0e0e0', // Adjust the color and width as needed
                  borderTop: '1px solid #e0e0e0', // Adjust the color and width as needed
                }}
              >
                <Typography sx={{ fontWeight: 'bold', width: '100px' }}>
                  Model Number
                </Typography>
              </TableCell>
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
            {Array.isArray(data) &&
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
                        onClick={() => {
                          setEditItemDialogOpen(true);
                          onChangeCatalogueItemDetails({
                            catalogue_category_id: item.catalogue_category_id,
                            name: item.name,
                            description: item.description,
                            cost_gbp: String(item.cost_gbp),
                            cost_to_rework_gbp: item.cost_to_rework_gbp
                              ? String(item.cost_to_rework_gbp)
                              : null,
                            days_to_replace: String(item.days_to_replace),
                            days_to_rework: item.days_to_rework
                              ? String(item.days_to_rework)
                              : null,
                            drawing_number: item.drawing_number,
                            drawing_link: item.drawing_link,
                            item_model_number: item.item_model_number,
                            is_obsolete: String(item.is_obsolete),
                            obsolete_replacement_catalogue_item_id:
                              item.obsolete_replacement_catalogue_item_id,
                            obsolete_reason: item.obsolete_reason,
                          });
                          onChangeCatalogueItemPropertyValues(
                            matchCatalogueItemProperties(
                              parentInfo?.catalogue_item_properties ?? [],
                              item.properties ?? []
                            )
                          );
                          setSelectedCatalogueItem(item);
                          onChangeCatalogueItemManufacturer(item.manufacturer);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Save as ${item.name} catalogue item`}
                        onClick={() => {
                          onChangeAddItemDialogOpen(true);

                          onChangeCatalogueItemDetails({
                            catalogue_category_id: item.catalogue_category_id,
                            name: generateUniqueName(
                              catalogueCategoryNames,
                              item.name
                            ),
                            description: item.description,
                            cost_gbp: String(item.cost_gbp),
                            cost_to_rework_gbp: item.cost_to_rework_gbp
                              ? String(item.cost_to_rework_gbp)
                              : null,
                            days_to_replace: String(item.days_to_replace),
                            days_to_rework: item.days_to_rework
                              ? String(item.days_to_rework)
                              : null,
                            drawing_number: item.drawing_number,
                            drawing_link: item.drawing_link,
                            item_model_number: item.item_model_number,
                            is_obsolete: String(item.is_obsolete),
                            obsolete_replacement_catalogue_item_id:
                              item.obsolete_replacement_catalogue_item_id,
                            obsolete_reason: item.obsolete_reason,
                          });
                          onChangeCatalogueItemPropertyValues(
                            matchCatalogueItemProperties(
                              parentInfo?.catalogue_item_properties ?? [],
                              item.properties ?? []
                            )
                          );
                          setSelectedCatalogueItem(item);
                          onChangeCatalogueItemManufacturer(item.manufacturer);
                        }}
                      >
                        <SaveAsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Delete ${item.name} catalogue item`}
                        onClick={() => {
                          setDeleteItemDialogOpen(true);
                          setSelectedCatalogueItem(item);
                        }}
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
                    <MuiLink
                      underline="hover"
                      component={Link}
                      to={`items/${item.id}`}
                    >
                      {item.name}
                    </MuiLink>
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
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.is_obsolete ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.obsolete_replacement_catalogue_item_id && (
                      <MuiLink
                        underline="hover"
                        component={Link}
                        to={`items/${item.obsolete_replacement_catalogue_item_id}`}
                      >
                        Click here
                      </MuiLink>
                    )}
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
                    {item.obsolete_reason !== null && (
                      <Tooltip
                        title={item.obsolete_reason}
                        placement="top"
                        enterTouchDelay={0}
                        arrow
                        aria-label={`Catalogue item obsolete reason: ${item.obsolete_reason}`}
                      >
                        <InfoOutlinedIcon />
                      </Tooltip>
                    )}
                  </TableCell>
                  {viewCatalogueItemProperties &&
                    viewCatalogueItemProperties.length >= 1 &&
                    viewCatalogueItemProperties.map((property, index) => (
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
                    {item.cost_gbp}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.cost_to_rework_gbp}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.days_to_replace}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.days_to_rework}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.drawing_number}
                  </TableCell>
                  <TableCell
                    sx={{
                      px: '8px',
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {item.item_model_number}
                  </TableCell>
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
                    <MuiLink
                      underline="hover"
                      target="_blank"
                      href={item.manufacturer.web_url}
                    >
                      {item.manufacturer.web_url}
                    </MuiLink>
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
      )}
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
      <DeleteCatalogueItemsDialog
        open={deleteItemDialogOpen}
        onClose={() => setDeleteItemDialogOpen(false)}
        catalogueItem={selectedCatalogueItem}
        onChangeCatalogueItem={setSelectedCatalogueItem}
      />
      <CatalogueItemsDialog
        open={editItemDialogOpen}
        onClose={() => setEditItemDialogOpen(false)}
        parentId={parentInfo.id}
        catalogueItemDetails={catalogueItemDetails}
        onChangeCatalogueItemDetails={onChangeCatalogueItemDetails}
        catalogueItemManufacturer={catalogueItemManufacturer}
        onChangeCatalogueItemManufacturer={onChangeCatalogueItemManufacturer}
        catalogueItemPropertiesForm={
          parentInfo?.catalogue_item_properties ?? []
        }
        propertyValues={catalogueItemPropertyValues}
        onChangePropertyValues={onChangeCatalogueItemPropertyValues}
        selectedCatalogueItem={selectedCatalogueItem}
        type="edit"
      />
    </TableContainer>
  );
};

export default CatalogueItemsTable;
