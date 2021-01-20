import { CAST } from './consts';
import { Body } from './types';

type Constructor<T> = new (...args: any[]) => T;

export function sanitize(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function toRecords(data: URLSearchParams | FormData): Record<string, any> {
  const obj: Record<string, unknown> = {};
  //@ts-ignore: entries does not exists on FormData/URLSearchParams
  for (const [key, value] of data.entries()) {
    obj[key] = value;
  }
  return obj;
}

function toDataObject(
  data: Record<string, any> | URLSearchParams | FormData | unknown[] | string,
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
  const obj = new Constructor(typeof _data === 'string' ? _data : undefined);

  if (typeof _data !== 'string') {
    Object.keys(_data).forEach((key) => {
      if (Array.isArray(_data[key])) {
        _data[key].forEach((value: any) => {
          obj.append(key, sanitize(value));
        });
      } else {
        obj.append(key, sanitize(_data[key]));
      }
    });
  }
  return obj;
}

function toJson(
  data: Record<string, any> | URLSearchParams | FormData | any[] | string
): string {
  let _data: any;

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
  } else {
    _data = Object.assign({}, data);
  }

  return JSON.stringify(_data);
}

export function query(data: Record<string, unknown>): string {
  return toDataObject(data, URLSearchParams).toString();
}

export function body(cast?: CAST, data?: Body): BodyInit | null | undefined {
  if (data === undefined) return undefined;
  if (data === null) return null;
  if (
    cast === undefined ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof ReadableStream
  ) {
    return data as BodyInit;
  }

  if (cast === CAST.JSON) return toJson(data);
  if (cast === CAST.URL) return toDataObject(data, URLSearchParams);
  if (cast === CAST.FORMDATA) return toDataObject(data, FormData);

  return data as BodyInit;
}
