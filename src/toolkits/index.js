// Build topics: ES module imports/exports, registry arrays, and the toolkit
// object contract (id, name, description, color, icon, and tools).
// To add a new toolkit: create src/toolkits/<name>.jsx exporting a toolkit object, then add it to this list.
import {json} from './json'
import {developer} from './developer'
import {sql} from './sql'
import {csv} from './csv'
import {qr} from './qr'
import {markdown} from './markdown'

export const toolkits=[json,developer,sql,csv,qr,markdown]
