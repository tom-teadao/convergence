import './wagmi.js'

import { BigNumber } from '@ethersproject/bignumber'
import { balanceOfAbi, getReservesAbi, getStableReservesAbi } from '@sushiswap/abi'
import { Token } from '@sushiswap/database'
import { Address, readContracts } from '@wagmi/core'

export interface PoolWithReserves {
  id: string
  reserve0: BigNumber
  reserve1: BigNumber
}

export async function getConstantProductPoolReserves(poolIds: string[], blockNumber: number) {
  const startTime = performance.now()
  const updatedPools: Map<string, PoolWithReserves> = new Map()

  const contracts = poolIds.map(
    (id) =>
      ({
        allowFailure: true,
        address: id.split(':')[1] as Address,
        chainId: Number(id.split(':')[0]),
        abi: getReservesAbi,
        functionName: 'getReserves',
        blockNumber,
      } as const)
  )

  let failures = 0

  const batchSize = contracts.length > 250 ? 250 : contracts.length
  const batches: Promise<
    (readonly [BigNumber, BigNumber, number] & {
      _reserve0: BigNumber
      _reserve1: BigNumber
      _blockTimestampLast: number
    })[]
  >[] = []

  for (let i = 0; i < contracts.length; i += batchSize) {
    const contractBatch = readContracts({
      contracts: contracts.slice(i, i + batchSize),
    })
    batches.push(contractBatch)
  }
  const allReserves = await Promise.all(batches).then((res) => res.flat())

  poolIds.forEach((id, i) => {
    const res = allReserves[i]
    if (res) {
      const reserve0 = res[0]
      const reserve1 = res[1]
      updatedPools.set(id, {
        id,
        reserve0,
        reserve1,
      })
    } else {
      failures++
    }
  })
  const success = poolIds.length - failures
  const endTime = performance.now()
  console.log(
    `Fetched ${success}/${poolIds.length} constant product reserves (${((endTime - startTime) / 1000).toFixed(1)}s). `
  )

  return updatedPools
}

export async function getStablePoolReserves(poolIds: string[], blockNumber: number) {
  const startTime = performance.now()
  const updatedPools: Map<string, PoolWithReserves> = new Map()
  const reserves = await readContracts({
    contracts: poolIds.map((id) => ({
      allowFailure: true,
      address: id.split(':')[1] as Address,
      chainId: Number(id.split(':')[0]),
      abi: getStableReservesAbi,
      functionName: 'getReserves',
      blockNumber,
    })),
  })
  let failures = 0

  poolIds.forEach((id, i) => {
    const res = reserves[i]
    if (res) {
      const reserve0 = res[0]
      const reserve1 = res[1]
      updatedPools.set(id, {
        id,
        reserve0,
        reserve1,
      })
    } else {
      failures++
    }
  })
  const success = poolIds.length - failures

  const endTime = performance.now()
  console.log(`Fetched ${success}/${poolIds.length} stable reserves (${((endTime - startTime) / 1000).toFixed(1)}s). `)

  return updatedPools
}

export async function getConcentratedLiquidityPoolReserves(
  pools: {
    id: string
    address: string
    chainId: number
    token0: Token
    token1: Token
  }[],
  blockNumber: number
) {
  const startTime = performance.now()
  const updatedPools: Map<string, PoolWithReserves> = new Map()

  const balanceContracts = pools.map((p) =>
    [
      {
        args: [p.address as Address],
        address: p.token0.address as Address,
        chainId: p.chainId,
        abi: balanceOfAbi,
        functionName: 'balanceOf',
        blockNumber,
      } as const,
      {
        args: [p.address as Address],
        address: p.token1.address as Address,
        chainId: p.chainId,
        abi: balanceOfAbi,
        functionName: 'balanceOf',
        blockNumber,
      } as const,
    ].flat()
  )
  let failures = 0

  const balances = await readContracts({
    allowFailure: true,
    contracts: balanceContracts.flat(),
  })

  pools.forEach((pool, i) => {
    const balance0 = balances[i * 2]
    const balance1 = balances[i * 2 + 1]
    if (balances) {
      const reserve0 = balance0
      const reserve1 = balance1
      updatedPools.set(pool.id, {
        id: pool.id,
        reserve0,
        reserve1,
      })
    } else {
      failures++
    }
  })

  const success = pools.length - failures
  const endTime = performance.now()
  console.log(`Fetched ${success}/${pools.length} cl balances (${((endTime - startTime) / 1000).toFixed(1)}s). `)

  return updatedPools
}
