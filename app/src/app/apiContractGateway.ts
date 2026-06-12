import { z } from 'zod';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ErrorKeyResolver = string | ((status: number) => string);

export interface ApiContractRequestOptions<TPayload, TResponse> {
  url: string;
  method?: Method;
  payload?: TPayload;
  payloadSchema?: z.ZodType<TPayload>;
  responseSchema: z.ZodType<TResponse>;
  token?: string;
  signal?: AbortSignal;
  errorKeys: {
    requestValidation: string;
    http: ErrorKeyResolver;
    responseValidation: string;
    network: string;
  };
}

const resolveErrorKey = (resolver: ErrorKeyResolver, status: number): string =>
  typeof resolver === 'function' ? resolver(status) : resolver;

export const requestContract = async <TPayload, TResponse>({
  url,
  method = 'GET',
  payload,
  payloadSchema,
  responseSchema,
  token,
  signal,
  errorKeys,
}: ApiContractRequestOptions<TPayload, TResponse>): Promise<TResponse> => {
  let validatedPayload: TPayload | undefined;

  if (payload !== undefined) {
    if (payloadSchema) {
      try {
        validatedPayload = payloadSchema.parse(payload);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(errorKeys.requestValidation);
        }

        throw error;
      }
    } else {
      validatedPayload = payload;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: {
        ...(validatedPayload !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: validatedPayload !== undefined ? JSON.stringify(validatedPayload) : undefined,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(errorKeys.network);
  }

  if (!response.ok) {
    throw new Error(resolveErrorKey(errorKeys.http, response.status));
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new Error(errorKeys.responseValidation);
  }

  try {
    return responseSchema.parse(responseBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(errorKeys.responseValidation);
    }

    throw error;
  }
};
