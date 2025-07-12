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
    
    // Note: The attendance controller implementation would depend on the actual API
    // This is a demonstration of how attendance data could be displayed
    
    console.log('📝 Attendance Feature')
    console.table({
      Status: 'Available',
      Description: 'Attendance tracking functionality',
      Note: 'Implementation depends on UNIPA system version'
    })
    
    // Example attendance data structure
    const exampleAttendance = [
      { Subject: 'Programming I', TotalClasses: 15, Attended: 14, Rate: '93.3%', Status: 'Good' },
      { Subject: 'Database Systems', TotalClasses: 15, Attended: 15, Rate: '100%', Status: 'Excellent' },
      { Subject: 'Web Development', TotalClasses: 15, Attended: 13, Rate: '86.7%', Status: 'Good' },
      { Subject: 'Mathematics', TotalClasses: 15, Attended: 12, Rate: '80.0%', Status: 'Caution' }
    ]
    
    console.log('\n📊 Example Attendance Data:')
    console.table(exampleAttendance)
    
    // Summary statistics
    const totalClasses = exampleAttendance.reduce((sum, item) => sum + item.TotalClasses, 0)
    const totalAttended = exampleAttendance.reduce((sum, item) => sum + item.Attended, 0)
    const overallRate = ((totalAttended / totalClasses) * 100).toFixed(1)
    
    console.log('\n📈 Attendance Summary:')
    console.table({
      TotalSubjects: exampleAttendance.length,
      TotalClasses: totalClasses,
      TotalAttended: totalAttended,
      OverallRate: `${overallRate}%`,
      Status: parseFloat(overallRate) >= 80 ? 'Good Standing' : 'Needs Improvement'
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)