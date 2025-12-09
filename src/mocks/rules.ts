import type { Rule, SystemType, UsageStatus } from '../api/api.types';
import SystemTypesJSON from './SystemTypes.json';
import UsageStatusJSON from './UsageStatuses.json';

const getSystemTypeByValue = (value: string): SystemType => {
  return SystemTypesJSON.find((type) => type.value === value)!;
};

const getUsageStatusByValue = (value: string): UsageStatus => {
  return UsageStatusJSON.find((status) => status.value === value)!;
};

const rulesJson: Rule[] = [
  {
    id: '1',
    src_system_type: null,
    dst_system_type: getSystemTypeByValue('Storage'),
    dst_usage_status: getUsageStatusByValue('New'),
  },
  {
    id: '2',
    src_system_type: getSystemTypeByValue('Storage'),
    dst_system_type: null,
    dst_usage_status: null,
  },
  {
    id: '3',
    src_system_type: getSystemTypeByValue('Storage'),
    dst_system_type: getSystemTypeByValue('Operational'),
    dst_usage_status: getUsageStatusByValue('In Use'),
  },
  {
    id: '4',
    src_system_type: getSystemTypeByValue('Operational'),
    dst_system_type: getSystemTypeByValue('Storage'),
    dst_usage_status: getUsageStatusByValue('Used'),
  },
  {
    id: '5',
    src_system_type: getSystemTypeByValue('Operational'),
    dst_system_type: getSystemTypeByValue('Scrapped'),
    dst_usage_status: getUsageStatusByValue('Scrapped'),
  },
];

export default rulesJson;
