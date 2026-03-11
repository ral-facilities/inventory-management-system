import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useGetJob } from '../api/jobScheduler';
import handleTransferState from '../handleTransferState';
import { useAppDispatch, useAppSelector } from '../state/hook';
import {
  selectCriticality,
  setIsCriticalMode,
} from '../state/slices/criticalitySlice';
import { formatDateTimeStrings } from '../utils';

const CriticalitySettingsMenuItem = () => {
  const jobId = 'criticality';

  const { data: job, error } = useGetJob(jobId);
  const { isCriticalMode } = useAppSelector(selectCriticality);
  const dispatch = useAppDispatch();

  const handleCriticalMode = React.useCallback(() => {
    dispatch(setIsCriticalMode(!isCriticalMode));
    if (!isCriticalMode) {
      if (job && typeof job === 'object') {
        handleTransferState([
          {
            name: 'Critical Mode',
            message: `Enabled. Status: ${job?.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Idle'} Last Executed: ${job.last_successful_executed_start_time ? formatDateTimeStrings(job.last_successful_executed_start_time, true) : 'None'} Next Scheduled Run: ${job.next_scheduled_execution_time ? formatDateTimeStrings(job.next_scheduled_execution_time, true) : 'None'}`,
            state: 'info',
          },
        ]);
      } else if (error?.response?.status === 404) {
        handleTransferState([
          {
            name: 'Critical Mode',
            message: 'Job not found. Please contact support.',
            state: 'warning',
          },
        ]);
      } else {
        handleTransferState([
          {
            name: 'Critical Mode',
            message: 'Not enabled. Please contact support to enable it.',
            state: 'warning',
          },
        ]);
      }
    }
  }, [dispatch, error?.response?.status, isCriticalMode, job]);

  return (
    <MenuItem id="item-critical-mode" onClick={handleCriticalMode}>
      <ListItemIcon>
        <GppMaybeIcon />
      </ListItemIcon>
      <ListItemText
        primary={`Switch critical mode ${isCriticalMode ? 'off' : 'on'}`}
      />
    </MenuItem>
  );
};

export default CriticalitySettingsMenuItem;
