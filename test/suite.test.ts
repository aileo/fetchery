import { describe, test, expect, beforeAll } from 'vitest';
import Fetchery, { CONTENT_TYPE, METHOD, body } from '../src/index';
import { Request } from 'express';

const data = {
  object: { foo1: 'bar1', foo2: 'bar2' },
  formData: new FormData(),
  urlEncoded: new URLSearchParams(),
};
data.formData.append('foo1', 'bar1');
data.formData.append('foo2', 'bar2');
data.urlEncoded.append('foo1', 'bar1');
data.urlEncoded.append('foo2', 'bar2');

describe('addService', () => {
  let client: Fetchery;

  beforeAll(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('foo.bar', { route: '/foo' });
  });

  test('should add service using string path', () => {
    client.addService('string.path', { route: '/foo' });
  });

  test('should add service using array path', () => {
    client.addService(['array', 'path'], { route: '/foo' });
  });

  test('should throw if service already exists', () => {
    expect(() => {
      client.addService(['foo', 'bar'], { route: '/bar' });
    }).toThrow('Service "foo.bar" already exists');
  });
});

describe('getService', () => {
  let client: Fetchery;

  beforeAll(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('foo.bar', { route: '/service' });
  });

  test('should get service using string path', () => {
    const service = client.getService('foo.bar');
    expect(typeof service).toBe('function');
  });

  test('should get service using array path', () => {
    const service = client.getService(['foo', 'bar']);
    expect(typeof service).toBe('function');
  });

  test('should throw if service does not exists', () => {
    expect(() => {
      client.getService(['does', 'not', 'exists']);
    }).toThrow('Service "does.not.exists" not found');
  });
});

describe('getServices', () => {
  let client: Fetchery;

  beforeAll(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('dummy', { route: '/dummy' });
    client.addService('item.get', { route: '/item', method: METHOD.GET });
    client.addService('item.create', { route: '/item', method: METHOD.POST });
  });

  test('should get all services', () => {
    const services = client.getServices();
    expect(typeof services.dummy).toBe('function');
    expect(typeof services.item.get).toBe('function');
    expect(typeof services.item.create).toBe('function');
  });

  test('should run dummy from services export', async () => {
    const services = client.getServices();
    const res = await services.dummy({});
    expect(res).toEqual({ dummy: true });
  });
});

describe('request', () => {
  let client: Fetchery;

  beforeAll(() => {
    client = new Fetchery('http://127.0.0.1:8080', {
      headers: {
        globalDefault: 'globalDefault',
        globalGetter() {
          return 'globalGetter';
        },
      },
      params: {
        globalDefault: 'globalDefault',
        globalGetter() {
          return 'globalGetter';
        },
      },
    });

    client.addService('params.single', { route: '/params/:id' });
    client.addService('params.globalDefault', {
      route: '/params/:globalDefault',
    });
    client.addService('params.globalGetter', {
      route: '/params/:globalGetter',
    });
    client.addService('params.serviceDefault', {
      route: '/params/:serviceDefault',
      params: { serviceDefault: 'serviceDefault' },
    });
    client.addService('params.serviceGetter', {
      route: '/params/:serviceGetter',
      params: { serviceGetter: 'serviceGetter' },
    });
    client.addService('params.multiple', { route: '/params/:id/:subid' });
    client.addService('params.duplicated', { route: '/params/:id/:id' });
    client.addService('params.solver', {
      route: '/params/{id}',
      solver: (url, param, value) => {
        return url.replace(new RegExp(`{${param}}`, 'g'), value);
      },
    });
    client.addService('query', { route: '/query' });
    client.addService('body.json', {
      route: '/body/json',
      contentType: CONTENT_TYPE.JSON,
      method: METHOD.POST,
    });
    client.addService('body.form', {
      route: '/body/form',
      contentType: false,
      method: METHOD.POST,
    });
    client.addService('body.url', {
      route: '/body/url',
      contentType: CONTENT_TYPE.URLENCODED,
      method: METHOD.POST,
    });
    client.addService('body.file', {
      route: '/body/file',
      contentType: false,
      method: METHOD.POST,
    });
    client.addService('header.global', { route: '/headers' });
    client.addService('header.service', {
      route: '/headers',
      headers: {
        serviceDefault: 'serviceDefault',
        serviceGetter() {
          return 'serviceGetter';
        },
      },
    });
  });

  describe('headers', () => {
    test('should retrieve globals headers', async () => {
      const { headers } = (await client.request('header.global')) as Request;
      expect(headers.globaldefault).toBe('globalDefault');
      expect(headers.globalgetter).toBe('globalGetter');
    });

    test('should retrieve globals and service headers', async () => {
      const { headers } = (await client.request('header.service')) as Request;
      expect(headers.globaldefault).toBe('globalDefault');
      expect(headers.globalgetter).toBe('globalGetter');
      expect(headers.servicedefault).toBe('serviceDefault');
      expect(headers.servicegetter).toBe('serviceGetter');
    });
  });

  describe('params', () => {
    test('should solve single param', async () => {
      const res = await client.request('params.single', {
        params: { id: 'test' },
      });
      expect(res).toEqual({ params: { single_param: 'test' } });
    });

    test('should solve single param with global default', async () => {
      const res = await client.request('params.globalDefault');
      expect(res).toEqual({ params: { single_param: 'globalDefault' } });
    });

    test('should solve single param with global getter', async () => {
      const res = await client.request('params.globalGetter');
      expect(res).toEqual({ params: { single_param: 'globalGetter' } });
    });

    test('should solve single param with service default', async () => {
      const res = await client.request('params.serviceDefault');
      expect(res).toEqual({ params: { single_param: 'serviceDefault' } });
    });

    test('should solve single param with service getter', async () => {
      const res = await client.request('params.serviceGetter');
      expect(res).toEqual({ params: { single_param: 'serviceGetter' } });
    });

    test('should solve multiple params', async () => {
      const res = await client.request('params.multiple', {
        params: { id: 'foo', subid: 'bar' },
      });
      expect(res).toEqual({ params: { multiple: 'foo', params: 'bar' } });
    });

    test('should solve repeated param', async () => {
      const res = await client.request('params.multiple', {
        params: { id: 'foo', subid: 'bar' },
      });
      expect(res).toEqual({ params: { multiple: 'foo', params: 'bar' } });
    });

    test('should solve with custom solver', async () => {
      const res = await client.request('params.solver', {
        params: { id: 'test' },
      });
      expect(res).toEqual({ params: { single_param: 'test' } });
    });
  });

  describe('query', () => {
    test('should solve single query param', async () => {
      const res = await client.request('query', {
        query: { foo: 'bar' },
      });
      expect(res).toEqual({ query: { foo: 'bar' } });
    });

    test('should solve multiple query params', async () => {
      const res = await client.request('query', {
        query: { foo1: 'bar1', foo2: 'bar2' },
      });
      expect(res).toEqual({ query: { foo1: 'bar1', foo2: 'bar2' } });
    });

    test('should solve query array params', async () => {
      const res = await client.request('query', {
        query: { array: ['foo', 'bar'] },
      });
      expect(res).toEqual({ query: { array: ['foo', 'bar'] } });
    });

    test('should solve query object params', async () => {
      const res = await client.request('query', {
        query: { object: { foo: 'bar' } },
      });
      expect(res).toEqual({ query: { object: '{"foo":"bar"}' } });
    });
  });

  describe('body', () => {
    describe('Should send json', () => {
      test('From object', async () => {
        const res = await client.request('body.json', { body: data.object });
        expect(res).toEqual({ body: data.object });
      });

      test('From JSON string', async () => {
        const res = await client.request('body.json', {
          body: JSON.stringify(data.object),
        });
        expect(res).toEqual({ body: data.object });
      });

      test('From FormData', async () => {
        const res = await client.request('body.json', { body: data.formData });
        expect(res).toEqual({ body: data.object });
      });

      test('From URLSearchParams', async () => {
        const res = await client.request('body.json', {
          body: data.urlEncoded,
        });
        expect(res).toEqual({ body: data.object });
      });
    });

    describe('Should send FormData', () => {
      test('From object', async () => {
        const res = await client.request('body.form', {
          body: body(CONTENT_TYPE.MULTIPART_FORMDATA, data.object),
        });
        expect(res).toEqual({ body: data.object });
      });

      test('From FormData', async () => {
        const res = await client.request('body.form', { body: data.formData });
        expect(res).toEqual({ body: data.object });
      });

      test('From URLSearchParams', async () => {
        const res = await client.request('body.form', {
          body: body(CONTENT_TYPE.MULTIPART_FORMDATA, data.urlEncoded),
        });
        expect(res).toEqual({ body: data.object });
      });
    });

    describe('Should send URLSearchParams', () => {
      test('From object', async () => {
        const res = await client.request('body.url', { body: data.object });
        expect(res).toEqual({ body: data.object });
      });

      test('From FormData', async () => {
        const res = await client.request('body.url', { body: data.formData });
        expect(res).toEqual({ body: data.object });
      });

      test('From URLSearchParams', async () => {
        const res = await client.request('body.url', {
          body: data.urlEncoded,
        });
        expect(res).toEqual({ body: data.object });
      });
    });

    describe('Should send File', () => {
      test('From object', async () => {
        const file = new File(Array.from('test'), 'test.txt');
        const res = await client.request('body.file', {
          body: body(CONTENT_TYPE.MULTIPART_FORMDATA, { file }),
        });
        expect(res).toEqual({ file: { name: 'test.txt', size: 4 } });
      });

      test('From FormData', async () => {
        const file = new File(Array.from('test'), 'test.txt');
        const body = new FormData();
        body.append('file', file);
        const res = await client.request('body.file', { body });
        expect(res).toEqual({ file: { name: 'test.txt', size: 4 } });
      });
    });
  });
});
