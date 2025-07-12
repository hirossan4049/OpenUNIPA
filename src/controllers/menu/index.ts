import BaseController from "../../base"

type Item = {
  title: string,
  link?: string,
  items?: Item[]
}

export class MenuController extends BaseController {
  getMenu(flatten = true) {
    const { element } = this.session
    if (!element) { throw new Error("element is not defined") }

    let items: { [title: string]: Item[] } = {}
    const menus = element.getElementById("menubox")?.querySelectorAll("div")
    menus?.forEach((menu1) => {
      const title = menu1?.querySelector(".menuhead")?.textContent
      // menuheadがないやつはめんどくさいのでスキップ
      if (!title) { return }

      let item: Item[] = []

      menu1?.querySelector(".submenu")?.querySelectorAll("a").forEach((a) => {
        if (a.attrs["onclick"]) {
          item.push({ title: a.textContent.toString(), link: a.attrs["onclick"] })
        }

        const submenuId = a.attrs["onmouseover"]
        if (submenuId) {
          const submenuItems = menu1?.querySelectorAll("div").find((div) => div.attrs["onmouseover"] === submenuId)?.querySelectorAll("a")
          if (flatten) {
            submenuItems?.forEach((a) => {
              item.push({ title: this.menuTitlePretty(a.textContent), link: a.attrs["onclick"] })
            })
          } else {
            item.push({
              title: this.menuTitlePretty(a.textContent),
              items: submenuItems?.map<Item>((a) => ({ title: a.textContent, link: a.attrs["onclick"] })) || []
            })
          }
        }
      })

      items[title] = item
    })

    return items
  }

  async click(item: Item, name: string = "") {
    const form = this.session.element?.querySelector("form")
    if (!form) { throw new Error("form is not defined") }
    const formLink = form?.getAttribute("action")
    const { menuNo, funcRowId } = this.convertItem(item)
    if (!menuNo || !funcRowId) { throw new Error("menuNo or funcRowId is not defined") }
    const token = this.session.request.getToken();
    if (!token) { throw new Error("token is not defined") }

    const params = new URLSearchParams({
      'header:form1:htmlMenuItemButton': "実行",
      'header:form1:hiddenMenuNo': menuNo,
      'header:form1:hiddenFuncRowId': funcRowId,
      'com.sun.faces.VIEW': token,
      'header:form1': 'header:form1',
    })

    const res = await this.session.request.fetch(formLink!, params, { method: "POST", name })
    if (res.state !== "success") { throw new Error("failed " + res.state) }
    this.session.element = res.element
  }

  // findClick(title: string) { }


  objects() { }

  pretty() { }

  private menuTitlePretty(title: string) {
    return title.replaceAll("　", "").replaceAll(">", "").replaceAll("<", "")
  }

  private convertItem(item: Item): { menuNo?: string, funcRowId?: string } {
    const l = item.link
    if (!l) return {}
    const menuNo = l.slice(l.indexOf('(') + 1, l.indexOf(','))
    const funcRowId = l.slice(l.indexOf(',') + 1, l.indexOf(')'))
    return { menuNo, funcRowId }
  }

}
