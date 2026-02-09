import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Tooltip, Typography } from '@mui/material';
import { SystemType } from '../api/api.types';

interface SystemTypeInformationTooltipProps {
  title: string;
  systemTypesData: SystemType[] | undefined;
}

/*
<Box sx={{ alignItems: 'center', display: 'flex' }}>
            <Tooltip
              title={
                <Typography style={{ whiteSpace: 'pre-line' }}>
                  {systemTypeTooltip}
                </Typography>
              }
            >
              <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            </Tooltip>
            {column.columnDef.header}
          </Box>
*/

export const SystemTypeColumnHeaderInformationTooltip = ({
  title,
  systemTypesData,
}: SystemTypeInformationTooltipProps) => {
  const systemTypeValues = systemTypesData?.map((type) => type.value);
  const systemTypeDescription = systemTypesData?.map(
    (type) => type.description
  );

  let systemTypeTooltip = '';
  if (systemTypesData == undefined) {
    systemTypeTooltip = 'No system types';
  } else {
    if (systemTypeValues && systemTypeDescription) {
      for (let i = 0; i < systemTypeValues.length; i++) {
        systemTypeTooltip =
          systemTypeTooltip.concat(
            systemTypeValues[i] +
              ': ' +
              (systemTypeDescription[i] || 'No system type description')
          ) + '\n';
      }
    }
  }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex' }}>
      <Tooltip
        title={
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {systemTypeTooltip}
          </Typography>
        }
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
      </Tooltip>
      {title}
    </Box>
  );
};
