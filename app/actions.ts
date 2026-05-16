'use server'
import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Helper function to force an execution delay
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required server env vars: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function checkStudentGrade(email: string, pin: string) {
  // 1. Anti-Brute-Force Throttle: Forces a 1.2-second delay on every request
  await sleep(1200)

  // 2. Data Normalization
  const cleanEmail = email.trim().toLowerCase()
  const cleanPin = pin.trim()

  // Basic sanity validation before executing a database pipeline query
  if (!cleanEmail || cleanPin.length !== 4) {
    return { success: false, message: 'Malformed parameters. Request rejected.' }
  }

  try {
    const supabase = getSupabaseServerClient()

    // 3. Precise Single-Row Index Selection
    const { data: student, error } = await supabase
      .from('student_grades')
      .select(
        `
        id,
        student_name,
        email,
        q1_grade,
        q2_grade,
        assignment
        `
      )
      .eq('email', cleanEmail)
      .eq('pin_code', cleanPin)
      .maybeSingle()

    // Query error (not the "no rows" case)
    if (error) {
      const meta = error as unknown as Record<string, unknown>
      console.error('[checkStudentGrade] Supabase query error:', {
        message: error.message,
        code: meta.code,
        details: meta.details,
        hint: meta.hint,
      })
      return { success: false, message: 'Database query error. Please try again later.' }
    }

    // No matching record
    if (!student) {
      return { success: false, message: 'No matching record found. Verify your credentials.' }
    }

    // Success: Return only the explicit matching dataset parameters
    return {
      success: true,
      name: student.student_name,
      Quiz1: student.q1_grade ?? null,
      Quiz2: student.q2_grade ?? null,
      Assignment: student.assignment ?? null,
    }
  } catch (err) {
    // Log server-side; return a safe message to the client
    console.error('[checkStudentGrade] Unexpected server error:', err)
    return { success: false, message: 'Server configuration error. Please try again later.' }
  }
}