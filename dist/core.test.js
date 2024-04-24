"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const core_1 = require("./core");
(0, vitest_1.test)('adds 1 + 2 to equal 3', () => {
    (0, vitest_1.expect)((0, core_1.hello)()).toBe("hello world");
});
//# sourceMappingURL=core.test.js.map