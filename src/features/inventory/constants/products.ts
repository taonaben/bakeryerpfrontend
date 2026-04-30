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

export const PRODUCT_CATEGORIES = [
  {
    value: 'raw_material',
    label: 'Raw Material',
    hint: 'Primary ingredients used directly in baking (flour, sugar, butter, eggs, yeast)',
  },
  {
    value: 'consumable',
    label: 'Consumable',
    hint: 'Supplies used in operations but not part of the final product (cleaning agents, gloves, parchment paper)',
  },
  {
    value: 'finished_good',
    label: 'Finished Good',
    hint: 'Products ready for sale (baked bread, cakes, pastries, cookies)',
  },
  {
    value: 'semi_finished',
    label: 'Semi-Finished',
    hint: 'Partially processed items used in further production (pre-mixed dough, cake layers before frosting)',
  },
  {
    value: 'packaging',
    label: 'Packaging',
    hint: 'Materials used to wrap or contain finished goods (boxes, bags, labels, twine)',
  },
  {
    value: 'spare_part',
    label: 'Spare Part',
    hint: 'Replacement components for bakery equipment (oven heating elements, mixer attachments)',
  },
  {
    value: 'byproduct',
    label: 'By-Product',
    hint: 'Secondary outputs from production (bread crumbs from trimming, excess dough scraps)',
  },
  {
    value: 'waste',
    label: 'Waste',
    hint: 'Unusable materials generated during production (expired ingredients, burnt batches)',
  },
  {
    value: 'other',
    label: 'Other',
    hint: 'Any product type that does not fit the above categories',
  },
] as const;
