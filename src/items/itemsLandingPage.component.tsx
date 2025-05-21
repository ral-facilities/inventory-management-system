import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import { Box, Divider, LinearProgress, Link as MuiLink } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogueCategory, CatalogueItem, Item } from '../api/api.types';
import { useGetCatalogueCategory } from '../api/catalogueCategories';
import { useGetCatalogueItem } from '../api/catalogueItems';
import { useGetItem } from '../api/items';
import { useGetManufacturer } from '../api/manufacturers';
import { useGetSystem } from '../api/systems';
import ActionMenu from '../common/actionMenu.component';
import PrimaryImage from '../common/images/primaryImage.component';
import TabView from '../common/tab/tabView.component';
import { formatDateTimeStrings } from '../utils';
import ItemDialog from './itemDialog.component';

const ItemsActionMenu = (props: {
  catalogueItem: CatalogueItem;
  catalogueCategory: CatalogueCategory;
  item: Item;
}) => {
  const { catalogueItem, catalogueCategory, item } = props;
  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);
  return (
    <ActionMenu
      ariaLabelPrefix="items landing page"
      printMenuItem
      uploadAttachmentsEntityId={item.id}
      uploadImagesEntityId={item.id}
      editMenuItem={{
        onClick: () => setEditItemDialogOpen(true),
        dialog: (
          <>
            {editItemDialogOpen && (
              <ItemDialog
                open={editItemDialogOpen}
                onClose={() => {
                  setEditItemDialogOpen(false);
                }}
                requestType="patch"
                catalogueCategory={catalogueCategory}
                catalogueItem={catalogueItem}
                selectedItem={item}
              />
            )}
          </>
        ),
      }}
    />
  );
};

function ItemsLandingPage() {
  const {
    catalogue_category_id: catalogueCategoryId,
    catalogue_item_id: catalogueItemId,
    item_id: itemId,
  } = useParams();

  const { data: itemData, isLoading: itemDataIsLoading } = useGetItem(itemId);

  const { data: catalogueItemData, isLoading: catalogueItemDataIsLoading } =
    useGetCatalogueItem(catalogueItemId);

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataIsLoading,
  } = useGetCatalogueCategory(catalogueCategoryId);

  const { data: systemData } = useGetSystem(itemData?.system_id);

  const { data: manufacturer } = useGetManufacturer(
    catalogueItemData?.manufacturer_id
  );

  return (
    <Grid container flexDirection="column">
      {(!itemDataIsLoading ||
        !catalogueItemDataIsLoading ||
        !catalogueCategoryDataIsLoading) &&
        catalogueItemData &&
        itemData &&
        catalogueCategoryData && (
          <Grid container justifyContent="center" size={12}>
            <Grid
              container
              display="inline-block"
              style={{ maxWidth: '80%' }}
              size={10}
            >
              {/* Image Section */}
              <Grid>
                <Grid container>
                  <Grid size="auto">
                    <PrimaryImage entityId={itemData.id} />
                  </Grid>
                  {/* Title and Description Section */}
                  <Grid container sx={{ alignItems: 'flex-start', pl: 2 }} size="grow">
                    <Grid size={12}>
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                          fontWeight: 'bold',
                          wordWrap: 'break-word',
                        }}
                      >
                        {catalogueItemData.name}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Serial Number: {itemData.serial_number ?? 'None'}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Description:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
                        color="text.secondary"
                      >
                        {catalogueItemData.description ?? 'None'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Actions Section */}

                  <ItemsActionMenu
                    item={itemData}
                    catalogueItem={catalogueItemData}
                    catalogueCategory={catalogueCategoryData}
                  />
                </Grid>
              </Grid>

              <TabView
                defaultTab="Information"
                ariaLabelPrefix="items landing page"
                galleryEntityId={itemData.id}
                galleryOrder={1}
                attachmentsEntityId={itemData.id}
                attachmentsOrder={2}
                tabData={[
                  {
                    value: 'Information',
                    icon: <InfoOutlinedIcon />,
                    component: (
                      <Grid container spacing={1} mt={1} size={12}>
                        <Grid
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'start',
                          }}
                          size={12}
                        >
                          <Typography variant="h6">Details</Typography>
                          <Divider sx={{ width: '100%', mt: 1 }} />
                        </Grid>

                        <Grid container size={12}>
                          <Grid container spacing={1}>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Serial Number
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                sx={{ wordWrap: 'break-word' }}
                              >
                                {itemData.serial_number ?? 'None'}
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Asset Number
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                sx={{ wordWrap: 'break-word' }}
                              >
                                {itemData.asset_number ?? 'None'}
                              </Typography>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Purchase Order Number
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                sx={{ wordWrap: 'break-word' }}
                              >
                                {itemData.purchase_order_number ?? 'None'}
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Warranty End Date
                              </Typography>
                              <Typography align="left" color="text.secondary">
                                {itemData.warranty_end_date
                                  ? formatDateTimeStrings(
                                      itemData.warranty_end_date,
                                      false
                                    )
                                  : 'None'}
                              </Typography>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Delivered Date
                              </Typography>
                              <Typography align="left" color="text.secondary">
                                {itemData.delivered_date
                                  ? formatDateTimeStrings(
                                      itemData.delivered_date,
                                      false
                                    )
                                  : 'None'}
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Is Defective
                              </Typography>
                              <Typography align="left" color="text.secondary">
                                {itemData.is_defective ? 'Yes' : 'No'}
                              </Typography>
                            </Grid>

                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Usage Status
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                sx={{ wordWrap: 'break-word' }}
                              >
                                {itemData.usage_status}
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                System
                              </Typography>
                              <Typography
                                align="left"
                                color="text.secondary"
                                sx={{ wordWrap: 'break-word' }}
                              >
                                <MuiLink
                                  underline="hover"
                                  component={Link}
                                  to={'/systems/' + systemData?.id}
                                >
                                  {systemData?.name}
                                </MuiLink>
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Last modified
                              </Typography>
                              <Typography align="left" color="text.secondary">
                                {formatDateTimeStrings(
                                  itemData.modified_time,
                                  true
                                )}
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                              }}>
                              <Typography align="left" color="text.primary">
                                Created
                              </Typography>
                              <Typography align="left" color="text.secondary">
                                {formatDateTimeStrings(
                                  itemData.created_time,
                                  true
                                )}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'start',
                            mt: 3,
                          }}
                          size={12}
                        >
                          <Typography variant="h6">Properties</Typography>
                          <Divider sx={{ width: '100%', mt: 1 }} />
                        </Grid>
                        <Grid container size={12}>
                          <Grid container spacing={1}>
                            {itemData.properties.length === 0 ? (
                              <Grid>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  None
                                </Typography>
                              </Grid>
                            ) : (
                              itemData.properties.map((property, index) => (
                                <Grid
                                  key={index}
                                  size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 4
                                  }}>
                                  <Typography
                                    align="left"
                                    color="text.primary"
                                    sx={{ wordWrap: 'break-word' }}
                                  >{`${property.name} ${
                                    property.unit ? `(${property.unit})` : ''
                                  }`}</Typography>
                                  <Typography
                                    align="left"
                                    color="text.secondary"
                                    sx={{ wordWrap: 'break-word' }}
                                  >
                                    {property.value !== null
                                      ? String(property.value)
                                      : 'None'}
                                  </Typography>
                                </Grid>
                              ))
                            )}
                          </Grid>
                        </Grid>

                        <Grid
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'start',
                            mt: 3,
                          }}
                          size={12}
                        >
                          <Typography variant="h6">Manufacturer</Typography>
                          <Divider sx={{ width: '100%', mt: 1 }} />
                        </Grid>

                        {manufacturer && (
                          <Grid container size={12}>
                            <Grid container spacing={1} size={12}>
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 6,
                                  md: 4
                                }}>
                                <Typography align="left" color="text.primary">
                                  Name
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  <MuiLink
                                    underline="hover"
                                    component={Link}
                                    to={`/manufacturers/${manufacturer.id}`}
                                  >
                                    {manufacturer.name}
                                  </MuiLink>
                                </Typography>
                              </Grid>
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 6,
                                  md: 4
                                }}>
                                <Typography align="left" color="text.primary">
                                  URL
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer.url ? (
                                    <MuiLink
                                      component={Link}
                                      underline="hover"
                                      target="_blank"
                                      to={manufacturer.url}
                                    >
                                      {manufacturer.url}
                                    </MuiLink>
                                  ) : (
                                    'None'
                                  )}
                                </Typography>
                              </Grid>
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 6,
                                  md: 4
                                }}>
                                <Typography align="left" color="text.primary">
                                  Telephone number
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.telephone ?? 'None'}
                                </Typography>
                              </Grid>
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 6,
                                  md: 4
                                }}>
                                <Typography align="left" color="text.primary">
                                  Address
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.address.address_line}
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.address.town}
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.address.county}
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.address.country}
                                </Typography>
                                <Typography
                                  align="left"
                                  color="text.secondary"
                                  sx={{ wordWrap: 'break-word' }}
                                >
                                  {manufacturer?.address.postcode}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    ),
                    order: 0,
                  },
                  {
                    value: 'Notes',
                    icon: <NotesIcon />,
                    component: (
                      <Typography
                        sx={{
                          mt: 1,
                          mb: 3,
                          whiteSpace: 'pre-line',
                          wordWrap: 'break-word',
                        }}
                        variant="body1"
                        color="text.secondary"
                      >
                        {itemData.notes ?? 'None'}
                      </Typography>
                    ),
                    order: 3,
                  },
                ]}
              />
            </Grid>
          </Grid>
        )}
      {(itemDataIsLoading ||
        catalogueItemDataIsLoading ||
        catalogueCategoryDataIsLoading) && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Grid>
  );
}

export default ItemsLandingPage;
