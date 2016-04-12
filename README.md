# Normandy Actions
This repository contains the implementations of actions used in the
[Normandy recipe server][normandy].

[normandy]: https://github.com/mozilla/normandy

## Actions
Actions are structured as subfolders under the `actions` directory. The name of
the directory is used as the name of the action when uploading, meaning that
they must be valid slugs (alphanumeric + underscore and dash).

An action is required to have two files: an `index.js` file implementing the
action, and an `arguments.json` file describing the arguments object that the
action accepts using [JSON Schema][].

The `index.js` file must call the global `Normandy.registerAction` function,
passing the name of the action (which must match the directory name) and a
function implementing the action. The function takes a single argument that
conforms to the schema in `arguments.json`.

Actions are built using [Webpack][] and can be written in [ES2015][] thanks to
[Babel][]. See `.babelrc` for our specific configuration.

[JSON Schema]: http://json-schema.org/
[Webpack]: https://webpack.github.io/
[ES2015]: http://babeljs.io/docs/learn-es2015/
[Babel]: http://babeljs.io/

## Setup
Run `npm install` to install the dependencies.

Before running the upload script, you must create a configuration file with
the URL you want to upload actions to and your access credentials. To do so,
copy the `config.json-dist` file to `config.json` at the root of the repo:

```sh
cp config.json-dist config.json
```

`config.json` is split into multiple environments, that can be switched between
using the `--env=envname` argument to several commands. The environment from the
`defaultEnv` value in the config is used when no environment is specified. The
keys to configure are:

### `api_token`
Required. The API token for authenticate with the recipe server. You can
[generate this key via the Normandy admin interface][api-key].

[api-key]: http://normandy.readthedocs.org/en/latest/dev/workflow.html#generating-an-api-key

### `normandy_url`
The base URL of the Normandy recipe server to upload actions to. Example:
`https://localhost:8000/api/v1`.

### `verify`
Boolean setting as to whether the SSL certificate of the recipe server should be
verified or not. Should be set to false for local development servers, and true
otherwise.

## Scripts

### `npm run build`
Runs Webpack to build the actions. Post-build artifacts can be found in the
`build` directory, with one JS file per action.

### `npm run upload`
Uploads actions to an instance of the recipe server. Actions are automatically
built before uploading.

You can specify which individual actions to upload by passing their names to the
command:

```sh
npm run upload -- action-name other-action-name
```

You can specify which environment config from the `config.json` file to use
using the `--env` argument:

```sh
npm run upload -- --env=development action-name
```

If not environment is specified, the `default` one is used.

### `npm run watch`
Watches the `actions` directory for changes and uploads actions when changes to
their files are detected. This is mostly useful for local development where you
want to quickly update a local Normandy instance. Accepts the same `--env`
argument that `upload` does.

### `npm run test-watch`
Watches the `test` directory for changes and re-runs the tests automatically
when changes are detected.

## Tests
Use the `npm test` command to run the test suite. The tests require that you
have Firefox installed.

## Documentation

Documentation for the Driver API is stored in the `docs` directory and built
using [Sphinx][]. You'll want to create a [virtualenv][] and install the
requirements from the `docs/requirements.txt`:

```sh
pip install -r docs/requirements.txt
```

Then, build the documentation using `make`:

```sh
cd docs
make html
```

The built documentation should be available at `docs/_build/html/index.html`.

[Sphinx]: http://www.sphinx-doc.org/
[virtualenv]: https://virtualenv.pypa.io/

## License

Normandy actions are licensed under the MPLv2. See the `LICENSE` file for
details.
