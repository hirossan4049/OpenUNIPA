import { OpenUNIPA, UnivList } from '../../src/index'
import { FSController } from '../../src/controllers/fs'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
  const username = process.env.UNIPA_USER_ID || 'test'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'test'
  const useStub = !process.env.UNIPA_USER_ID

  console.log('🔐 Account Controller Example')
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
    console.time('Login time')
    await unipa.account.login()
    console.timeEnd('Login time')
    
    console.log('✅ Login successful')
    
    // Display account info if available
    const accountInfo = {
      username,
      university: 'Kindai University',
      campus: 'Higashi-Osaka',
      mode: useStub ? 'Stub Mode' : 'Real API Mode'
    }
    
    console.log('\n📊 Account Information:')
    console.table(accountInfo)
    
  } catch (error) {
    console.error('❌ Login failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)