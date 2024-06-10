import { Session } from "../OpenUNIPA"

export default class BaseController {
  session: Session

  constructor(session: Session) {
    this.session = session
  }
}