const runtimeEnv = import.meta.env as Record<string, string | undefined>;

(globalThis as { __SOCIALLY_ENV__?: Record<string, string | undefined> }).__SOCIALLY_ENV__ = runtimeEnv;
