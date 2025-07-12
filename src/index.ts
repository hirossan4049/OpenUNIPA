export * from "./OpenUNIPA";
export * from "./base/index";
export * from "./types/UnivList";
export * from "./types/AttendanceItem";
export * from "./controllers/attendance";

import { register } from 'node-network-devtools';

// process.env.NODE_ENV === 'development' && 
register()