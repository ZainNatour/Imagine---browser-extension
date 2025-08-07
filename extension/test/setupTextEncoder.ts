import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
(global as any).chrome = {
  storage: {
    sync: {
      get: (_: any, cb: (res: any) => void) => cb({}),
      set: () => {},
    },
    local: {
      get: (_: any, cb: (res: any) => void) => cb({}),
      set: () => {},
    },
  },
  runtime: { getURL: (p: string) => p },
};
