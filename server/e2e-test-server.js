import express from 'express';
import path from 'path';
import serveStatic from 'serve-static';

var app = express();

app.get('/inventory-management-system-settings.json', function (req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;

  const useApiSettings = process.env.USE_API_SETTINGS === 'true';

  res.sendFile(
    path.resolve(
      isCiEnv
        ? useApiSettings
          ? './server/e2e-settings-with-api.json'
          : './server/e2e-settings.json'
        : './public/inventory-management-system-settings.json'
    )
  );
});

app.use(
  express.json(),
  serveStatic(path.resolve('./dist'), { index: ['index.html', 'index.htm'] })
);

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('E2E test server listening at http://localhost:%s', port);
});
