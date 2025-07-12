export * from "./OpenUNIPA";
export * from "./base/index";
export * from "./types/UnivList";

import { register } from 'node-network-devtools';

// process.env.NODE_ENV === 'development' && 
register()