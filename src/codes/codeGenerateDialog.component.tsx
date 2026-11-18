import { Download, QrCode } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel, Radio, RadioGroup, Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import React from 'react';
import { CatalogueItem, Item, System, SystemType } from '../api/api.types.tsx';
import handleTransferState from '../handleTransferState';
import paths from '../paths.tsx';
import { downloadBlobByLink, getSvgImageBlob } from '../utils.tsx';
import QRCodeLabel from './qrCodeLabel.component.tsx';

interface CodeGenerateDialogCommonProps {
  open: boolean;
  onClose: () => void;
}

export interface CodeGenerateDialogProps extends CodeGenerateDialogCommonProps {
  type: 'item' | 'system';
  oid: string;
  options: {
    label: string;
    value: string;
    rendered: boolean;
    setRendered: (rendered: boolean) => void;
  }[];
}

const LayoutPicker = () => {
  const TextSkeleton = () => (
    <Skeleton
      variant="text"
      width={30}
      height={5}
      animation={false}
      sx={{ bgcolor: 'currentColor' }}
    />
  );

  const boxStyles = {
    p: 2,
    flexGrow: 1,
    borderRadius: 2,
    border: 1,
    borderColor: 'divider',
    color: 'grey',
    cursor: 'pointer',
    ':has(input:checked)': {
      borderColor: 'primary.main',
      color: 'primary.main',
    },
  };

  return (
    <RadioGroup
      defaultValue="vertical"
      name="code-label-layout-direction"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 1,
        mt: 1,
        mb: 2,
      }}
    >
      <Box
        component="label"
        sx={boxStyles}
      >
        <Radio value="vertical" sx={{ display: 'none' }} />
        <Stack
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <QrCode color="inherit" fontSize="large" sx={{ mb: 0.4 }} />
          <Stack gap={0.25}>
            <TextSkeleton />
            <TextSkeleton />
            <TextSkeleton />
          </Stack>
        </Stack>
      </Box>
      <Box
        component="label"
        sx={boxStyles}
      >
        <Radio value="horizontal" sx={{ display: 'none' }} />
        <Stack
          direction="row"
          gap={0.25}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <QrCode color="inherit" fontSize="large" sx={{ mb: 0.3 }} />
          <Stack gap={0.25}>
            <TextSkeleton />
            <TextSkeleton />
            <TextSkeleton />
          </Stack>
        </Stack>
      </Box>
    </RadioGroup>
  );
}

export const CodeGenerateDialog = (props: CodeGenerateDialogProps) => {
  const { open, onClose, type, oid, options } = props;
  const [isIconRendered, setIsIconRendered] = React.useState<boolean>(true);

  const labelRef = React.useRef<SVGSVGElement | null>(null);

  const filename = `qr-code-${type}-${oid}.png`;

  const handleDownload = React.useCallback(() => {
    const svg = labelRef.current;
    if (!svg) {
      return;
    }
    getSvgImageBlob(svg, 4)
      .then((blob) => downloadBlobByLink(blob, filename))
      .catch(() =>
        handleTransferState([
          {
            name: 'QR code',
            message: 'Failed to generate the label image, please try again.',
            state: 'error',
          },
        ])
      );
  }, [filename]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth={true}>
      <DialogTitle>Generate QR Code</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ flex: 1 }}
        >
          <Typography variant="h6">Preview</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <QRCodeLabel
              lines={options}
              ref={labelRef}
              showIcon={isIconRendered}
              value={`${paths.codeRedirect}?type=${type}&oid=${oid}`}
            />
          </Box>
        </Stack>
        <Divider flexItem orientation="vertical" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Layout</Typography>
          <LayoutPicker />
          <Typography variant="h6">Options</Typography>
          <Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={isIconRendered}
                  onChange={(event) => setIsIconRendered(event.target.checked)}
                />
              }
              label="Show Icon"
            />
            {options.map((opt) => (
              <FormControlLabel
                key={opt.label}
                control={
                  <Switch
                    checked={opt.rendered}
                    onChange={(event) => opt.setRendered(event.target.checked)}
                  />
                }
                label={`Show ${opt.label}`}
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          endIcon={<Download />}
          onClick={handleDownload}
          variant="outlined"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ItemCodeGenerateDialog = (
  props: CodeGenerateDialogCommonProps & {
    item: Item;
    catalogueItem: CatalogueItem;
  }
) => {
  const { open, onClose, item, catalogueItem } = props;

  const [isIdRendered, setIsIdRendered] = React.useState<boolean>(false);
  const [isSerialNumberRendered, setIsSerialNumberRendered] =
    React.useState<boolean>(true);
  const [isAssetNumberRendered, setIsAssetNumberRendered] =
    React.useState<boolean>(false);
  const [isNameRendered, setIsNameRendered] = React.useState<boolean>(false);

  return (
    <CodeGenerateDialog
      open={open}
      onClose={onClose}
      type="item"
      oid={item.id}
      options={[
        {
          label: 'ID',
          value: item.id,
          rendered: isIdRendered,
          setRendered: setIsIdRendered,
        },
        {
          label: 'Name',
          value: catalogueItem?.name || 'N/A',
          rendered: isNameRendered,
          setRendered: setIsNameRendered,
        },
        {
          label: 'Serial Number',
          value: item.serial_number || 'N/A',
          rendered: isSerialNumberRendered,
          setRendered: setIsSerialNumberRendered,
        },
        {
          label: 'Asset Number',
          value: item.asset_number || 'N/A',
          rendered: isAssetNumberRendered,
          setRendered: setIsAssetNumberRendered,
        },
      ]}
    />
  );
};

export const SystemCodeGenerateDialog = (
  props: CodeGenerateDialogCommonProps & {
    system: System;
    type?: SystemType;
  }
) => {
  const { open, onClose, system, type } = props;

  const [isIdRendered, setIsIdRendered] = React.useState<boolean>(false);
  const [isNameRendered, setIsNameRendered] = React.useState<boolean>(true);
  const [isTypeRendered, setIsTypeRendered] = React.useState<boolean>(false);
  const [isOwnerRendered, setIsOwnerRendered] = React.useState<boolean>(false);

  return (
    <CodeGenerateDialog
      open={open}
      onClose={onClose}
      type="system"
      oid={system.id}
      options={[
        {
          label: 'ID',
          value: system.id,
          rendered: isIdRendered,
          setRendered: setIsIdRendered,
        },
        {
          label: 'Name',
          value: system.name,
          rendered: isNameRendered,
          setRendered: setIsNameRendered,
        },
        {
          label: 'Type',
          value: type?.value || 'N/A',
          rendered: isTypeRendered,
          setRendered: setIsTypeRendered,
        },
        {
          label: 'Owner',
          value: system.owner || 'N/A',
          rendered: isOwnerRendered,
          setRendered: setIsOwnerRendered,
        },
      ]}
    />
  );
};
