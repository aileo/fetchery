import { resolve } from 'path';
import express from 'express';
import multer from 'multer';
import { beforeAll, afterAll } from 'vitest';
import * as http from 'http';

import type { Express } from 'express';

const upload = multer();
let server: http.Server;

beforeAll(() => {
  const app: Express = express();

  app.get('/dummy', (req, res) => res.json({ dummy: true }));
  app.get('/params/:single_param', ({ params }, res) => res.json({ params }));
  app.get('/params/:multiple/:params', ({ params }, res) =>
    res.json({ params })
  );
  app.get('/query', ({ query }, res) => res.json({ query }));
  app.post('/body/json', express.json(), ({ body }, res) => res.json({ body }));
  app.post('/body/form', upload.none(), ({ body }, res) =>
    res.json({ body: body })
  );
  app.post('/body/url', express.urlencoded(), ({ body }, res) =>
    res.json({ body: body })
  );
  app.post('/body/file', upload.single('file'), ({ file }, res) =>
    res.json({ file: { name: file?.originalname, size: file?.size } })
  );
  app.get('/headers', (req, res) => res.json({ headers: req.headers }));

  app.use('/coverage', express.static(resolve(__dirname, '../coverage')));
  app.use('/test', express.static(resolve(__dirname, '../test')));

  return new Promise<void>((resolve) => {
    server = app.listen(8080, () => resolve());
  });
});

afterAll(() => {
  server.close();
});
