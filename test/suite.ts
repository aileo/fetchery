import 'mocha';

import Fetchery from '../src/index';

import * as assert from 'assert';
import { CAST, CONTENT_TYPE, METHOD } from '../src';

mocha.setup('bdd');

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

  before(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('foo.bar', { route: '/foo' });
  });
  it('should add service using string path', () => {
    client.addService('string.path', { route: '/foo' });
  });
  it('should add service using array path', () => {
    client.addService(['array', 'path'], { route: '/foo' });
  });
  it('should throw if service already exists', () => {
    assert.throws(() => {
      client.addService(['foo', 'bar'], { route: '/bar' });
    }, 'Service "foo.bar" already exists');
  });
});

describe('getService', () => {
  let client: Fetchery;

  before(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('foo.bar', { route: '/service' });
  });
  it('should get service using string path', () => {
    const service = client.getService('foo.bar');
    assert.ok(typeof service === 'function');
  });
  it('should get service using array path', () => {
    const service = client.getService(['foo', 'bar']);
    assert.ok(typeof service === 'function');
  });
  it('should throw if service does not exists', () => {
    assert.throws(() => {
      client.getService(['does', 'not', 'exists']);
    }, 'Service "does.not.exists" not found');
  });
});

describe('getServices', () => {
  let client: Fetchery;

  before(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('dummy', { route: '/dummy' });
    client.addService('item.get', { route: '/item', method: METHOD.GET });
    client.addService('item.create', { route: '/item', method: METHOD.POST });
  });
  it('should get all services', () => {
    const services = client.getServices();
    assert.ok(typeof services.dummy === 'function');
    assert.ok(typeof services.item.get === 'function');
    assert.ok(typeof services.item.create === 'function');
  });
  it('should run dummy from services export', async () => {
    const services = client.getServices();
    const res = await services.dummy({});
    assert.deepStrictEqual(res, { dummy: true });
  });
});

describe('request', () => {
  let client: Fetchery;

  before(() => {
    client = new Fetchery('http://127.0.0.1:8080');
    client.addService('params.single', { route: '/params/:id' });
    client.addService('params.multiple', { route: '/params/:id/:subid' });
    client.addService('params.duplicated', { route: '/params/:id/:id' });
    client.addService('query', { route: '/query' });
    client.addService('body.json', {
      route: '/body/json',
      contentType: CONTENT_TYPE.JSON,
      cast: CAST.JSON,
      method: METHOD.POST,
    });
    client.addService('body.form', {
      route: '/body/form',
      contentType: false,
      cast: CAST.FORMDATA,
      method: METHOD.POST,
    });
    client.addService('body.url', {
      route: '/body/url',
      contentType: CONTENT_TYPE.URLENCODED,
      cast: CAST.URL,
      method: METHOD.POST,
    });
    client.addService('body.file', {
      route: '/body/file',
      contentType: false,
      cast: CAST.FORMDATA,
      method: METHOD.POST,
    });
  });

  describe('params', () => {
    it('should solve single param', async () => {
      const res = await client.request('params.single', {
        params: { id: 'test' },
      });
      assert.deepStrictEqual(res, { params: { single_param: 'test' } });
    });
    it('should solve multiple params', async () => {
      const res = await client.request('params.multiple', {
        params: { id: 'foo', subid: 'bar' },
      });
      assert.deepStrictEqual(res, {
        params: { multiple: 'foo', params: 'bar' },
      });
    });
    it('should solve repeated param', async () => {
      const res = await client.request('params.multiple', {
        params: { id: 'foo', subid: 'bar' },
      });
      assert.deepStrictEqual(res, {
        params: { multiple: 'foo', params: 'bar' },
      });
    });
  });

  describe('query', () => {
    it('should solve single query param', async () => {
      const res = await client.request('query', {
        query: { foo: 'bar' },
      });
      assert.deepStrictEqual(res, { query: { foo: 'bar' } });
    });
    it('should solve multiple query params', async () => {
      const res = await client.request('query', {
        query: { foo1: 'bar1', foo2: 'bar2' },
      });
      assert.deepStrictEqual(res, {
        query: { foo1: 'bar1', foo2: 'bar2' },
      });
    });
    it('should solve query array params', async () => {
      const res = await client.request('query', {
        query: { array: ['foo', 'bar'] },
      });
      assert.deepStrictEqual(res, { query: { array: ['foo', 'bar'] } });
    });
    it('should solve query object params', async () => {
      const res = await client.request('query', {
        query: { object: { foo: 'bar' } },
      });
      assert.deepStrictEqual(res, { query: { object: '{"foo":"bar"}' } });
    });
  });

  describe('body', () => {
    describe('Should send json', () => {
      it('From object', async () => {
        const res = await client.request('body.json', { body: data.object });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From JSON string', async () => {
        const res = await client.request('body.json', {
          body: JSON.stringify(data.object),
        });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From FormData', async () => {
        const res = await client.request('body.json', { body: data.formData });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From URLSearchParams', async () => {
        const res = await client.request('body.json', {
          body: data.urlEncoded,
        });
        assert.deepStrictEqual(res, { body: data.object });
      });
    });

    describe('Should send FormData', () => {
      it('From object', async () => {
        const res = await client.request('body.form', { body: data.object });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From FormData', async () => {
        const res = await client.request('body.form', { body: data.formData });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From URLSearchParams', async () => {
        const res = await client.request('body.form', {
          body: data.urlEncoded,
        });
        assert.deepStrictEqual(res, { body: data.object });
      });
    });

    describe('Should send URLSearchParams', () => {
      it('From object', async () => {
        const res = await client.request('body.url', { body: data.object });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From FormData', async () => {
        const res = await client.request('body.url', { body: data.formData });
        assert.deepStrictEqual(res, { body: data.object });
      });
      it('From URLSearchParams', async () => {
        const res = await client.request('body.url', {
          body: data.urlEncoded,
        });
        assert.deepStrictEqual(res, { body: data.object });
      });
    });

    describe('Should send File', () => {
      it('From object', async () => {
        const file = new File(Array.from('test'), 'test.txt');
        const res = await client.request('body.file', { body: { file } });
        assert.deepStrictEqual(res, { file: { name: 'test.txt', size: 4 } });
      });
      it('From FormData', async () => {
        const file = new File(Array.from('test'), 'test.txt');
        const body = new FormData();
        body.append('file', file);
        const res = await client.request('body.file', { body });
        assert.deepStrictEqual(res, { file: { name: 'test.txt', size: 4 } });
      });
    });
  });
});

mocha.run();
