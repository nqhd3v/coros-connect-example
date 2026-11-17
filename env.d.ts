// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    NEXT_PUBLIC_BASE_PATH: string;
    ENC_SECRET_STR: string;
  }
}
