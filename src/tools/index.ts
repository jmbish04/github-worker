/**
 * @file src/tools/index.ts
 * @description This file exports all the tool routes.
 * @owner AI-Builder
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import files from './files'
import prs from './prs'
import issues from './issues'
import { Bindings } from '../utils/hono'

const toolsApi = new OpenAPIHono<{ Bindings: Bindings }>()

toolsApi.route('/', files)
toolsApi.route('/', prs)
toolsApi.route('/', issues)

export default toolsApi

/**
 * @extension_point
 * This is a good place to add new tool routes.
 * Just import the new tool and add a new `route` call.
 */
