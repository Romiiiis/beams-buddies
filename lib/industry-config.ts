export type IndustryId =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'solar'
  | 'gas_fitting'
  | 'refrigeration'
  | 'med_spa'
  | 'painting'
  | 'carpentry'
  | 'tiling'
  | 'roofing'
  | 'landscaping'
  | 'cleaning'
  | 'pest_control'
  | 'security'
  | 'concreting'
  | 'fencing'
  | 'glazing'
  | 'general_trade'

export type EquipmentTypeOption = { value: string; label: string }

export type IndustryConfig = {
  id: IndustryId
  label: string
  description: string
  equipmentTypes: EquipmentTypeOption[]
  fields: {
    capacityKw: { show: boolean; label: string; placeholder: string }
    brand: { label: string; placeholder: string }
    model: { label: string; placeholder: string }
    installLocation: { label: string; placeholder: string }
    installDate: { label: string }
    notes: { placeholder: string }
  }
  terminology: {
    equipment: string
    job: string
  }
}

export const INDUSTRIES: IndustryConfig[] = [
  {
    id: 'hvac',
    label: 'HVAC / Air Conditioning',
    description: 'Heating, ventilation, and air conditioning systems',
    equipmentTypes: [
      { value: 'split_system', label: 'Split system' },
      { value: 'ducted', label: 'Ducted system' },
      { value: 'multi_head', label: 'Multi-head split' },
      { value: 'cassette', label: 'Cassette unit' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'Capacity kW', placeholder: '7.1' },
      brand: { label: 'Brand', placeholder: 'Daikin' },
      model: { label: 'Model', placeholder: 'FTXM71WVMA' },
      installLocation: { label: 'Location in property', placeholder: 'Master bedroom' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the installation...' },
    },
    terminology: { equipment: 'unit', job: 'installation' },
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    description: 'Hot water, pipes, fixtures, and drainage',
    equipmentTypes: [
      { value: 'hot_water_system', label: 'Hot water system' },
      { value: 'water_filter', label: 'Water filter' },
      { value: 'pump', label: 'Pump' },
      { value: 'backflow_device', label: 'Backflow device' },
      { value: 'tap_fixture', label: 'Tap / fixture' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'Capacity (L)', placeholder: '250' },
      brand: { label: 'Manufacturer', placeholder: 'Rheem' },
      model: { label: 'Model', placeholder: 'Stellar 250' },
      installLocation: { label: 'Location', placeholder: 'Bathroom' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the job...' },
    },
    terminology: { equipment: 'fixture', job: 'installation' },
  },
  {
    id: 'electrical',
    label: 'Electrical',
    description: 'Switchboards, safety switches, lighting, and EV chargers',
    equipmentTypes: [
      { value: 'switchboard', label: 'Switchboard' },
      { value: 'safety_switch', label: 'Safety switch / RCD' },
      { value: 'smoke_alarm', label: 'Smoke alarm' },
      { value: 'ev_charger', label: 'EV charger' },
      { value: 'ceiling_fan', label: 'Ceiling fan' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'Rating (A / kW)', placeholder: '32' },
      brand: { label: 'Brand', placeholder: 'Clipsal' },
      model: { label: 'Model', placeholder: 'EVLINK-32A' },
      installLocation: { label: 'Location', placeholder: 'Meter box' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the installation...' },
    },
    terminology: { equipment: 'unit', job: 'installation' },
  },
  {
    id: 'solar',
    label: 'Solar',
    description: 'Solar panels, inverters, and battery systems',
    equipmentTypes: [
      { value: 'solar_panels', label: 'Solar panels' },
      { value: 'inverter', label: 'Inverter' },
      { value: 'battery_system', label: 'Battery system' },
      { value: 'solar_hot_water', label: 'Solar hot water' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'System size (kW)', placeholder: '6.6' },
      brand: { label: 'Brand', placeholder: 'Fronius' },
      model: { label: 'Model', placeholder: 'Primo 5.0' },
      installLocation: { label: 'Roof location', placeholder: 'North-facing' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the installation...' },
    },
    terminology: { equipment: 'system', job: 'installation' },
  },
  {
    id: 'gas_fitting',
    label: 'Gas Fitting',
    description: 'Gas heaters, hot water systems, and appliances',
    equipmentTypes: [
      { value: 'gas_heater', label: 'Gas heater' },
      { value: 'gas_hot_water', label: 'Gas hot water' },
      { value: 'gas_cooktop', label: 'Gas cooktop' },
      { value: 'gas_point', label: 'Gas point' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'Output (MJ/h)', placeholder: '29' },
      brand: { label: 'Brand', placeholder: 'Rinnai' },
      model: { label: 'Model', placeholder: 'Enduro 16' },
      installLocation: { label: 'Location', placeholder: 'Laundry' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the job...' },
    },
    terminology: { equipment: 'appliance', job: 'installation' },
  },
  {
    id: 'refrigeration',
    label: 'Refrigeration',
    description: 'Commercial and residential refrigeration systems',
    equipmentTypes: [
      { value: 'commercial_fridge', label: 'Commercial fridge' },
      { value: 'cool_room', label: 'Cool room' },
      { value: 'display_cabinet', label: 'Display cabinet' },
      { value: 'ice_machine', label: 'Ice machine' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: true, label: 'Capacity (L)', placeholder: '600' },
      brand: { label: 'Brand', placeholder: 'Skope' },
      model: { label: 'Model', placeholder: 'ActiveCore' },
      installLocation: { label: 'Location', placeholder: 'Kitchen' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Any notes about the installation...' },
    },
    terminology: { equipment: 'unit', job: 'installation' },
  },
  {
    id: 'med_spa',
    label: 'Med Spa',
    description: 'Aesthetic treatments and skin care equipment',
    equipmentTypes: [
      { value: 'laser', label: 'Laser device' },
      { value: 'ipl', label: 'IPL' },
      { value: 'cryolipolysis', label: 'Cryolipolysis' },
      { value: 'skin_needling', label: 'Skin needling' },
      { value: 'rf_device', label: 'RF device' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Manufacturer', placeholder: 'Candela' },
      model: { label: 'Model', placeholder: 'GentleMax Pro' },
      installLocation: { label: 'Treatment room', placeholder: 'Room 1' },
      installDate: { label: 'Commission date' },
      notes: { placeholder: 'Any notes about the device...' },
    },
    terminology: { equipment: 'device', job: 'commission' },
  },
  {
    id: 'painting',
    label: 'Painting',
    description: 'Interior and exterior painting and coatings',
    equipmentTypes: [
      { value: 'interior_walls', label: 'Interior walls' },
      { value: 'exterior_walls', label: 'Exterior walls' },
      { value: 'roof_painting', label: 'Roof painting' },
      { value: 'deck_fence', label: 'Deck / fence' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Paint brand', placeholder: 'Dulux' },
      model: { label: 'Product / colour', placeholder: 'Antique White USA' },
      installLocation: { label: 'Area painted', placeholder: 'Living room' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Coats, prep work, or surface notes...' },
    },
    terminology: { equipment: 'surface', job: 'job' },
  },
  {
    id: 'carpentry',
    label: 'Carpentry',
    description: 'Framing, decking, joinery, and cabinetry',
    equipmentTypes: [
      { value: 'framing', label: 'Framing' },
      { value: 'decking', label: 'Decking' },
      { value: 'cabinetry', label: 'Cabinetry' },
      { value: 'doors_windows', label: 'Doors / windows' },
      { value: 'pergola', label: 'Pergola / carport' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Timber / product', placeholder: 'Spotted gum' },
      model: { label: 'Style / finish', placeholder: 'Matte lacquer' },
      installLocation: { label: 'Location', placeholder: 'Kitchen' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Material specs, measurements, or notes...' },
    },
    terminology: { equipment: 'item', job: 'job' },
  },
  {
    id: 'tiling',
    label: 'Tiling',
    description: 'Floor, wall, and bathroom tiling',
    equipmentTypes: [
      { value: 'floor_tiles', label: 'Floor tiles' },
      { value: 'wall_tiles', label: 'Wall tiles' },
      { value: 'bathroom', label: 'Bathroom' },
      { value: 'outdoor', label: 'Outdoor / alfresco' },
      { value: 'splashback', label: 'Splashback' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Tile brand', placeholder: 'Beaumont' },
      model: { label: 'Tile name / size', placeholder: '600x600 Marble look' },
      installLocation: { label: 'Room / area', placeholder: 'Ensuite' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Grout colour, adhesive, or surface notes...' },
    },
    terminology: { equipment: 'surface', job: 'job' },
  },
  {
    id: 'roofing',
    label: 'Roofing',
    description: 'Roof installation, repair, and guttering',
    equipmentTypes: [
      { value: 'metal_roof', label: 'Metal roofing' },
      { value: 'tile_roof', label: 'Tile roofing' },
      { value: 'guttering', label: 'Guttering' },
      { value: 'skylights', label: 'Skylights' },
      { value: 'roof_repair', label: 'Roof repair' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Product brand', placeholder: 'Colorbond' },
      model: { label: 'Profile / colour', placeholder: 'Ironstone' },
      installLocation: { label: 'Roof section', placeholder: 'Full roof' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Pitch, area (m²), or condition notes...' },
    },
    terminology: { equipment: 'roof', job: 'job' },
  },
  {
    id: 'landscaping',
    label: 'Landscaping',
    description: 'Garden design, turf, irrigation, and outdoor works',
    equipmentTypes: [
      { value: 'turf', label: 'Turf / lawn' },
      { value: 'irrigation', label: 'Irrigation system' },
      { value: 'retaining_wall', label: 'Retaining wall' },
      { value: 'garden_design', label: 'Garden design' },
      { value: 'driveway', label: 'Driveway / paving' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Product / plant', placeholder: 'Sir Walter' },
      model: { label: 'Variety / type', placeholder: 'Buffalo grass' },
      installLocation: { label: 'Area', placeholder: 'Backyard' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Size (m²), soil type, or design notes...' },
    },
    terminology: { equipment: 'feature', job: 'job' },
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    description: 'Residential and commercial cleaning services',
    equipmentTypes: [
      { value: 'regular_clean', label: 'Regular clean' },
      { value: 'end_of_lease', label: 'End of lease' },
      { value: 'carpet_clean', label: 'Carpet cleaning' },
      { value: 'pressure_wash', label: 'Pressure washing' },
      { value: 'commercial', label: 'Commercial clean' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Product used', placeholder: 'Peerless Jal' },
      model: { label: 'Service type', placeholder: 'Deep clean' },
      installLocation: { label: 'Property area', placeholder: 'Full house' },
      installDate: { label: 'Service date' },
      notes: { placeholder: 'Access instructions, special requirements...' },
    },
    terminology: { equipment: 'area', job: 'service' },
  },
  {
    id: 'pest_control',
    label: 'Pest Control',
    description: 'Termite, general pest, and rodent treatments',
    equipmentTypes: [
      { value: 'general_pest', label: 'General pest' },
      { value: 'termite_treatment', label: 'Termite treatment' },
      { value: 'termite_inspection', label: 'Termite inspection' },
      { value: 'rodent', label: 'Rodent control' },
      { value: 'bed_bugs', label: 'Bed bugs' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Chemical / product', placeholder: 'Termidor' },
      model: { label: 'Treatment type', placeholder: 'Soil injection' },
      installLocation: { label: 'Treatment area', placeholder: 'Perimeter' },
      installDate: { label: 'Treatment date' },
      notes: { placeholder: 'Pest findings, product rates, or follow-up notes...' },
    },
    terminology: { equipment: 'treatment', job: 'treatment' },
  },
  {
    id: 'security',
    label: 'Security Systems',
    description: 'Alarms, CCTV, access control, and intercoms',
    equipmentTypes: [
      { value: 'alarm_system', label: 'Alarm system' },
      { value: 'cctv', label: 'CCTV / cameras' },
      { value: 'access_control', label: 'Access control' },
      { value: 'intercom', label: 'Intercom' },
      { value: 'smart_lock', label: 'Smart lock' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Brand', placeholder: 'Bosch' },
      model: { label: 'Model', placeholder: 'Solution 6000' },
      installLocation: { label: 'Location', placeholder: 'Front entry' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Zone details, codes set, or config notes...' },
    },
    terminology: { equipment: 'system', job: 'installation' },
  },
  {
    id: 'concreting',
    label: 'Concreting',
    description: 'Driveways, slabs, paths, and decorative concrete',
    equipmentTypes: [
      { value: 'driveway', label: 'Driveway' },
      { value: 'slab', label: 'Slab' },
      { value: 'pathway', label: 'Pathway' },
      { value: 'exposed_aggregate', label: 'Exposed aggregate' },
      { value: 'pool_surrounds', label: 'Pool surrounds' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Mix / supplier', placeholder: 'Boral' },
      model: { label: 'Finish', placeholder: 'Exposed aggregate' },
      installLocation: { label: 'Area', placeholder: 'Driveway' },
      installDate: { label: 'Pour date' },
      notes: { placeholder: 'Area (m²), thickness, reinforcing notes...' },
    },
    terminology: { equipment: 'slab', job: 'job' },
  },
  {
    id: 'fencing',
    label: 'Fencing',
    description: 'Residential and commercial fencing and gates',
    equipmentTypes: [
      { value: 'colorbond', label: 'Colorbond' },
      { value: 'timber', label: 'Timber' },
      { value: 'aluminium', label: 'Aluminium' },
      { value: 'pool_fence', label: 'Pool fence' },
      { value: 'electric_gate', label: 'Electric gate' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Product / brand', placeholder: 'Colorbond' },
      model: { label: 'Style / colour', placeholder: 'Ironstone' },
      installLocation: { label: 'Boundary', placeholder: 'Side fence' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Lineal metres, post depth, or gate specs...' },
    },
    terminology: { equipment: 'fence', job: 'installation' },
  },
  {
    id: 'glazing',
    label: 'Glazing',
    description: 'Windows, doors, shower screens, and glass products',
    equipmentTypes: [
      { value: 'windows', label: 'Windows' },
      { value: 'sliding_door', label: 'Sliding door' },
      { value: 'shower_screen', label: 'Shower screen' },
      { value: 'glass_balustrade', label: 'Glass balustrade' },
      { value: 'splashback', label: 'Splashback' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Supplier', placeholder: 'Stegbar' },
      model: { label: 'Glass type', placeholder: '10mm toughened' },
      installLocation: { label: 'Location', placeholder: 'Ensuite' },
      installDate: { label: 'Installation date' },
      notes: { placeholder: 'Dimensions, frame colour, or fitting notes...' },
    },
    terminology: { equipment: 'panel', job: 'installation' },
  },
  {
    id: 'general_trade',
    label: 'General Trade / Handyman',
    description: 'Mixed trade or handyman services',
    equipmentTypes: [
      { value: 'repair', label: 'Repair' },
      { value: 'installation', label: 'Installation' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'inspection', label: 'Inspection' },
      { value: 'other', label: 'Other' },
    ],
    fields: {
      capacityKw: { show: false, label: '', placeholder: '' },
      brand: { label: 'Product / brand', placeholder: '' },
      model: { label: 'Item / model', placeholder: '' },
      installLocation: { label: 'Location', placeholder: 'e.g. Kitchen' },
      installDate: { label: 'Job date' },
      notes: { placeholder: 'Job description or notes...' },
    },
    terminology: { equipment: 'item', job: 'job' },
  },
]

export function getIndustry(id: string | null | undefined): IndustryConfig {
  return INDUSTRIES.find(i => i.id === id) ?? INDUSTRIES[0]
}
