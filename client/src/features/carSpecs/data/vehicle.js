// ---------------------------------------------------------------------------
// Interface copy, transcribed verbatim from the reference frames (full-res).
// Nothing here is invented: every string was read from an extracted PNG.
// See docs/reference-analysis.md for which frame each value came from.
// ---------------------------------------------------------------------------

export const vehicle = {
  // ---- Original (side-profile) state --------------------------------------
  topLeft: 'All Classic Cars',
  topNav: ['Cars for sale', 'Showroom', 'News & Reviews'],

  // Left vehicle switcher (previous / next). Two compact lines each.
  prevVehicle: { arrow: 'up', lines: ['1964 Chevrolet', 'Corvette'] },
  nextVehicle: { arrow: 'down', lines: ['1971 Ford Mustang', 'Mach 1'] },

  // Lower-left title + price.
  titleLines: ['1969 Dodge', 'Charger R/T'],
  price: '89,995',
  priceCaption: '$6,919 below avg.',

  // Lower-centre specification pairs (original state).
  quickSpecs: [
    ['39,889 miles', 'V8 6.7L Supercharger'],
    ['Excellent', 'Fenton, MO'],
  ],

  // Lower-right controls.
  buttons: { secondary: 'Specs', primary: 'Contact the Seller' },

  // Huge, extremely faint background lettering behind the car.
  backgroundWord: 'MUSCLE',

  // ---- Specs state ---------------------------------------------------------
  specs: {
    titleLines: ['1969 Dodge', 'Charger R/T Specs'],
    dealer: ['Streetside Classics', 'Fenton, MO'],
    menu: ['Overview', 'Engine', 'Interior', 'Wheels'],
    backgroundWord: 'SPECS',
    description:
      'Express ride into the 21st century with this stunning 1969 Charger RT! ' +
      'This is where the past meets the future rather quickly with a 720 HP to get you there.',
    // 4 columns x 2 rows grid, label (tiny uppercase) + value.
    grid: [
      { label: 'MAX SPEED', value: '720 HP' },
      { label: 'TRANSMISSION', value: 'Automatic 4-Speed' },
      { label: 'MILEAGE', value: '39,889 miles' },
      { label: 'EXTERIOR COLOR', value: 'Black' },
      { label: 'CONDITION', value: 'Excellent' },
      { label: 'DRIVE TRAIN', value: 'RWD' },
      { label: 'ENGINE', value: 'V8 6.7L Supercharger' },
      { label: 'FUEL', value: 'Gasoline' },
    ],
  },
}
