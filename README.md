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
Before running the upload script, you must configure NPM with some credentials
using the `npm config` command:

```sh
# Replace "name" with the property name and "value" with the value.
npm config set normandy-actions:name value
```

### `api_token`
Required. The API token for authenticate with the recipe server.

### `normandy_url`
The base URL of the Normandy recipe server to upload actions to. Defaults to
`https://normandy.mozilla.org`.

### `verify`
Boolean setting as to whether the SSL certificate of the recipe server should be
verified or not. Defaults to true, but should be set to false for local
development.

## Scripts

### `npm run build`
Runs Webpack to build the actions. Post-build artifacts can be found in the
`build` directory, with one JS file per action.

### `npm run upload`
Uploads actions to an instance of the recipe server. You must build actions
before uploading them; the command uses the built code found in the `build`
directory.

You can specify which individual actions to upload by passing their names to the
command:

```sh
npm run upload -- action-name other-action-name
```

## License

Normandy actions are licensed under the MPLv2. See the `LICENSE` file for
details.
