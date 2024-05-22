import { Session } from "../OpenUNIPA"

type Item = {
  title: string,
  link?: string,
  items?: Item[]
}

export class Menu {
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

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

  objects() { }

  pretty() { }

  private menuTitlePretty(title: string) {
    return title.replaceAll("　", "").replaceAll(">", "").replaceAll("<", "")
  }

}
