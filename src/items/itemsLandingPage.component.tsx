import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import { Box, Divider, LinearProgress, Link as MuiLink } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategory,
} from '../api/catalogueCategories';
import { useGetCatalogueItem } from '../api/catalogueItems';
import { useGetItem } from '../api/items';
import { useGetManufacturer } from '../api/manufacturers';
import { useGetSystem } from '../api/systems';
import { useNavigateToCatalogue } from '../catalogue/catalogue.component';
import ActionMenu from '../common/actionMenu.component';
import PlaceholderImage from '../common/placeholderImage.component';
import { CatalogueLandingPageTabValue } from '../common/tab/tab.utils';
import TabView from '../common/tab/tabView.component';
import { formatDateTimeStrings } from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';
import ItemDialog from './itemDialog.component';

function ItemsLandingPage() {
  // Navigation

  const { item_id: id } = useParams();
  const navigateToCatalogue = useNavigateToCatalogue();

  const { data: itemData, isLoading: itemDataIsLoading } = useGetItem(id);

  const { data: catalogueItemData } = useGetCatalogueItem(
    itemData?.catalogue_item_id
  );

  const { data: catalogueCategoryData } = useGetCatalogueCategory(
    catalogueItemData?.catalogue_category_id
  );

  const { data: catalogueBreadcrumbs } = useGetCatalogueBreadcrumbs(
    catalogueItemData?.catalogue_category_id
  );

  const { data: systemData } = useGetSystem(itemData?.system_id);

  const [itemLandingBreadcrumbs, setItemLandingBreadcrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(catalogueBreadcrumbs);

  React.useEffect(() => {
    if (catalogueBreadcrumbs && catalogueItemData)
      setItemLandingBreadcrumbs({
        ...catalogueBreadcrumbs,
        trail: [
          ...catalogueBreadcrumbs.trail,
          [`item/${catalogueItemData.id}`, `${catalogueItemData.name}`],
          [`item/${catalogueItemData.id}/items`, 'Items'],
          [
            `item/${catalogueItemData.id}/items/${id}`,
            itemData?.serial_number ?? 'No serial number',
          ],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItemData, id, itemData?.serial_number]);

  const { data: manufacturer } = useGetManufacturer(
    catalogueItemData?.manufacturer_id
  );

  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);
  const [openUploadAttachmentsDialog, setOpenUploadAttachmentsDialog] =
    React.useState(false);

  return (
    <Grid container flexDirection="column">
      <Grid
        sx={{
          justifyContent: 'left',
          paddingLeft: 0.5,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
          '@media print': {
            display: 'none',
          },
        }}
        container
        item
      >
        <Grid item sx={{ py: 2.5 }}>
          <Breadcrumbs
            onChangeNode={navigateToCatalogue}
            breadcrumbsInfo={itemLandingBreadcrumbs}
            onChangeNavigateHome={() => navigateToCatalogue(null)}
            homeLocation="Catalogue"
          />
        </Grid>
      </Grid>
      {catalogueItemData && itemData && (
        <Grid item container justifyContent="center" xs={12}>
          <Grid
            item
            container
            xs={10}
            display="inline-block"
            style={{ maxWidth: '80%' }}
          >
            {/* Image Section */}
            <Grid item container xs={12}>
              <Grid item xs={12} sm={4}>
                <PlaceholderImage />
              </Grid>
              {/* Title and Description Section */}
              <Grid
                item
                container
                xs={12}
                sm={6}
                sx={{ alignItems: 'flex-start', pl: 2 }}
              >
                <Grid item xs={12}>
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

              <ActionMenu
                ariaLabelPrefix="items landing page"
                printMenuItem
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
                          catalogueCategory={catalogueCategoryData}
                          catalogueItem={catalogueItemData}
                          selectedItem={itemData}
                        />
                      )}
                    </>
                  ),
                }}
              />
            </Grid>

            <TabView<CatalogueLandingPageTabValue>
              defaultTab="Information"
              ariaLabelPrefix="items landing page"
              gallery
              galleryOrder={1}
              attachments
              attachmentsOrder={2}
              tabData={[
                {
                  value: 'Information',
                  icon: <InfoOutlinedIcon />,
                  component: (
                    <Grid item container spacing={1} xs={12} mt={1}>
                      <Grid
                        item
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                        }}
                      >
                        <Typography variant="h6">Details</Typography>
                        <Divider sx={{ width: '100%', mt: 1 }} />
                      </Grid>

                      <Grid item container xs={12}>
                        <Grid item container spacing={1}>
                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
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

                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
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

                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Is Defective
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {itemData.is_defective ? 'Yes' : 'No'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
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
                          <Grid item xs={12} sm={6} md={4}>
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
                        item
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          mt: 3,
                        }}
                      >
                        <Typography variant="h6">Properties</Typography>
                        <Divider sx={{ width: '100%', mt: 1 }} />
                      </Grid>
                      <Grid container item xs={12}>
                        <Grid container item spacing={1}>
                          {itemData.properties &&
                            itemData.properties.map((property, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
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
                            ))}
                        </Grid>
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          mt: 3,
                        }}
                      >
                        <Typography variant="h6">Manufacturer</Typography>
                        <Divider sx={{ width: '100%', mt: 1 }} />
                      </Grid>

                      {manufacturer && (
                        <Grid item container xs={12}>
                          <Grid container item spacing={1} xs={12}>
                            <Grid item xs={12} sm={6} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
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
      {!itemDataIsLoading ? (
        !itemData && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 1,
            }}
          >
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              No result found
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              This item doesn&#39;t exist. Please click the Home button to
              navigate to the catalogue home
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Grid>
  );
}

export default ItemsLandingPage;
