import { supabase } from './supabase'

export async function getDashboardStats(businessId) {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .eq('business_id', businessId)
    .single()
  if (error) throw error
  return data
}

export async function getUpcomingServices(businessId, limit = 10) {
  const { data, error } = await supabase
    .from('jobs_with_status')
    .select('*')
    .eq('business_id', businessId)
    .in('service_status', ['overdue', 'due_soon'])
    .order('next_service_date', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getRecentCustomers(businessId, limit = 10) {
  const { data, error } = await supabase
    .from('jobs_with_status')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getCustomers(businessId, search = '') {
  let query = supabase
    .from('customers')
    .select(`
      *,
      jobs (
        id,
        brand,
        model,
        capacity_kw,
        install_date,
        next_service_date,
        service_status
      )
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCustomer(customerId) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      jobs (
        *,
        service_records (
          id,
          service_date,
          service_type,
          notes,
          cost,
          serviced_by
        ),
        reminders (
          id,
          scheduled_for,
          channel,
          status,
          sent_at
        )
      )
    `)
    .eq('id', customerId)
    .single()
  if (error) throw error
  return data
}

export async function createCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCustomer(customerId, updates) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getJob(jobId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customers (*),
      service_records (
        *,
        users (full_name)
      ),
      reminders (*)
    `)
    .eq('id', jobId)
    .single()
  if (error) throw error
  return data
}

export async function createJob(job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateJob(jobId, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function logService(serviceRecord) {
  const { data, error } = await supabase
    .from('service_records')
    .insert(serviceRecord)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getServiceHistory(jobId) {
  const { data, error } = await supabase
    .from('service_records')
    .select(`*, users (full_name)`)
    .eq('job_id', jobId)
    .order('service_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getServiceSchedule(businessId, filter = 'all') {
  let query = supabase
    .from('jobs_with_status')
    .select('*')
    .eq('business_id', businessId)
    .order('next_service_date', { ascending: true })

  if (filter === 'overdue') query = query.eq('service_status', 'overdue')
  else if (filter === 'due_soon') query = query.eq('service_status', 'due_soon')
  else if (filter === 'upcoming') query = query.eq('service_status', 'good')

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getReminders(businessId, status = 'pending') {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      *,
      customers (first_name, last_name, email, phone),
      jobs (brand, model, next_service_date)
    `)
    .eq('status', status)
    .order('scheduled_for', { ascending: true })
  if (error) throw error
  return data
}

export async function createReminder(reminder) {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markReminderSent(reminderId) {
  const { data, error } = await supabase
    .from('reminders')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getJobByQrToken(token) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customers (first_name, last_name),
      service_records (service_date, service_type, notes)
    `)
    .eq('qr_code_token', token)
    .single()
  if (error) throw error
  return data
}

export async function getQrCodes(businessId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      qr_code_token,
      brand,
      model,
      install_date,
      customers (first_name, last_name, suburb)
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function registerAppUser(registration) {
  const { data, error } = await supabase
    .from('app_registrations')
    .insert(registration)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getReportData(businessId) {
  const [stats, brandBreakdown, retentionData] = await Promise.all([
    supabase.from('dashboard_stats').select('*').eq('business_id', businessId).single(),
    supabase.from('jobs').select('brand').eq('business_id', businessId),
    supabase.from('customers').select(`id, jobs (next_service_date, service_records (service_date))`).eq('business_id', businessId)
  ])

  if (stats.error) throw stats.error
  if (brandBreakdown.error) throw brandBreakdown.error
  if (retentionData.error) throw retentionData.error

  const brandCounts = brandBreakdown.data.reduce((acc, job) => {
    acc[job.brand] = (acc[job.brand] || 0) + 1
    return acc
  }, {})

  return {
    stats: stats.data,
    brandCounts,
    customers: retentionData.data
  }
}