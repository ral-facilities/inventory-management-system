import React from 'react';
import Typography from '@mui/material/Typography';
import { Grid, Box, Paper, Button, alpha, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import DGLogo from '/images/scigateway-white-text-blue-mark-logo.svg';
import BackgroundImage from '/images/background.jpg';
import GreenSwirl1Image from '/images/green-swirl1.png';
import GreenSwirl2Image from '/images/green-swirl2.png';
import Decal1Image from '/images/decal1.svg';
import Decal2Image from '/images/decal2.svg';
import Decal2DarkImage from '/images/decal2-dark.svg';
import Decal2DarkHCImage from '/images/decal2-darkhc.svg';
import FacilityImage from '/images/facility.jpg';
import { InventoryManagementSystemSettingsContext } from '../configProvider.component';

export interface BaseHomePageProps {
  logo: string;
  backgroundImage: string;
  greenSwirl1Image: string;
  greenSwirl2Image: string;
  decal1Image: string;
  decal2Image: string;
  decal2DarkImage: string;
  decal2DarkHCImage: string;
  facilityImage: string;
}

const backgroundTitleStyles = {
  color: '#FFFFFF',
  margin: 'auto',
  fontSize: '48px',
  fontWeight: 'lighter',
  textAlign: 'center',
};

const paperStyles = {
  borderRadius: '4px',
  marginBottom: 2,
  height: '100%',
};

const paperContentStyles = {
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const PaperHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.homePage?.heading,
  marginBottom: theme.spacing(2),
}));

const PaperDescription = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.contrastGrey,
  marginBottom: theme.spacing(2),
}));

const BluePaperHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  color: '#FFFFFF',
  marginBottom: theme.spacing(2),
}));

const BluePaperDescription = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.homePage?.blueDescription,
  marginBottom: theme.spacing(2),
}));

interface BrowseDecalProps {
  decal2Image: string;
  decal2DarkImage: string;
  decal2DarkHCImage: string;
}

const BrowseDecal = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'decal2Image' &&
    prop !== 'decal2DarkImage' &&
    prop !== 'decal2DarkHCImage',
})<BrowseDecalProps>(
  ({ theme, decal2Image, decal2DarkImage, decal2DarkHCImage }) => ({
    backgroundImage:
      theme.palette.mode === 'light'
        ? `url(${decal2Image})`
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (theme as any).colours?.type === 'default'
          ? `url(${decal2DarkImage})`
          : `url(${decal2DarkHCImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'auto 100%',
    height: '100%',
  })
);

const LightBlueButton = styled(Button)(({ theme }) => ({
  color: '#FFFFFF',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundColor: (theme as any).colours?.homePage?.blueButton,
  '&:hover': {
    //Check if null to avoid error when loading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    backgroundColor: (theme as any).colours?.homePage?.blueButton
      ? alpha(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (theme as any).colours?.homePage?.blueButton,
          0.8
        )
      : '#FFFFFF',
  },
}));

const BaseHomePage = (props: BaseHomePageProps): React.ReactElement => {
  return (
    <div id="dg-homepage">
      <div
        style={{
          backgroundImage: `url(${props.backgroundImage})`,
          backgroundPosition: 'center 40%',
          width: '100%',
          height: 250,
        }}
      >
        <div
          style={{
            backgroundImage: `url(${props.greenSwirl1Image}), url(${props.decal1Image})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top left, top right',
            width: '100%',
            height: 250,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              left: '50%',
              top: '45px',
              transform: 'translate(-50%)',
            }}
          >
            <Typography variant="h2" sx={backgroundTitleStyles}>
              <strong>Inventory Management</strong>
            </Typography>
            <Typography variant="h2" sx={backgroundTitleStyles}>
              for <strong>EPAC</strong>
            </Typography>
          </Box>
        </div>
      </div>
      <Box
        sx={{
          transform: 'translate(0px, -20px)',
          marginLeft: '8%',
          marginRight: '8%',
        }}
      >
        <Paper sx={paperStyles} elevation={1}>
          <Grid container style={{ height: '100%' }}>
            <Grid item xs={6}>
              <Box sx={paperContentStyles}>
                <Typography
                  variant="h3"
                  sx={(theme) => ({
                    fontWeight: 'bold',
                    fontSize: '32px',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (theme as any).colours?.homePage?.heading,
                    marginBottom: theme.spacing(2),
                  })}
                >
                  {'Catalogue'}
                </Typography>
                <PaperDescription variant="body1">
                  {
                    'Browse catalogue categories, sub categories and catalogue items to locate specific items or add new ones.'
                  }
                </PaperDescription>
                <Box marginTop="16px">
                  <Button
                    sx={(theme) => ({
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      backgroundColor: (theme as any).colours?.darkBlue,
                    })}
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={'/catalogue'}
                    data-testid="catalogue-button"
                  >
                    {'Explore'}
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <div
                style={{
                  backgroundImage: `url(${props.facilityImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom right',
                  backgroundSize: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                }}
              >
                <BrowseDecal
                  decal2Image={props.decal2Image}
                  decal2DarkImage={props.decal2DarkImage}
                  decal2DarkHCImage={props.decal2DarkHCImage}
                />
              </div>
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item sm={12} md={4}>
            <Paper sx={paperStyles} elevation={1}>
              <Box sx={paperContentStyles}>
                <PaperHeading variant="h4">{'Systems'}</PaperHeading>
                <PaperDescription variant="body1">
                  {
                    'Navigate through systems and their sub systems to view their component items.'
                  }
                </PaperDescription>
                <Box marginTop="auto">
                  <Button
                    sx={(theme) => ({
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      backgroundColor: (theme as any).colours?.darkBlue,
                    })}
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={'/systems'}
                    data-testid="systems-button"
                  >
                    {'Explore'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item sm={12} md={4}>
            <Paper sx={paperStyles} elevation={1}>
              <Box sx={paperContentStyles}>
                <PaperHeading variant="h4">{'Manufacturers'}</PaperHeading>
                <PaperDescription variant="body1">
                  {'View the manufacturers of parts used by EPAC.'}
                </PaperDescription>
                <Box marginTop="auto">
                  <Button
                    sx={(theme) => ({
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      backgroundColor: (theme as any).colours?.darkBlue,
                    })}
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={'/manufacturers'}
                    data-testid="manufacturer-button"
                  >
                    {'Explore'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item sm={12} md={4}>
            <Paper
              sx={{ ...paperStyles, backgroundColor: '#003088' }}
              elevation={1}
            >
              <div
                style={{
                  backgroundImage: `url(${props.greenSwirl2Image})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top right',
                  backgroundSize: 'auto 100%',
                  height: '100%',
                }}
              >
                <Box sx={paperContentStyles}>
                  <BluePaperHeading variant="h4">{'EPAC'}</BluePaperHeading>
                  <BluePaperDescription color="#ffffff" variant="body1">
                    {
                      'World-leading centre for scientific and industrial research.'
                    }
                  </BluePaperDescription>
                  <Box marginTop="auto">
                    <LightBlueButton
                      color="primary"
                      variant="contained"
                      href={
                        'https://www.clf.stfc.ac.uk/Pages/EPAC-Applications.aspx'
                      }
                      data-testid="facility-button"
                    >
                      {'Read more'}
                    </LightBlueButton>
                  </Box>
                </Box>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export const HomePage = React.memo((): React.ReactElement => {
  const settings = React.useContext(InventoryManagementSystemSettingsContext);
  const pluginHost = settings.pluginHost;

  const HomePage = BaseHomePage;
  return (
    <HomePage
      logo={pluginHost + DGLogo}
      backgroundImage={pluginHost + BackgroundImage}
      greenSwirl1Image={pluginHost + GreenSwirl1Image}
      greenSwirl2Image={pluginHost + GreenSwirl2Image}
      decal1Image={pluginHost + Decal1Image}
      decal2Image={pluginHost + Decal2Image}
      decal2DarkImage={pluginHost + Decal2DarkImage}
      decal2DarkHCImage={pluginHost + Decal2DarkHCImage}
      facilityImage={pluginHost + FacilityImage}
    />
  );
});
HomePage.displayName = 'HomePage';
