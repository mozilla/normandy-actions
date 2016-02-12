import path from 'path';


/**
 * Build a path relative to the project root directory.
 */
export function localPath(...parts) {
    parts = [__dirname, '..'].concat(parts);
    return path.resolve(...parts);
}
