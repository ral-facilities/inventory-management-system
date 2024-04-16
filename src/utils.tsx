import { format, parseISO } from 'date-fns';

/* Returns a name avoiding duplicates by appending _copy_n for nth copy */
export const generateUniqueName = (
  name: string,
  existingNames: string[]
): string => {
  let count = 1;
  let newName = name;

  while (existingNames.includes(newName)) {
    newName = `${name}_copy_${count}`;
    count++;
  }

  return newName;
};

/* Returns whether running in development mode */
export const isRunningInDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/* Returns a calc function giving the page height excluding SciGateway related components
  (header and footer) to use for CSS e.g. giving 48px it will return the calc(page height
  - all SciGateway related heights - 48px)*/
export const getSciGatewayPageHeightCalc = (
  additionalSubtraction?: string
): string => {
  // Page height - unknown - app bar height - footer height - additional
  return `calc(100vh - 8px - 64px - 24px${
    additionalSubtraction !== undefined ? ` - (${additionalSubtraction})` : ''
  })`;
};

/* Returns a calc function giving the page height excluding the optional view tabs component
   that only appears in development */
export const getPageHeightCalc = (additionalSubtraction?: string): string => {
  // SciGateway heights - view tabs (if in development) - additional
  let newAdditional: string | undefined = undefined;

  if (isRunningInDevelopment()) newAdditional = '48px';
  if (additionalSubtraction !== undefined) {
    if (newAdditional === undefined) newAdditional = additionalSubtraction;
    else newAdditional += ' + ' + additionalSubtraction;
  }

  return getSciGatewayPageHeightCalc(newAdditional);
};

/* Trims all the string values in an object, and then returns the object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trimStringValues = (object: any): any => {
  if (typeof object !== 'object' || object === null) {
    if (typeof object === 'string') {
      return object.trim();
    } else {
      return object;
    }
  }

  for (const prop in object) {
    if (Object.prototype.hasOwnProperty.call(object, prop)) {
      if (Array.isArray(object[prop])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object[prop] = object[prop].map((element: any) =>
          trimStringValues(element)
        );
      } else if (typeof object[prop] === 'string') {
        object[prop] = object[prop].trim();
      } else if (typeof object[prop] === 'object') {
        object[prop] = trimStringValues(object[prop]);
      }
    }
  }
  return object;
};

export const formatDateTimeStrings = (
  dateTime: string,
  includeTime: boolean
): string => {
  const date = parseISO(dateTime);
  const formattedDate = includeTime
    ? format(date, 'dd MMM yyyy HH:mm')
    : format(date, 'dd MMM yyyy');

  return formattedDate;
};

let lastId = 0;

export function generateUniqueId(prefix: string = 'id_'): string {
  lastId++;
  return `${prefix}${lastId}`;
}

export const resetUniqueIdCounter = () => {
  lastId = 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortDataList(data: any[], sortedValue: string) {
  return data.sort((a, b) => a[sortedValue].localeCompare(b[sortedValue]));
}
