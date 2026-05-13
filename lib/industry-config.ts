export type IndustryId =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'solar'
  | 'gas_fitting'
  | 'refrigeration'
  | 'med_spa'

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
]

export function getIndustry(id: string | null | undefined): IndustryConfig {
  return INDUSTRIES.find(i => i.id === id) ?? INDUSTRIES[0]
}
