import { Button, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router';

export interface AdminCardProps {
  title: string;
  to: string;
}

function AdminCard(props: AdminCardProps) {
  const { title, to } = props;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Button
        component={Link}
        to={to}
        fullWidth
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
            <Grid sx={{ position: 'relative' }}>
              <Typography>{title}</Typography>
            </Grid>
          </CardContent>
        </Card>
      </Button>
    </Grid>
  );
}

export default AdminCard;
