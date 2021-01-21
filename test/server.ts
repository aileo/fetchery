import { resolve } from 'path';
import * as express from 'express';
import * as Bundler from 'parcel-bundler';
import { runner } from 'mocha-headless-chrome';
import * as multer from 'multer';

import { writeFile } from 'fs';

const upload = multer();

const bundler = new Bundler(resolve(__dirname, './suite.html'), {
  watch: false,
  outDir: './dev',
});
const app = express();

app.get('/dummy', (req, res) => res.json({ dummy: true }));
app.get('/params/:single_param', ({ params }, res) => res.json({ params }));
app.get('/params/:multiple/:params', ({ params }, res) => res.json({ params }));
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

function build(): Promise<unknown> {
  return new Promise((resolve) => {
    bundler.on('bundled', () => resolve(undefined));
    app.use(bundler.middleware());
  });
}

async function test(): Promise<void> {
  await build();
  const server = app.listen(process.env.PORT || 8080);
  const result = await runner({
    file: 'http://127.0.0.1:8080',
  });

  await new Promise((accept, reject) => {
    writeFile(
      resolve(__dirname, '../.nyc_output/out.json'),
      JSON.stringify(result.coverage),
      (err) => {
        if (err) reject(err);
        else accept(undefined);
      }
    );
  });

  server.close();
}

test();
