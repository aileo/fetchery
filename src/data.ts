import { CONTENT_TYPE } from './consts';
import { Body } from './types';

type Constructor<T> = new (...args: undefined[]) => T;

export function sanitize(value: unknown): string {
  const _value = typeof value === 'function' ? value() : value;
  if (typeof _value === 'string') return _value;
  return JSON.stringify(_value);
}

function toRecords(data: URLSearchParams | FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  //@ts-ignore: entries does not exists on FormData/URLSearchParams
  for (const [key, value] of data.entries()) {
    obj[key] = value;
  }
  return obj;
}

function toDataObject(
  data:
    | Record<string, unknown>
    | URLSearchParams
    | FormData
    | unknown[]
    | ArrayBufferView<ArrayBufferLike>
    | string,
  Constructor: Constructor<FormData | URLSearchParams>
) {
  if (data instanceof Constructor) return data;
  if (Array.isArray(data)) {
    throw new Error(`Can not convert to ${Constructor.name}`);
  }

  const _data =
    data instanceof FormData || data instanceof URLSearchParams
      ? toRecords(data)
      : data;
  const obj = new Constructor(undefined);

  if (typeof _data !== 'string') {
    Object.keys(_data as Record<string, unknown>).forEach((key) => {
      const value = (_data as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        value.forEach((val: unknown) => {
          obj.append(key, sanitize(val));
        });
      } else if (value instanceof File && obj instanceof FormData) {
        obj.append(key, value);
      } else {
        obj.append(key, sanitize(value));
      }
    });
  }
  return obj;
}

function toJson(
  data:
    | Record<string, unknown>
    | URLSearchParams
    | FormData
    | unknown[]
    | string
    | (() => unknown)
    | ArrayBufferView<ArrayBufferLike>
): string {
  let _data: unknown;

  if (typeof data === 'string') {
    try {
      JSON.parse(data);
      return data;
    } catch (e) {
      _data = data;
    }
  } else if (data instanceof URLSearchParams || data instanceof FormData) {
    _data = toRecords(data);
  } else if (Array.isArray(data)) {
    _data = data;
  } else if (typeof data === 'function') {
    _data = data();
  } else {
    _data = Object.assign({}, data);
  }

  return JSON.stringify(_data);
}

export function query(data: Record<string, unknown>): string {
  return toDataObject(data, URLSearchParams).toString();
}

export function body(
  contentType?: string,
  data?: Body
): BodyInit | null | undefined {
  if (data === undefined) return undefined;
  if (data === null) return null;
  if (
    contentType === undefined ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof ReadableStream
  ) {
    return data as BodyInit;
  }

  if (contentType === CONTENT_TYPE.JSON) return toJson(data);
  if (contentType === CONTENT_TYPE.URLENCODED) {
    return toDataObject(data, URLSearchParams);
  }
  if (contentType === CONTENT_TYPE.MULTIPART_FORMDATA) {
    return toDataObject(data, FormData);
  }

  return data as BodyInit;
}
