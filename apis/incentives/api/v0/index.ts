import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

import { getIncentives, getIncentivesByPoolIds } from '../../lib/api'

const schema = z.object({
  pools: z
    .string()
    .optional()
    .transform((pools) => pools?.split(',')),
})

const handler = async (request: VercelRequest, response: VercelResponse) => {
  const result = schema.safeParse(request.query)
  if (!result.success) {
    return response.status(400).json(result.error.format())
  }

  let incentives

  if (result.data.pools) {
    incentives = await getIncentivesByPoolIds(result.data.pools)
  } else {
    incentives = await getIncentives()
  }

  return response.status(200).json(incentives)
}

export default handler
