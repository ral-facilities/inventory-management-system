import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Link as MuiLink,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogueCategory, CatalogueItem } from '../../api/api.types';
import { useGetCatalogueCategory } from '../../api/catalogueCategories';
import { useGetCatalogueItem } from '../../api/catalogueItems';
import { useGetManufacturer } from '../../api/manufacturers';
import ActionMenu from '../../common/actionMenu.component';
import PrimaryImage from '../../common/images/primaryImage.component';
import TabView from '../../common/tab/tabView.component';
import { formatDateTimeStrings } from '../../utils';
import CatalogueItemsDialog from './catalogueItemsDialog.component';
import CatalogueLink from './catalogueLink.component';

const CatalogueItemsActionMenu = (props: {
  catalogueItem: CatalogueItem;
  catalogueCategory: CatalogueCategory;
}) => {
  const { catalogueItem, catalogueCategory } = props;
  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);
  return (
    <ActionMenu
      ariaLabelPrefix="catalogue items landing page"
      uploadAttachmentsEntityId={catalogueItem.id}
      uploadImagesEntityId={catalogueItem.id}
      printMenuItem
      editMenuItem={{
        onClick: () => setEditItemDialogOpen(true),
        dialog: (
          <CatalogueItemsDialog
            open={editItemDialogOpen}
            onClose={() => setEditItemDialogOpen(false)}
            parentInfo={catalogueCategory}
            selectedCatalogueItem={catalogueItem}
            requestType="patch"
          />
        ),
      }}
    />
  );
};

function CatalogueItemsLandingPage() {
  const {
    catalogue_category_id: catalogueCategoryId,
    catalogue_item_id: catalogueItemId,
  } = useParams();

  const { data: catalogueItemIdData, isLoading: catalogueItemIdDataLoading } =
    useGetCatalogueItem(catalogueItemId);

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useGetCatalogueCategory(catalogueCategoryId);

  const isParentCorrect =
    catalogueItemIdData?.catalogue_category_id === catalogueCategoryId;

  const { data: manufacturer } = useGetManufacturer(
    catalogueItemIdData?.manufacturer_id
  );

  return (
    <Grid container flexDirection="column">
      {catalogueItemIdData && catalogueCategoryData && isParentCorrect && (
        <Grid container justifyContent="center" xs={12}>
          <Grid
            container
            xs={10}
            display="inline-block"
            style={{ maxWidth: '80%' }}
          >
            {/* Image Section */}
            <Grid>
              <Grid container>
                <Grid xs="auto">
                  <PrimaryImage entityId={catalogueItemId ?? ''} />
                </Grid>
                {/* Title and Description Section */}
                <Grid container xs sx={{ alignItems: 'flex-start', pl: 2 }}>
                  <Grid xs={12}>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        wordWrap: 'break-word',
                      }}
                    >
                      {catalogueItemIdData.name}
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Description:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
                      color="text.secondary"
                    >
                      {catalogueItemIdData.description ?? 'None'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid xs>
                  <Grid container justifyContent={'flex-end'}>
                    {/* Actions Section */}
                    <Grid>
                      <CatalogueItemsActionMenu
                        catalogueItem={catalogueItemIdData}
                        catalogueCategory={catalogueCategoryData}
                      />
                    </Grid>
                    <Grid>
                      <Button
                        sx={{ ml: 0.5, py: '5.75px' }}
                        variant="outlined"
                        component={Link}
                        to={'items'}
                        startIcon={<InventoryOutlinedIcon />}
                      >
                        Items
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <TabView
              defaultTab="Information"
              ariaLabelPrefix="catalogue items landing page"
              galleryEntityId={catalogueItemIdData.id}
              galleryOrder={1}
              attachmentsEntityId={catalogueItemIdData.id}
              attachmentsOrder={2}
              tabData={[
                {
                  value: 'Information',
                  icon: <InfoOutlinedIcon />,
                  component: (
                    <Grid container spacing={1} xs={12} mt={1}>
                      <Grid
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

                      <Grid container xs={12}>
                        <Grid container spacing={1}>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Obsolete
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Obsolete replacement link
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.obsolete_replacement_catalogue_item_id ? (
                                <CatalogueLink
                                  catalogueItemId={
                                    catalogueItemIdData.obsolete_replacement_catalogue_item_id
                                  }
                                >
                                  Click here
                                </CatalogueLink>
                              ) : (
                                'None'
                              )}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Obsolete reason
                            </Typography>
                            <Typography
                              align="left"
                              color="text.secondary"
                              sx={{ wordWrap: 'break-word' }}
                            >
                              {catalogueItemIdData.obsolete_reason ?? 'None'}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Cost (£)
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.cost_gbp ?? 'None'}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Cost to rework (£)
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Time to replace (days)
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.days_to_replace ?? 'None'}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Time to rework (days)
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.days_to_rework ?? 'None'}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Expected Lifetime (days)
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {catalogueItemIdData.expected_lifetime_days ??
                                'None'}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Drawing Number
                            </Typography>
                            <Typography
                              align="left"
                              color="text.secondary"
                              sx={{ wordWrap: 'break-word' }}
                            >
                              {catalogueItemIdData.drawing_number ?? 'None'}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Drawing link
                            </Typography>
                            <Typography
                              align="left"
                              color="text.secondary"
                              sx={{ wordWrap: 'break-word' }}
                            >
                              {catalogueItemIdData.drawing_link ? (
                                <MuiLink
                                  underline="hover"
                                  target="_blank"
                                  href={catalogueItemIdData.drawing_link}
                                >
                                  {catalogueItemIdData.drawing_link}
                                </MuiLink>
                              ) : (
                                'None'
                              )}
                            </Typography>
                          </Grid>

                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Model Number
                            </Typography>
                            <Typography
                              align="left"
                              color="text.secondary"
                              sx={{ wordWrap: 'break-word' }}
                            >
                              {catalogueItemIdData.item_model_number ?? 'None'}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Last Modified
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {formatDateTimeStrings(
                                catalogueItemIdData.modified_time,
                                true
                              )}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={6} md={4}>
                            <Typography align="left" color="text.primary">
                              Created
                            </Typography>
                            <Typography align="left" color="text.secondary">
                              {formatDateTimeStrings(
                                catalogueItemIdData.created_time,
                                true
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid
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
                      <Grid container xs={12}>
                        <Grid container spacing={1}>
                          {catalogueItemIdData.properties.length === 0 ? (
                            <Grid>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                None
                              </Typography>
                            </Grid>
                          ) : (
                            catalogueItemIdData.properties.map(
                              (property, index) => (
                                <Grid xs={12} sm={6} md={4} key={index}>
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
                              )
                            )
                          )}
                        </Grid>
                      </Grid>

                      <Grid
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
                        <Grid container xs={12}>
                          <Grid container spacing={1} xs={12}>
                            <Grid xs={12} sm={6} md={4}>
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
                            <Grid xs={12} sm={6} md={4}>
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
                            <Grid xs={12} sm={6} md={4}>
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
                            <Grid xs={12} sm={6} md={4}>
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
                      {catalogueItemIdData.notes ?? 'None'}
                    </Typography>
                  ),
                  order: 3,
                },
              ]}
            />
          </Grid>
        </Grid>
      )}
      {(catalogueItemIdDataLoading || catalogueCategoryDataLoading) && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Grid>
  );
}

export default CatalogueItemsLandingPage;
