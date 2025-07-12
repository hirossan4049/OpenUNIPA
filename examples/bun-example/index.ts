import { OpenUNIPA, UnivList } from 'open-unipa';

console.log('🚀 OpenUNIPA Bun Example');

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID || 'test_user',
  password: process.env.UNIPA_PLAIN_PASSWORD || 'test_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true, // Use stub mode by default for safety
    saveHTML: false,
  }
});

async function main() {
  try {
    console.log('📊 Fetching data...');
    
    // In stub mode, no login required
    const timetable = await unipa.timetable.fetch();
    const grades = await unipa.grades.fetch();
    const attendance = await unipa.attendance.fetch();
    const notices = await unipa.notice.fetch();

    console.log('\n✅ Results:');
    console.log(`GPA: ${grades.getGPA()}`);
    console.log(`取得単位: ${grades.getTotalEarnedCredits()}`);
    console.log(`出席率: ${attendance.getOverallAttendanceRate()}%`);
    console.log(`未読掲示: ${notices.getUnreadNotices().length}件`);

    console.log('\n📅 Today\'s Timetable:');
    timetable.print();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();