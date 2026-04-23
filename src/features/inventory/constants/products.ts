export const UNIT_OF_MEASURE = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'l', label: 'Liter' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'box', label: 'Box' },
] as const;

export const STORAGE_CONDITIONS = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'frozen', label: 'Frozen' },
] as const;
