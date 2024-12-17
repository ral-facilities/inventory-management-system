import {
  Button,
  Card,
  CardContent,
  Grid,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

interface BaseAdminCardProps {
  label: string;
  type: 'page' | 'dialog';
}

interface PageAdminCardProps extends BaseAdminCardProps {
  type: 'page';
  link: string;
  onClick?: never;
}

interface DialogAdminCardProps extends BaseAdminCardProps {
  type: 'dialog';
  link?: never;
  onClick: () => void;
}

export type AdminCardProps = PageAdminCardProps | DialogAdminCardProps;

const buttonStyles: SxProps<Theme> = {
  display: 'flex',
  width: '100%',
  textDecoration: 'none',
  color: 'inherit',
  position: 'relative',
};
const AdminCard = (props: AdminCardProps) => {
  const { link, label, type, onClick } = props;

  const cardContent = (
    <Card
      sx={{
        padding: '8px',
        width: '100%',
        display: 'flex',
        height: '100px',
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
        <Grid>
          <Grid position={'relative'}>
            <Typography>{label}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (type === 'page' && link) {
    return (
      <Button component={Link} to={link} fullWidth sx={buttonStyles}>
        {cardContent}
      </Button>
    );
  }

  return (
    <Button onClick={onClick} fullWidth sx={buttonStyles}>
      {cardContent}
    </Button>
  );
};

export default AdminCard;
