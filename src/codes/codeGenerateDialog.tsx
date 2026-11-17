import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel, Stack,
  Switch,
} from '@mui/material';
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import paths from '../paths.tsx';
import { CatalogueItem, Item, System, SystemType } from '../api/api.types.tsx';

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

export const CodeGenerateDialog = (props: CodeGenerateDialogProps) => {
  const { open, onClose, type, oid, options } = props;
  const [isIconRendered, setIsIconRendered] = React.useState<boolean>(true);

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth={true}>
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        Generate QR Code
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ p: 5, pr: 8 }}>
          <QRCodeCanvas
            value={`${paths.codeRedirect}?type=${type}&oid=${oid}`}
            size={160}
            level={isIconRendered ? 'Q' : 'M'} // If icon is shown, a greater error correction level is required
            imageSettings={
              isIconRendered
                ? {
                    src: '/public/logo192.png',
                    height: 40,
                    width: 40,
                    excavate: true,
                  }
                : undefined
            }
          />
          <Stack gap={1} sx={{ mt: 2 }}>
            {options.map((opt, index) => opt.rendered && (
              <h6 key={index} style={{ margin: 0 }}>
                {opt.label}: {opt.value}
              </h6>
            ))}
          </Stack>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ pl: 5 }}>
          <h3>Options</h3>
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
            {options.map((opt, index) => (
              <FormControlLabel
                key={index}
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
        <Button onClick={handleClose}>Cancel</Button>
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
        {
          label: 'Name',
          value: catalogueItem?.name || 'N/A',
          rendered: isNameRendered,
          setRendered: setIsNameRendered,
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
  const [isTypeRendered, setIsTypeRendered] =
    React.useState<boolean>(false);
  const [isOwnerRendered, setIsOwnerRendered] =
    React.useState<boolean>(false);

  return (
    <CodeGenerateDialog
      open={open}
      onClose={onClose}
      type="item"
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