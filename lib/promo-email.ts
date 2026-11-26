import type { EmailSender } from '@/lib/email-theme'

/** The reusable, image-led campaign content behind Jobyra's promotional email style. */
export type PromoEmailSection = {
  kicker: string
  headline: string
  body: string
  image?: string
  imageAlt?: string
  background: string
  foreground: string
  buttonText?: string
  buttonHref?: string
}

export type PromoEmailContent = {
  subject: string
  preheader: string
  eyebrow: string
  headline: string
  intro: string
  heroImage: string
  heroImageAlt: string
  primaryButtonText: string
  primaryButtonHref: string
  sections: PromoEmailSection[]
  closingHeadline: string
  closing: string
  preferencesUrl?: string
}

export const PROMO_STYLE_NAME = 'Heatwave gradient'

export const SAMPLE_PROMO_EMAIL: PromoEmailContent = {
  subject: 'Get your home ready for the heat',
  preheader: 'A little air conditioning care can make the warmer months more comfortable.',
  eyebrow: 'A seasonal note from your air conditioning team',
  headline: 'READY FOR A COOLER SUMMER?',
  intro: 'Hot days are easier when your system is ready for them. Book a seasonal check and head into summer with cleaner filters, better airflow and one less thing to worry about.',
  heroImage: '/promo/cool-living-room.jpg',
  heroImageAlt: 'A bright, comfortable living room with a wall-mounted air conditioner',
  primaryButtonText: 'BOOK A SUMMER SERVICE',
  primaryButtonHref: 'tel:',
  sections: [
    {
      kicker: 'A FRESH START FOR YOUR SYSTEM',
      headline: 'CLEANER FILTERS. BETTER FLOW.',
      body: 'Dusty filters can make your system work harder. A proper clean helps keep air moving around your home.',
      image: '/promo/filter-cleaning.jpg',
      imageAlt: 'A technician cleaning an air conditioning filter',
      background: '#93DDE3',
      foreground: '#123C53',
      buttonText: 'ASK ABOUT A CLEAN',
      buttonHref: 'tel:',
    },
    {
      kicker: 'BEAT THE FIRST HEATWAVE',
      headline: 'MAKE COMFORT PART OF THE PLAN.',
      body: 'A seasonal service checks the essentials before the busiest days arrive. Get in touch and we will find a time that suits you.',
      background: '#FFD62E',
      foreground: '#4A3112',
      buttonText: 'GET IN TOUCH',
      buttonHref: 'tel:',
    },
  ],
  closingHeadline: 'A COOLER HOME IS A GOOD PLACE TO START.',
  closing: 'Reply to this email or give us a call to book your service. We would be happy to help you get ready for the season.',
}

const esc = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const FONT = "Arial, Helvetica, sans-serif"
const CORAL = '#FF5D50'
const CTA_CORAL = '#D33F38'
const YELLOW = '#FFD62E'
const INK = '#202631'
const MUTED = '#536172'
const PROMO_ASSETS = new Set([
  '/promo/cool-living-room.jpg',
  '/promo/filter-cleaning.jpg',
])

function imageUrl(path: string, assetOrigin: string) {
  const safePath = PROMO_ASSETS.has(path) ? path : '/promo/cool-living-room.jpg'
  return assetOrigin ? `${assetOrigin.replace(/\/$/, '')}${safePath}` : safePath
}

function businessImageUrl(path: string, businessId: string, supabaseOrigin: string) {
  try {
    const value = new URL(path)
    const base = new URL(supabaseOrigin)
    const prefix = `/storage/v1/object/public/business-logos/${businessId}/promo/`
    const filename = value.pathname.slice(prefix.length)
    if (value.origin === base.origin && businessId && value.pathname.startsWith(prefix) && /^[A-Za-z0-9._-]{1,180}$/.test(filename)) return value.toString()
  } catch {
    // Non-URL paths are validated against the built-in assets below.
  }
  return ''
}

function safeImage(path: unknown, businessId: string, supabaseOrigin: string) {
  const value = typeof path === 'string' ? path.trim() : ''
  return PROMO_ASSETS.has(value) || businessImageUrl(value, businessId, supabaseOrigin) ? value : ''
}

function safeText(value: unknown, max: number) {
  if (typeof value !== 'string') return null
  const clean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  return clean.length <= max ? clean : null
}

function safeCampaignHref(value: unknown) {
  if (typeof value !== 'string') return null
  const href = value.trim()
  return href.length <= 500 && (href === 'tel:' || href === '#' || /^https:\/\//i.test(href) || /^mailto:[^\s<>]+$/i.test(href)) ? href : null
}

/** Validate and normalize campaign data before it is stored or rendered. */
export function sanitizePromoEmailContent(value: unknown, businessId: string, supabaseOrigin: string): PromoEmailContent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  const subject = safeText(input.subject, 150)
  const preheader = safeText(input.preheader, 180)
  const eyebrow = safeText(input.eyebrow, 90)
  const headline = safeText(input.headline, 120)
  const intro = safeText(input.intro, 1200)
  const heroImage = safeImage(input.heroImage, businessId, supabaseOrigin)
  const heroImageAlt = safeText(input.heroImageAlt, 180)
  const primaryButtonText = safeText(input.primaryButtonText, 40)
  const primaryButtonHref = safeCampaignHref(input.primaryButtonHref)
  const closingHeadline = safeText(input.closingHeadline, 120)
  const closing = safeText(input.closing, 800)
  const preferencesUrl = input.preferencesUrl === undefined || input.preferencesUrl === '' ? '' : safeCampaignHref(input.preferencesUrl)
  if ([subject, preheader, eyebrow, headline, intro, heroImageAlt, primaryButtonText, primaryButtonHref, closingHeadline, closing].some(item => item === null) || !subject || !headline || !primaryButtonText || !heroImage || preferencesUrl === null) return null
  if (!Array.isArray(input.sections) || input.sections.length > 3) return null

  const sections: PromoEmailSection[] = []
  for (const item of input.sections) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null
    const section = item as Record<string, unknown>
    const kicker = safeText(section.kicker, 90)
    const sectionHeadline = safeText(section.headline, 120)
    const body = safeText(section.body, 1200)
    const imageAlt = safeText(section.imageAlt ?? '', 180)
    const background = safeText(section.background, 7)
    const foreground = safeText(section.foreground, 7)
    const buttonText = section.buttonText === undefined || section.buttonText === '' ? '' : safeText(section.buttonText, 40)
    const buttonHref = section.buttonHref === undefined || section.buttonHref === '' ? '' : safeCampaignHref(section.buttonHref)
    const image = section.image === undefined || section.image === '' ? '' : safeImage(section.image, businessId, supabaseOrigin)
    if ([kicker, sectionHeadline, body, imageAlt, background, foreground, buttonText, buttonHref].some(field => field === null) || (section.image && !image)) return null
    if (background && !/^#[\da-f]{6}$/i.test(background)) return null
    if (foreground && !/^#[\da-f]{6}$/i.test(foreground)) return null
    if (Boolean(buttonText) !== Boolean(buttonHref)) return null
    sections.push({
      kicker: kicker!, headline: sectionHeadline!, body: body!,
      ...(image ? { image } : {}), imageAlt: imageAlt!,
      background: background!, foreground: foreground!,
      ...(buttonText ? { buttonText: buttonText!, buttonHref: buttonHref! } : {}),
    })
  }

  return {
    subject: subject!, preheader: preheader!, eyebrow: eyebrow!, headline: headline!, intro: intro!,
    heroImage, heroImageAlt: heroImageAlt!, primaryButtonText: primaryButtonText!, primaryButtonHref: primaryButtonHref!,
    sections, closingHeadline: closingHeadline!, closing: closing!, ...(preferencesUrl ? { preferencesUrl } : {}),
  }
}

export function renderPromoText(content: PromoEmailContent, sender: EmailSender) {
  const plainHref = (href: string) => {
    if (href !== 'tel:') return href
    const phone = String(sender.phone || '').replace(/[^\d+]/g, '')
    return /^\+?\d{6,15}$/.test(phone) ? 'tel:' + phone : sender.email ? 'mailto:' + sender.email : '#'
  }
  const lines = [
    content.eyebrow,
    content.headline,
    content.intro,
    content.primaryButtonText + ': ' + plainHref(content.primaryButtonHref),
    ...content.sections.flatMap(section => [section.kicker, section.headline, section.body, ...(section.buttonText ? [section.buttonText + ': ' + plainHref(section.buttonHref || '#')] : [])]),
    content.closingHeadline,
    content.closing,
    sender.name || 'Your local team',
    sender.phone || '',
    sender.email || '',
    'To update your email preferences, reply to this email or contact us.',
  ]
  return lines.filter(Boolean).join('\n\n')
}

function button(text: string, href: string, background: string, foreground: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td align="center" bgcolor="${background}" style="border-radius:24px;"><a href="${esc(href || '#')}" style="display:inline-block;padding:13px 22px;color:${foreground};font-family:${FONT};font-size:13px;font-weight:bold;letter-spacing:.04em;text-decoration:none;border-radius:24px;">${esc(text)}</a></td></tr></table>`
}

function safeColor(value: string, fallback: string) {
  return /^#[\da-f]{6}$/i.test(value) ? value : fallback
}

function safeHref(value: string, sender: EmailSender) {
  const href = String(value || '').trim()
  if (href === 'tel:') {
    const phone = String(sender.phone || '').replace(/[^\d+]/g, '')
    if (/^\+?\d{6,15}$/.test(phone)) return `tel:${phone}`
    return sender.email ? `mailto:${sender.email}` : '#'
  }
  if (/^https:\/\//i.test(href) || /^mailto:[^\s<>]+$/i.test(href) || /^tel:\+?\d{6,15}$/i.test(href) || /^\/(?!\/)/.test(href) || href === '#') return href
  return '#'
}

function sectionBlock(section: PromoEmailSection, index: number, assetOrigin: string, sender: EmailSender, businessId: string, supabaseOrigin: string) {
  const background = safeColor(section.background, CORAL)
  const foreground = safeColor(section.foreground, INK)
  const image = section.image
    ? `<tr><td style="padding:0;"><img src="${esc(PROMO_ASSETS.has(section.image) ? imageUrl(section.image, assetOrigin) : businessImageUrl(section.image, businessId, supabaseOrigin))}" width="560" alt="${esc(section.imageAlt || '')}" style="display:block;width:100%;max-width:560px;height:auto;border:0;"></td></tr>`
    : ''
  const cta = section.buttonText && section.buttonHref
    ? `<tr><td align="center" bgcolor="${background}" style="padding:2px 20px 28px;background:${background};">${button(section.buttonText, safeHref(section.buttonHref, sender), CTA_CORAL, '#FFFFFF')}</td></tr>`
    : ''
  return `<tr><td bgcolor="${background}" style="background:${background};padding:25px 25px 7px;text-align:center;font-family:${FONT};color:${foreground};">
    <div style="font-size:10px;line-height:16px;font-weight:bold;letter-spacing:.13em;">${esc(section.kicker)}</div>
    <div style="padding-top:7px;font-size:23px;line-height:27px;font-weight:900;letter-spacing:-.04em;">${esc(section.headline)}</div>
    <div style="padding:9px 7px 18px;font-size:13px;line-height:20px;">${esc(section.body)}</div>
  </td></tr>
  ${image}
  ${cta}
  ${index < 1 ? `<tr><td bgcolor="${CORAL}" height="10" style="height:10px;background:${CORAL};font-size:0;line-height:0;">&nbsp;</td></tr>` : ''}`
}

/** Render the email-safe promotional campaign. */
export function renderPromoEmail(content: PromoEmailContent, sender: EmailSender, assetOrigin = 'https://jobyra.app', businessId = '', supabaseOrigin = '') {
  const brand = sender.name || 'Your local air conditioning team'
  const logo = sender.logoUrl
    ? `<img src="${esc(sender.logoUrl)}" alt="${esc(brand)}" height="34" style="display:block;max-width:170px;max-height:34px;width:auto;height:auto;border:0;margin:0 auto;">`
    : `<div style="font-family:${FONT};font-size:18px;line-height:24px;font-weight:900;letter-spacing:-.03em;color:${INK};">${esc(brand)}</div>`
  const primaryHref = safeHref(content.primaryButtonHref, sender)
  const sections = content.sections.map((section, index) => sectionBlock(section, index, assetOrigin, sender, businessId, supabaseOrigin)).join('')
  const footerContact = [sender.phone, sender.email].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
  const preferencesHref = content.preferencesUrl ? safeHref(content.preferencesUrl, sender) : '#'
  const preference = content.preferencesUrl && preferencesHref !== '#'
    ? `To stop receiving promotional emails, <a href="${esc(preferencesHref)}" style="color:#46556A;text-decoration:underline;">manage your preferences</a>.`
    : 'To update your email preferences, reply to this email or contact us.'
  const heroSource = PROMO_ASSETS.has(content.heroImage) ? imageUrl(content.heroImage, assetOrigin) : businessImageUrl(content.heroImage, businessId, supabaseOrigin)
  const hero = `<img src="${esc(heroSource)}" width="560" alt="${esc(content.heroImageAlt)}" style="display:block;width:100%;max-width:560px;height:auto;border:0;">`
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(content.subject)}</title></head>
  <body style="margin:0;padding:0;background:#F6F4EF;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(content.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F6F4EF" style="background:#F6F4EF;border-collapse:collapse;">
      <tr><td align="center" style="padding:20px 10px 34px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CORAL}" style="width:100%;max-width:560px;background:${CORAL};border-collapse:collapse;">
          <tr><td align="center" bgcolor="#FFFFFF" style="padding:14px 18px;background:#FFFFFF;">${logo}</td></tr>
          <tr><td align="center" bgcolor="${CORAL}" style="padding:20px 20px 17px;background:${CORAL};font-family:${FONT};color:#FFFFFF;">
            <div style="font-size:10px;line-height:15px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;color:${INK};">${esc(content.eyebrow)}</div>
            <div style="padding:9px 0 0;font-size:31px;line-height:32px;font-weight:900;letter-spacing:-.05em;">${esc(content.headline)}</div>
          </td></tr>
          <tr><td bgcolor="${YELLOW}" align="center" style="padding:19px 25px 16px;background:${YELLOW};font-family:${FONT};color:${INK};">
            <div style="font-size:14px;line-height:21px;font-weight:600;">${esc(content.intro)}</div>
          </td></tr>
          <tr><td style="padding:0;">${hero}</td></tr>
          <tr><td bgcolor="${YELLOW}" align="center" style="padding:18px 20px 23px;background:${YELLOW};">${button(content.primaryButtonText, primaryHref, CTA_CORAL, '#FFFFFF')}</td></tr>
          <tr><td bgcolor="${CORAL}" align="center" style="padding:25px 22px 20px;background:${CORAL};font-family:${FONT};color:#FFFFFF;">
            <div style="font-size:21px;line-height:25px;font-weight:900;letter-spacing:-.035em;">A LITTLE CARE GOES A LONG WAY</div>
            <div style="padding-top:7px;font-size:13px;line-height:19px;color:${INK};">Small seasonal checks can help your system feel ready for the warmer months.</div>
          </td></tr>
          ${sections}
          <tr><td bgcolor="${CORAL}" align="center" style="padding:27px 24px 10px;background:${CORAL};font-family:${FONT};color:#FFFFFF;">
            <div style="font-size:21px;line-height:25px;font-weight:900;letter-spacing:-.035em;">${esc(content.closingHeadline)}</div>
            <div style="padding:9px 3px 18px;font-size:13px;line-height:20px;color:${INK};">${esc(content.closing)}</div>
          </td></tr>
          <tr><td bgcolor="${CORAL}" align="center" style="padding:0 20px 27px;background:${CORAL};">${button(content.primaryButtonText, primaryHref, YELLOW, INK)}</td></tr>
          <tr><td bgcolor="#FFFFFF" align="center" style="padding:18px 20px 21px;background:#FFFFFF;font-family:${FONT};color:${MUTED};">
            <div style="font-size:12px;line-height:18px;font-weight:bold;color:${INK};">${esc(brand)}</div>
            ${footerContact ? `<div style="padding-top:3px;font-size:11px;line-height:17px;">${footerContact}</div>` : ''}
            <div style="padding-top:9px;font-size:10px;line-height:16px;">You received this seasonal update because you are a customer of ${esc(brand)}. ${preference}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}
