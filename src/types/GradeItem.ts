export type GradeItem = {
  year: number
  semester: string // "前期", "後期"
  category: string // "共通教養科目", "外国語科目", "専門科目" など
  subcategory?: string // "必修科目", "選択科目" など
  subsubcategory?: string // "英語", "第二" など
  subject: string // 科目名
  classType?: string // "メディア授業" など
  credits?: number // 単位数
  grade?: string // "秀", "優", "良", "可", "不可", "不受", "認定"
  score?: number // 素点
  teacher?: string // 教員氏名
  indent: number // インデント レベル（階層の深さ）
}

export type CreditSummary = {
  category: string
  subcategory?: string
  earnedCredits: number
  mediaCredits: number // メディア授業の単位数（内数）
  totalCredits: number
}

export type GradesSummary = {
  student: {
    department: string // "大学 学部生 情報学部 情報学科 実世界コンピ"
    year: string // "2年"
    semester?: string
  }
  grades: GradeItem[]
  creditSummary: CreditSummary[]
}