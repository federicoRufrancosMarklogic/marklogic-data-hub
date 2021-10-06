export const COMMON_PROPERTY_TYPES = [
  {
    value: 'string',
    label: 'string'
  },
  {
    value: 'integer',
    label: 'integer'
  },
  {
    value: 'dateTime',
    label: 'dateTime'
  },
  {
    value: 'boolean',
    label: 'boolean'
  }
];

export const MORE_STRING_TYPES = {
  label: 'More string types',
  value: 'moreStringTypes',
  children: [
    {
      value: 'anyURI',
      label: 'anyURI'
    },
    {
      value: 'iri',
      label: 'iri'
    }
  ]
};

export const MORE_NUMBER_TYPES = {
  label: 'More number types',
  value: 'moreNumberTypes',
  children: [
    {
      value: 'byte',
      label: 'byte'
    },
    {
      value: 'decimal',
      label: 'decimal'
    },
    {
      value: 'double',
      label: 'double'
    },
    {
      value: 'float',
      label: 'float'
    },
    {
      value: 'int',
      label: 'int'
    },
    {
      value: 'long',
      label: 'long'
    },
    {
      value: 'negativeInteger',
      label: 'negativeInteger'
    },
    {
      value: 'nonNegativeInteger',
      label: 'nonNegativeInteger'
    },
    {
      value: 'nonPositiveInteger',
      label: 'nonPositiveInteger'
    },
    {
      value: 'positiveInteger',
      label: 'positiveInteger'
    },
    {
      value: 'short',
      label: 'short'
    },
    {
      value: 'unsignedByte',
      label: 'unsignedByte'
    },
    {
      value: 'unsignedInt',
      label: 'unsignedInt'
    },
    {
      value: 'unsignedLong',
      label: 'unsignedLong'
    },
    {
      value: 'unsignedShort',
      label: 'unsignedShort'
    }
  ]
};

export const MORE_DATE_TYPES = {
  label: 'More date types',
  value: 'moreDateTypes',
  children: [
    {
      value: 'date',
      label: 'date'
    },
    {
      value: 'dayTimeDuration',
      label: 'dayTimeDuration'
    },
    {
      value: 'gDay',
      label: 'gDay'
    },
    {
      value: 'gMonth',
      label: 'gMonth'
    },
    {
      value: 'gYear',
      label: 'gYear'
    },
    {
      value: 'gYearMonth',
      label: 'gYearMonth'
    },
    {
      value: 'time',
      label: 'time'
    },
    {
      value: 'yearMonthDuration',
      label: 'yearMonthDuration'
    }
  ]
};

export const DROPDOWN_PLACEHOLDER = (key) => { return { label: '---------------------', value: key, disabled: true };};

export const defaultModelingView = "graph";

export const defaultHubCentralConfig = {
  "modeling": {
    "entities": {}
  }
}