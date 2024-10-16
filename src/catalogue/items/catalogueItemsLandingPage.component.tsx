import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Link as MuiLink,
  Tabs,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BreadcrumbsInfo } from '../../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategory,
} from '../../api/catalogueCategories';
import { useGetCatalogueItem } from '../../api/catalogueItems';
import { useGetManufacturer } from '../../api/manufacturers';
import PlaceholderImage from '../../common/placeholderImage.component';
import {
  a11yProps,
  CATALOGUE_LANDING_PAGE_TAB_VALUES,
  CatalogueLandingPageTabValue,
  defaultCatalogueLandingPageIconMapping,
  StyledTab,
} from '../../common/tab/tab.utils';
import TabPanel from '../../common/tab/tabPanel.component';
import { formatDateTimeStrings } from '../../utils';
import Breadcrumbs from '../../view/breadcrumbs.component';
import { useNavigateToCatalogue } from '../catalogue.component';
import CatalogueItemsDialog from './catalogueItemsDialog.component';

function CatalogueItemsLandingPage() {
  const { catalogue_item_id: catalogueItemId } = useParams();
  const navigateToCatalogue = useNavigateToCatalogue();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: catalogueItemIdData, isLoading: catalogueItemIdDataLoading } =
    useGetCatalogueItem(catalogueItemId);

  const { data: catalogueBreadcrumbs } = useGetCatalogueBreadcrumbs(
    catalogueItemIdData?.catalogue_category_id
  );
  const { data: catalogueCategoryData } = useGetCatalogueCategory(
    catalogueItemIdData?.catalogue_category_id
  );

  const [catalogueLandingBreadcrumbs, setCatalogueLandingBreadcrumbs] =
    React.useState<BreadcrumbsInfo | undefined>(catalogueBreadcrumbs);

  React.useEffect(() => {
    if (catalogueBreadcrumbs && catalogueItemIdData)
      setCatalogueLandingBreadcrumbs({
        ...catalogueBreadcrumbs,
        trail: [
          ...catalogueBreadcrumbs.trail,
          [`item/${catalogueItemIdData.id}`, catalogueItemIdData.name],
        ],
      });
  }, [catalogueBreadcrumbs, catalogueItemIdData]);

  const { data: manufacturer } = useGetManufacturer(
    catalogueItemIdData?.manufacturer_id
  );

  const [editItemDialogOpen, setEditItemDialogOpen] =
    React.useState<boolean>(false);

  // Retrieve the tab value from the URL or default to "Information"
  const urlTabValue =
    (searchParams.get('tab') as CatalogueLandingPageTabValue) || 'Information';
  const [tabValue, setTabValue] =
    React.useState<CatalogueLandingPageTabValue>(urlTabValue);

  React.useEffect(() => {
    const value = searchParams.get('tab');
    if (!value) setSearchParams({ tab: 'Information' }, { replace: true });
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    setTabValue(urlTabValue);
  }, [urlTabValue]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: CatalogueLandingPageTabValue
  ) => {
    setTabValue(newValue);
    setSearchParams({ tab: newValue }, { replace: true });
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid container flexDirection="column">
      <Grid
        sx={{
          justifyContent: 'left',
          paddingLeft: '4px',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
          '@media print': {
            display: 'none',
          },
        }}
        item
        container
      >
        <Grid item sx={{ py: 2.5 }}>
          <Breadcrumbs
            onChangeNode={navigateToCatalogue}
            breadcrumbsInfo={catalogueLandingBreadcrumbs}
            onChangeNavigateHome={() => navigateToCatalogue(null)}
            homeLocation="Catalogue"
          />
        </Grid>
      </Grid>
      {catalogueItemIdData && (
        <Grid item container justifyContent="center" xs={12}>
          <Grid item xs={10} style={{ maxWidth: '80%' }}>
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

              {/* Actions Section */}
              <Grid
                item
                xs={12}
                container
                sm={2}
                sx={{
                  textAlign: 'right',
                  alignItems: 'top',
                  justifyContent: 'flex-end',
                  '@media print': {
                    display: 'none',
                  },
                }}
              >
                <Grid item>
                  <Typography
                    variant="body1"
                    sx={{ display: 'inline-block', mr: 1 }}
                  >
                    Actions
                  </Typography>
                  <IconButton
                    onClick={handleMenuClick}
                    sx={{
                      border: '1px solid',
                      borderRadius: 1,
                      padding: '6px',
                    }}
                    aria-label="catalogue items landing page actions menu"
                  >
                    <ExpandMoreIcon />
                  </IconButton>

                  {/* Menu Component */}
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{
                      '@media print': {
                        display: 'none',
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setEditItemDialogOpen(true);
                        handleMenuClose();
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        window.print();
                        handleMenuClose();
                      }}
                    >
                      <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                      Print
                    </MenuItem>
                  </Menu>
                  <Button
                    sx={{ display: 'inline-block', ml: 0.5, py: '5.75px' }}
                    variant="outlined"
                    component={Link}
                    to={'items'}
                  >
                    Items
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="catalogue items landing page view tabs"
              >
                {CATALOGUE_LANDING_PAGE_TAB_VALUES.map((value) => (
                  <StyledTab
                    icon={defaultCatalogueLandingPageIconMapping[value]}
                    iconPosition="start"
                    value={value}
                    label={value}
                    key={value}
                    {...a11yProps(value)}
                  />
                ))}
              </Tabs>
            </Grid>
            <TabPanel<CatalogueLandingPageTabValue>
              value={tabValue}
              label="Information"
            >
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
                        Obsolete
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.is_obsolete ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Obsolete replacement link
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.obsolete_replacement_catalogue_item_id ? (
                          <MuiLink
                            component={Link}
                            underline="hover"
                            target="_blank"
                            to={`/catalogue/item/${catalogueItemIdData.obsolete_replacement_catalogue_item_id}`}
                          >
                            Click here
                          </MuiLink>
                        ) : (
                          'None'
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
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

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Cost (£)
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.cost_gbp ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Cost to rework (£)
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.cost_to_rework_gbp ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Time to replace (days)
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.days_to_replace ?? 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography align="left" color="text.primary">
                        Time to rework (days)
                      </Typography>
                      <Typography align="left" color="text.secondary">
                        {catalogueItemIdData.days_to_rework ?? 'None'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
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

                    <Grid item xs={12} sm={6} md={4}>
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
                    <Grid item xs={12} sm={6} md={4}>
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
                    <Grid item xs={12} sm={6} md={4}>
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
                    <Grid item xs={12} sm={6} md={4}>
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
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                  }}
                >
                  <Typography variant="h6">Properties</Typography>
                  <Divider sx={{ width: '100%', mt: 1 }} />
                </Grid>
                <Grid container item xs={12}>
                  <Grid container item spacing={1}>
                    {catalogueItemIdData.properties &&
                      catalogueItemIdData.properties.map((property, index) => (
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
            </TabPanel>
            <TabPanel<CatalogueLandingPageTabValue>
              value={tabValue}
              label="Gallery"
            ></TabPanel>
            <TabPanel<CatalogueLandingPageTabValue>
              value={tabValue}
              label="Attachments"
            ></TabPanel>
            <TabPanel<CatalogueLandingPageTabValue>
              value={tabValue}
              label="Notes"
            >
              <Grid container item xs={12}>
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
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      )}
      {!catalogueItemIdDataLoading ? (
        !catalogueItemIdData && (
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
              This catalogue item doesn&#39;t exist. Please click the Home
              button on the top left of your screen to navigate to the catalogue
              home.
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      <CatalogueItemsDialog
        open={editItemDialogOpen}
        onClose={() => setEditItemDialogOpen(false)}
        parentInfo={catalogueCategoryData}
        selectedCatalogueItem={catalogueItemIdData}
        requestType="patch"
      />
    </Grid>
  );
}

export default CatalogueItemsLandingPage;
