# Fetchery

Fetchery is a little wrapper around Javascript Fetch API written in Typescript to request REST API easily

## Usage

### Create services

```typescript
import Fetchery, { CONTENT_TYPE, METHOD } from 'fetchery';

// Create client
const client = new Fetchery(
  'https://api.domain.com', // base url
  // global defaults
  {
    method: METHOD.GET,
    contentType: CONTENT_TYPE.JSON, // Add "Content-Type" header and will cast content as JSON if compatible
  }
);

// Add services
client.addService(
  'user.login', // service path
  {
    route: '/api/login', // service route
    // service defaults
    method: METHOD.POST,
  }
);
client.addService('item.get', { route: '/api/item/:uuid' });
client.addService('file.upload', {
  route: '/api/file',
  method: METHOD.POST,
  contentType: false, // overwrite "Content-Type" header to send file using FormData
});
```

### Use services

```typescript
// Request using services
await client.request('user.login', {
  body: { username: 'foo', password: 'bar' },
});

// Get service as a function
const getItem = client.getService('item.get');
const item = await getItem({
  params: { uuid: 'abcdef00-0000-0000-0000-012345678910' },
});

// Send file
await client.request('file.upload', {
  body: { item: item.name, file: new File(Array.from('foo'), 'bar.txt') },
});
```

### Get all services

```typescript
const api = client.getServices();

await api.user.login({ body: { username: 'foo', password: 'bar' } });
const item = await api.item.get({
  params: { uuid: 'abcdef00-0000-0000-0000-012345678910' },
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate and run `npm run lint`.

## License

[MIT](./LICENSE)
