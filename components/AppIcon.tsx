import type { CSSProperties } from 'react'
import {
  Add, ArrowDown2, ArrowLeft, ArrowLeft2, ArrowRight, ArrowRight2, Calendar1, Calendar2, CalendarTick,
  Call, Category, Chart, Chart2, ClipboardText, Clock, CloseCircle, Danger, DocumentDownload, DocumentText,
  DocumentUpload, DollarCircle, Edit2, ExportSquare, Eye, Filter, Home2, Location, LogoutCurve, MagicStar,
  Message, MessageText, Notification, People, PercentageCircle, Printer, ProfileAdd, Receipt, ReceiptText,
  Repeat, Ruler, ScanBarcode, SearchNormal1, Setting2, ShieldTick, Sms, TickCircle, Trash, TrendDown, TrendUp,
  type Icon,
} from 'iconsax-reactjs'

// Iconsax (Linear) icon set, MIT licensed.
const ICONS = {
  add: Add,
  'arrow-down': ArrowDown2,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bell: Notification,
  calendar: Calendar1,
  'calendar-check': CalendarTick,
  'calendar-clock': Calendar2,
  call: Call,
  'chevron-left': ArrowLeft2,
  'chevron-right': ArrowRight2,
  clipboard: ClipboardText,
  clock: Clock,
  close: CloseCircle,
  customers: People,
  dashboard: Home2,
  document: DocumentText,
  dollar: DollarCircle,
  download: DocumentDownload,
  edit: Edit2,
  'external-link': ExportSquare,
  eye: Eye,
  filter: Filter,
  invoice: ReceiptText,
  jobs: Ruler,
  leads: ProfileAdd,
  location: Location,
  logout: LogoutCurve,
  mail: Sms,
  menu: Category,
  message: Message,
  percent: PercentageCircle,
  print: Printer,
  qrcode: ScanBarcode,
  receipt: Receipt,
  repeat: Repeat,
  reports: Chart2,
  search: SearchNormal1,
  settings: Setting2,
  shield: ShieldTick,
  sms: MessageText,
  sparkle: MagicStar,
  stats: Chart,
  tick: TickCircle,
  trash: Trash,
  'trend-down': TrendDown,
  'trend-up': TrendUp,
  upload: DocumentUpload,
  warning: Danger,
} satisfies Record<string, Icon>

export type AppIconName = keyof typeof ICONS

export function AppIcon({ name, size = 16, style }: { name: AppIconName; size?: number; style?: CSSProperties }) {
  const Glyph = ICONS[name]
  return <Glyph size={size} aria-hidden="true" style={{ flexShrink: 0, ...style }} />
}
