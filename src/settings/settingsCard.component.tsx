import { Button, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router';

export interface BaseSettingsCardProps {
  title: string;
}

export type SettingsCardLinkProps = BaseSettingsCardProps & {
  to: string;
  onOpen?: never;
};

export type SettingsCardActionProps = BaseSettingsCardProps & {
  onOpen: () => void;
  to?: never;
};

export type SettingsCardProps = SettingsCardLinkProps | SettingsCardActionProps;

function SettingsCard(props: SettingsCardProps) {
  const { title, ...rest } = props;

  // Decide whether we render as a Link or a Button
  const isLink = 'to' in rest && typeof rest.to === 'string';

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Button
        component={isLink ? Link : 'button'}
        {...(isLink ? { to: rest.to } : { onClick: rest.onOpen })}
        sx={{
          display: 'flex',
          width: '100%',
          textDecoration: 'none',
          color: 'inherit',
          position: 'relative',
        }}
      >
        <Card
          sx={{
            padding: 1,
            width: '100%',
            display: 'flex',
            height: 100,
          }}
        >
          <CardContent
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <Grid sx={{ position: 'relative' }}>
              <Typography>{title}</Typography>
            </Grid>
          </CardContent>
        </Card>
      </Button>
    </Grid>
  );
}

export default SettingsCard;
