import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { APISettingsContext } from '../apiConfigProvider.component';

export interface SparesInformationTooltipProps {
  title: string;
}

export const SparesColumnHeaderInformationTooltip = ({
  title,
}: SparesInformationTooltipProps) => {
  const sparesDefinition =
    React.useContext(APISettingsContext).spares?.sparesDefinition;
  console.log(sparesDefinition);

  let tooltipContent =
    'The spares values is determined by the location of an item. ';

  if (sparesDefinition == undefined || sparesDefinition == '') {
    tooltipContent = tooltipContent.concat(
      'Currently there is no spares definition. '
    );
  } else {
    const sparesSystemTypeValues = sparesDefinition.system_types.map(
      (type) => "'" + type.value + "'"
    );
    tooltipContent = tooltipContent.concat(
      'When an item is in a system with the system type '
    );
    for (let i = 0; i < sparesSystemTypeValues.length; i++) {
      if (i == sparesSystemTypeValues.length - 1) {
        tooltipContent = tooltipContent.concat(sparesSystemTypeValues[i]);
      } else {
        tooltipContent = tooltipContent.concat(
          sparesSystemTypeValues[i] + ', '
        );
      }
    }
    tooltipContent = tooltipContent.concat(
      ' then it is classified as a spare.'
    );
  }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex' }}>
      <Tooltip
        title={
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {tooltipContent}
          </Typography>
        }
        aria-label="Spares Info Tooltip"
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
      </Tooltip>
      {title}
    </Box>
  );
};
