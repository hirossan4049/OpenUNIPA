import { OpenUNIPA, UnivList } from '../../src/index'
import { FSController } from '../../src/controllers/fs'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const username = process.env.UNIPA_USER_ID || 'test'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'test'
  const useStub = !process.env.UNIPA_USER_ID

  console.log('📱 Menu Controller Example')
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
    
    // Navigate to main menu
    console.time('Navigating to menu')
    await unipa.menu.navigateToStudentMenu()
    console.timeEnd('Navigating to menu')
    
    console.log('\n📋 Menu Navigation Complete')
    console.table({
      Status: 'Success',
      CurrentPage: 'Student Menu',
      Description: 'Successfully navigated to student menu'
    })
    
    // Note: Actual menu items would depend on the HTML structure
    // This is a demonstration of how menu navigation could be displayed
    const menuOptions = [
      { Option: 'Grades', Description: 'View academic grades', Available: true },
      { Option: 'Timetable', Description: 'View class schedule', Available: true },
      { Option: 'Attendance', Description: 'Check attendance records', Available: true },
      { Option: 'Registration', Description: 'Course registration', Available: false }
    ]
    
    console.log('\n🗂️ Available Menu Options:')
    console.table(menuOptions)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)