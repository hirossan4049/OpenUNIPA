import { OpenUNIPA, UnivList } from '../../src/index'
import { FSController } from '../../src/controllers/fs'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const username = process.env.UNIPA_USER_ID || 'test'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'test'
  const useStub = !process.env.UNIPA_USER_ID

  console.log('📅 Timetable Controller Example')
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
    
    console.time('Fetching timetable')
    const timetable = await unipa.timetable.fetch()
    console.timeEnd('Fetching timetable')
    
    if (!timetable.items || timetable.items.length === 0) {
      console.log('📭 No timetable data available')
      return
    }
    
    // Timetable summary
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCount = [0, 0, 0, 0, 0, 0]
    const periodCount = {}
    
    timetable.items.forEach(item => {
      dayCount[item.week]++
      if (!periodCount[item.period]) periodCount[item.period] = 0
      periodCount[item.period]++
    })
    
    console.log('\n📊 Timetable Summary:')
    console.table({
      TotalClasses: timetable.items.length,
      ...Object.fromEntries(dayNames.map((day, i) => [day, dayCount[i]]))
    })
    
    console.log('\n⏰ Classes by Period:')
    console.table(periodCount)
    
    // All classes formatted for table
    const classes = timetable.items.map(item => ({
      Day: dayNames[item.week],
      Period: item.period,
      Subject: item.subject,
      Teacher: item.teacher,
      Room: item.room,
      Semester: item.semester,
      Type: item.type || 'Regular'
    }))
    
    console.log('\n📚 All Classes:')
    console.table(classes)
    
    // Group by day for better visualization
    dayNames.forEach((day, dayIndex) => {
      const dayClasses = timetable.items
        .filter(item => item.week === dayIndex)
        .sort((a, b) => a.period - b.period)
      
      if (dayClasses.length > 0) {
        console.log(`\n📅 ${day}:`)
        console.table(dayClasses.map(item => ({
          Period: item.period,
          Subject: item.subject,
          Teacher: item.teacher,
          Room: item.room
        })))
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)