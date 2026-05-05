import InfoOutlined from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { JobStatus } from '../../api/api.types';
import { useGetJob, usePostJob } from '../../api/jobs';
import handleIMS_APIError from '../../handleIMS_APIError';
import handleTransferState from '../../handleTransferState';
import { useAppSelector } from '../../state/hook';
import { selectAuthorisation } from '../../state/slices/authorisationSlice';
import { formatDateTimeStrings } from '../../utils';

export interface CriticalityJobDialogProps {
  open: boolean;
  onClose: () => void;
}

function CriticalityJobDialog(props: CriticalityJobDialogProps) {
  const { open, onClose } = props;
  const jobId = 'criticality';

  const { isAdminMode } = useAppSelector(selectAuthorisation);
  const { data: job, isLoading, refetch, error } = useGetJob(jobId);
  const { mutateAsync: postJob, isPending: isPostPending } = usePostJob(jobId);

  const isRunning = job?.status === JobStatus.Running;

  const handlePostJob = React.useCallback(() => {
    postJob()
      .then(() => {
        handleTransferState([
          {
            name: 'Criticality',
            message: 'Job successfully sent to scheduler.',
            state: 'success',
          },
        ]);
        onClose();
      })
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
      });
  }, [onClose, postJob]);
  React.useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {!isLoading && !(job && typeof job === 'object') && (
          <WarningIcon sx={{ mr: 1 }} />
        )}
        Criticality Job
        {isAdminMode && (
          <Tooltip
            title="As an admin, manually trigger the criticality job to run"
            data-testid={'admin-status-tooltip'}
            placement="top"
            enterTouchDelay={0}
            arrow
            sx={{ mx: 2 }}
          >
            <InfoOutlined />
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent>
        <Box>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading &&
            (job && typeof job === 'object' ? (
              <>
                <Typography variant="h6">Status:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {job.status ?? 'Unknown'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Last Started:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {job.last_executed_start_time
                    ? formatDateTimeStrings(job.last_executed_start_time, true)
                    : 'None'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Last Finished:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {job.last_executed_end_time
                    ? formatDateTimeStrings(job.last_executed_end_time, true)
                    : 'None'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Last Successful Start:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {job.last_successful_executed_start_time
                    ? formatDateTimeStrings(
                        job.last_successful_executed_start_time,
                        true
                      )
                    : 'None'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Last Successful End:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {job.last_successful_executed_end_time
                    ? formatDateTimeStrings(
                        job.last_successful_executed_end_time,
                        true
                      )
                    : 'None'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Last Successful Duration:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {typeof job.last_successful_duration_seconds === 'number'
                    ? `${job.last_successful_duration_seconds}s`
                    : 'None'}
                </Typography>
                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h6">Next Scheduled:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {formatDateTimeStrings(
                    job.next_scheduled_execution_time,
                    true
                  )}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6">Status:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {error?.response?.status === 404
                    ? 'Job not found. Please contact support.'
                    : 'Not enabled. Please contact support to enable it.'}
                </Typography>
              </>
            ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>

        {isAdminMode && !isLoading && job && typeof job === 'object' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostJob}
            disabled={isRunning || isPostPending}
          >
            {isRunning ? 'Job Running…' : 'Run Job'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CriticalityJobDialog;
