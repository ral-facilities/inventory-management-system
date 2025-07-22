import {
  Box,
  Collapse,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { Link } from 'react-router';
import { CatalogueItem, Item } from '../api/api.types';
import { useGetManufacturer } from '../api/manufacturers';
import { useGetSystem } from '../api/systems';
import PrimaryImage from '../common/images/primaryImage.component';
import { formatDateTimeStrings } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      <Collapse in={value === index}>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </Collapse>
    </div>
  );
}

export interface ItemsDetailsPanelProps {
  itemData: Item;
  catalogueItemIdData: CatalogueItem;
}

function ItemsDetailsPanel(props: ItemsDetailsPanelProps) {
  const { catalogueItemIdData, itemData } = props;
  const [tabValue, setTabValue] = React.useState(0);
  const { data: manufacturerData } = useGetManufacturer(
    catalogueItemIdData.manufacturer_id
  );
  const { data: systemData } = useGetSystem(itemData.system_id);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Grid
      container
      spacing={0}
      // Stop any further propagation to prevent a table select from being triggered
      // by clicks inside this grid
      onClick={(e) => e.stopPropagation()}
      sx={{
        flexDirection: 'column',
      }}
    >
      <Grid sx={{ mb: 4 }} size={12}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Properties" />
          <Tab label="Manufacturer" />
          <Tab label="Notes" />
        </Tabs>
      </Grid>
      <Grid sx={{ ml: 2 }} size={12}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={0}>
            <Grid
              size={{ xs: 12, sm: 6 }}
              sx={{
                padding: 1,
              }}
            >
              <PrimaryImage entityId={itemData.id} isDetailsPanel />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h4" sx={{ wordWrap: 'break-word' }}>
                {catalogueItemIdData.name}
              </Typography>
              <Typography sx={{ my: 1 }} variant="h6">
                Description:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                  whiteSpace: 'pre-line',
                  wordWrap: 'break-word',
                }}
              >
                {catalogueItemIdData.description ?? 'None'}
              </Typography>
            </Grid>
            <Grid container spacing={0}>
              <Grid size={{ xs: 12, sm: 6 }} key={0}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Serial Number
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    wordWrap: 'break-word',
                  }}
                >
                  {itemData.serial_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={1}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Asset Number
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    wordWrap: 'break-word',
                  }}
                >
                  {itemData.asset_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={2}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Purchase Order Number
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    wordWrap: 'break-word',
                  }}
                >
                  {itemData.purchase_order_number ?? 'None'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={3}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Warranty End Date
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {itemData.warranty_end_date
                    ? formatDateTimeStrings(itemData.warranty_end_date, false)
                    : 'None'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} key={4}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Delivered Date
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {itemData.delivered_date
                    ? formatDateTimeStrings(itemData.delivered_date, false)
                    : 'None'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={5}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Is Defective
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {itemData.is_defective ? 'Yes' : 'No'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={6}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Usage Status
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    wordWrap: 'break-word',
                  }}
                >
                  {itemData.usage_status}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={7}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  System
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    wordWrap: 'break-word',
                  }}
                >
                  <MuiLink
                    component={Link}
                    underline="hover"
                    target="_blank"
                    to={'/systems/' + systemData?.id}
                  >
                    {systemData?.name}
                  </MuiLink>
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={8}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Last Modified
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {formatDateTimeStrings(itemData.modified_time, true)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} key={9}>
                <Typography
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Created
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {formatDateTimeStrings(itemData.created_time, true)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={0}>
            {itemData.properties.length === 0 ? (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                None
              </Typography>
            ) : (
              itemData.properties.map((property, index) => {
                return (
                  <Grid
                    key={index}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Typography
                      align="left"
                      sx={{
                        color: 'text.primary',
                        wordWrap: 'break-word',
                      }}
                    >{`${property.name} ${
                      property.unit ? `(${property.unit})` : ''
                    }`}</Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Typography
                        align="left"
                        sx={{
                          color: 'text.secondary',
                          wordWrap: 'break-word',
                        }}
                      >
                        {property.value !== null
                          ? String(property.value)
                          : 'None'}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={0}>
            <Grid
              key={0}
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Typography
                sx={{
                  color: 'text.primary',
                }}
              >
                Manufacturer Name
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                <MuiLink
                  underline="hover"
                  component={Link}
                  to={`/manufacturers/${manufacturerData?.id}`}
                >
                  {manufacturerData?.name}
                </MuiLink>
              </Typography>
            </Grid>
            <Grid
              key={1}
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Typography
                sx={{
                  color: 'text.primary',
                }}
              >
                Manufacturer URL
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.url ? (
                  <MuiLink
                    component={Link}
                    underline="hover"
                    target="_blank"
                    to={manufacturerData.url}
                  >
                    {manufacturerData.url}
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
              }}
            >
              <Typography
                align="left"
                sx={{
                  color: 'text.primary',
                }}
              >
                Telephone number
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.telephone ?? 'None'}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Typography
                align="left"
                sx={{
                  color: 'text.primary',
                }}
              >
                Address
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.address.address_line}
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.address.town}
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.address.county}
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.address.country}
              </Typography>
              <Typography
                align="left"
                sx={{
                  color: 'text.secondary',
                  wordWrap: 'break-word',
                }}
              >
                {manufacturerData?.address.postcode}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box
            sx={{
              width: '100%',
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                whiteSpace: 'pre-line',
              }}
            >
              {itemData.notes ?? 'None'}
            </Typography>
          </Box>
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default ItemsDetailsPanel;
