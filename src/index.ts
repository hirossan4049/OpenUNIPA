import { hello } from './core';

export { hello } from './core';

(async () => {
  await hello()
})()