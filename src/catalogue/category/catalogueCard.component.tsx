import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import {
  MRT_SelectCheckbox,
  MRT_ToggleRowActionMenuButton,
  type MRT_Cell,
  type MRT_Row,
  type MRT_TableInstance,
} from 'material-react-table';
import { Link } from 'react-router-dom';
import { CatalogueCategory } from '../../api/api.types';
import { OverflowTip, formatDateTimeStrings } from '../../utils';
export interface CatalogueCardProps {
  table: MRT_TableInstance<CatalogueCategory>;
  card: MRT_Cell<CatalogueCategory>;
}

function CatalogueCard(props: CatalogueCardProps) {
  const { table, card } = props;
  const selectedCategories = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const isSelected = selectedCategories.some(
    (category) => category.id === card.row.original.id
  );
  return (
    <Button
      component={Link}
      to={`/catalogue/${card.row.original.id}${card.row.original.is_leaf ? '/items' : ''}`}
      fullWidth
      sx={{
        display: 'flex',
        width: '100%',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative', // Make the parent container relative
      }}
    >
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          height: '100px',
          backgroundColor: isSelected
            ? table.options.mrtTheme.selectedRowBackgroundColor
            : undefined,
        }}
      >
        <CardActions>
          <MRT_SelectCheckbox
            row={card.row as MRT_Row<CatalogueCategory>}
            table={table}
            sx={{
              margin: 0.5,
            }}
          />
        </CardActions>
        <CardContent
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <OverflowTip>{card.row.original.name}</OverflowTip>
        </CardContent>
        <CardActions>
          <MRT_ToggleRowActionMenuButton
            cell={card as MRT_Cell<CatalogueCategory>}
            row={card.row as MRT_Row<CatalogueCategory>}
            table={table}
            sx={{
              margin: 0.5,
            }}
          />
        </CardActions>
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "text.secondary",
            position: 'absolute',
            bottom: '8px',
            right: '12px'
          }}>
          {`Last modified: ${formatDateTimeStrings(card.row.original.modified_time, true)}`}
        </Typography>
      </Card>
    </Button>
  );
}

export default CatalogueCard;
