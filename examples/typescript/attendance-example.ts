import { OpenUNIPA, UnivList } from '../../src/index'
import { FSController } from '../../src/controllers/fs'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const username = process.env.UNIPA_USER_ID || 'test'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'test'
  const useStub = !process.env.UNIPA_USER_ID

  console.log('📊 Attendance Controller Example')
  console.log(`Mode: ${useStub ? 'Stub' : 'Real API'}\n`)

  const unipa = OpenUNIPA({
    username,
    password,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
    debug: { 
      stub: useStub,
      saveHTML: false
    }
  })

  unipa.fs = new FSController(unipa)

  try {
    await unipa.account.login()
    console.log('✅ Login successful\n')
    
    console.time('Fetching attendance data')
    const attendance = await unipa.attendance.fetch()
    console.timeEnd('Fetching attendance data')
    
    if (!attendance.items || attendance.items.length === 0) {
      console.log('📭 No attendance data available')
      return
    }
    
    // Overall attendance statistics
    const overallRate = attendance.getOverallAttendanceRate()
    const statusCounts = attendance.getStatusCounts()
    
    console.log('\n📈 Overall Attendance Statistics:')
    console.table({
      TotalRecords: attendance.items.length,
      OverallAttendanceRate: `${overallRate}%`,
      AttendedClasses: statusCounts['出席'],
      AbsentClasses: statusCounts['欠席'],
      LateClasses: statusCounts['遅刻'],
      EarlyLeaveClasses: statusCounts['早退'],
      ExcusedAbsences: statusCounts['公欠'] + statusCounts['忌引'] + statusCounts['病欠'],
      CancelledClasses: statusCounts['休講']
    })
    
    // Subject-wise attendance summary
    const subjectSummaries = attendance.getSubjectSummaries()
    console.log('\n📚 Subject-wise Attendance Summary:')
    console.table(subjectSummaries.map(summary => ({
      Subject: summary.subject,
      Teacher: summary.teacher,
      TotalClasses: summary.totalClasses,
      AttendedClasses: summary.attendedClasses,
      AbsentClasses: summary.absentClasses,
      AttendanceRate: `${summary.attendanceRate}%`,
      Status: summary.attendanceRate >= 80 ? '✅ Good' : '⚠️ Low'
    })))
    
    // Low attendance warning
    const lowAttendanceSubjects = attendance.getLowAttendanceSubjects(80)
    if (lowAttendanceSubjects.length > 0) {
      console.log('\n⚠️ Subjects with Low Attendance Rate (< 80%):')
      console.table(lowAttendanceSubjects.map(subject => ({
        Subject: subject.subject,
        Teacher: subject.teacher,
        AttendanceRate: `${subject.attendanceRate}%`,
        AbsentClasses: subject.absentClasses,
        TotalClasses: subject.totalClasses
      })))
    } else {
      console.log('\n✅ All subjects have good attendance rate (≥ 80%)')
    }
    
    // Recent attendance records (last 10)
    const recentRecords = attendance.items.slice(-10)
    console.log('\n📋 Recent Attendance Records (Last 10):')
    console.table(recentRecords.map(record => ({
      Date: record.date,
      Period: record.period,
      Subject: record.subject,
      Teacher: record.teacher,
      Status: record.status,
      Note: record.note || '-'
    })))
    
    // Monthly breakdown (if data spans multiple months)
    const monthlyBreakdown = {}
    attendance.items.forEach(record => {
      const month = record.date.substring(0, 7) // YYYY-MM
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { total: 0, attended: 0 }
      }
      monthlyBreakdown[month].total++
      if (['出席', '遅刻', '早退'].includes(record.status)) {
        monthlyBreakdown[month].attended++
      }
    })
    
    if (Object.keys(monthlyBreakdown).length > 1) {
      console.log('\n📅 Monthly Attendance Breakdown:')
      const monthlyStats = Object.entries(monthlyBreakdown).map(([month, stats]) => ({
        Month: month,
        TotalClasses: stats.total,
        AttendedClasses: stats.attended,
        AttendanceRate: `${Math.round((stats.attended / stats.total) * 100)}%`
      }))
      console.table(monthlyStats)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)