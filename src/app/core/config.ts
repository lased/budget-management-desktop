import * as path from 'path';
import { remote } from 'electron';

const local = remote.process.env.PORTABLE_EXECUTABLE_DIR || remote.app.getPath('documents');
const root = path.join(local, 'Budget');
const db = path.join(root, 'database.sqlite');
const model = path.join(root, 'model.json');

export const Config = { root, db, model };
