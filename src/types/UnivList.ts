export type Univ = {
  code?: string
  name: string
  campus: string
  baseUrl: string
  loginPath?: string
}

export const UnivList = {
  KINDAI: {
    HIGASHI_OSAKA: {
      code: "F127310108116",
      name: "近畿大学",
      campus: "東大阪キャンパス",
      baseUrl: "https://unipa.itp.kindai.ac.jp",
      loginPath: "/up/faces/login/Com00501A.jsp",
    } as Univ,
    OSAKA_SAYAMA: {
      code: "",
      name: "近畿大学",
      campus: "大阪狭山キャンパス",
      baseUrl: "https://med-unipa.itp.kindai.ac.jp",
      loginPath: "/up/faces/login/Com00501A.jsp",
    } as Univ,
  }
}
