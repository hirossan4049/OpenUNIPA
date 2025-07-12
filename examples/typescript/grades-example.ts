import { OpenUNIPA, UnivList } from '../../src/index'
import { FSController } from '../../src/controllers/fs'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const username = process.env.UNIPA_USER_ID || 'test'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'test'
  const useStub = !process.env.UNIPA_USER_ID

  console.log('📚 Grades Controller Example')
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
    
    console.time('Fetching grades')
    const grades = await unipa.grades.fetch()
    console.timeEnd('Fetching grades')
    
    // Student information
    console.log('\n👤 Student Information:')
    console.table({
      Department: grades.student.department,
      Year: grades.student.year,
      TotalCredits: grades.getTotalEarnedCredits(),
      GPA: grades.calculateGPA().toFixed(2)
    })
    
    // Grade summary by status
    const summary = {
      Total: grades.grades.length,
      Passed: grades.getPassedGrades().length,
      Failed: grades.getFailedGrades().length,
      Excellent: grades.grades.filter(g => g.grade === '秀').length,
      Good: grades.grades.filter(g => g.grade === '優').length,
      Satisfactory: grades.grades.filter(g => g.grade === '良').length,
      Pass: grades.grades.filter(g => g.grade === '可').length
    }
    
    console.log('\n📊 Grade Summary:')
    console.table(summary)
    
    // Recent grades (top 10)
    const recentGrades = grades.grades.slice(0, 10).map(g => ({
      Subject: g.subject,
      Grade: g.grade,
      Credits: g.credits,
      Year: g.year,
      Semester: g.semester,
      Category: g.category
    }))
    
    console.log('\n📋 Recent Grades (Top 10):')
    console.table(recentGrades)
    
    // Grade distribution by year
    const yearDistribution = {}
    grades.grades.forEach(g => {
      if (!yearDistribution[g.year]) {
        yearDistribution[g.year] = { count: 0, credits: 0 }
      }
      yearDistribution[g.year].count++
      yearDistribution[g.year].credits += g.credits
    })
    
    console.log('\n📅 Grade Distribution by Year:')
    console.table(yearDistribution)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)