import { useQuery } from '@tanstack/react-query'
import { SupportedNetwork, chains } from 'config/chains'
import { useEffect } from 'react'
import { usePoolActions, usePoolState } from '../components/Pool/PoolProvider'
import { baseTokens } from './baseTokens'
import { Token } from './tokenType'
import { useNetwork } from './useNetwork'
import { Pool } from './usePools'

export type Route = {
  route: string[]
  amountOut: number
  priceImpact: number
}

interface GetAllCommonPairs {
  amountIn?: number
  coinA: Token
  coinB: Token
  pairs: Pool[] | undefined
  network: SupportedNetwork
}

export async function getAllCommonPairs({
  amountIn = 0,
  coinA,
  coinB,
  pairs,
  network,
}: GetAllCommonPairs) {
  const {
    api: { fetchUrlPrefix },
    contracts: { swap: swapContract },
  } = chains[network]

  // all base pairs
  const basePairs = new Set([...baseTokens, coinA.address, coinB.address])

  pairs?.map((pair) => {
    basePairs.add(pair?.data?.token_x_details?.token_address)
    basePairs.add(pair?.data?.token_y_details?.token_address)
  })
  const pairArray = [...basePairs]

  const allPairs: [string, string][] = []

  for (let i = 0; i < pairArray.length; i++) {
    for (let j = i + 1; j < pairArray.length; j++) {
      allPairs.push([pairArray[i], pairArray[j]])
    }
  }

  const data: { data: any; type: string }[] | { error_code: any } = await fetch(
    `${fetchUrlPrefix}/v1/accounts/${swapContract}/resources`,
  ).then((res) => res.json())

  if ('error_code' in data) {
    throw new Error(`Failed to fetch swap resources: ${data?.error_code}`)
  }

  const reserve_tokens = new Map<string, any>()
  const reserve_token_info = new Map<string, any>()

  data.forEach((d) => {
    if (d.type.includes('TokenPairReserve')) {
      reserve_tokens.set(d.type, d)
    }
    if (d.type.includes('LPToken')) {
      reserve_token_info.set(d.type, d)
    }
  })

  const t = allPairs.reduce<Record<string, any>>((acc, [token0, token1]) => {
    if (
      reserve_tokens.has(
        `${swapContract}::swap::TokenPairReserve<${token0}, ${token1}>`,
      )
    ) {
      const info = {
        lpTokenInfo: reserve_token_info.get(
          `0x1::coin::CoinInfo<${swapContract}::swap::LPToken<${token0}, ${token1}>>`,
        ),
      }
      const data = reserve_tokens.get(
        `${swapContract}::swap::TokenPairReserve<${token0}, ${token1}>`,
      )

      acc[`${token0}|||${token1}`] = {
        pairs: `${token0}|||${token1}`,
        res_x: data.data.reserve_x,
        res_y: data.data.reserve_y,
        ...info,
        ...data,
      }
    }

    if (
      reserve_tokens.has(
        `${swapContract}::swap::TokenPairReserve<${token1}, ${token0}>`,
      )
    ) {
      const info = {
        lpTokenInfo: reserve_token_info.get(
          `0x1::coin::CoinInfo<${swapContract}::swap::LPToken<${token1}, ${token0}>>`,
        ),
      }
      const data = reserve_tokens.get(
        `${swapContract}::swap::TokenPairReserve<${token1}, ${token0}>`,
      )

      acc[`${token1}|||${token0}`] = {
        pairs: `${token0}|||${token1}`,
        res_x: data.data.reserve_x,
        res_y: data.data.reserve_y,
        ...info,
        ...data,
      }
    }

    return acc
  }, {})

  const graph = Object.values(t).reduce((data: any, coin: any) => {
    const coins_data = coin.pairs.split('|||')

    if (data[coins_data[0]]) {
      data[coins_data[0]].push(coins_data[1])
    } else {
      data[coins_data[0]] = [coins_data[1]]
    }

    if (data[coins_data[1]]) {
      data[coins_data[1]].push(coins_data[0])
    } else {
      data[coins_data[1]] = [coins_data[0]]
    }

    return data
  }, {})

  const returnRoutes = RouteDemo(amountIn, t, graph, coinA, coinB) as Route

  return returnRoutes as Route
}

export type TokenPairReserve = {
  type: string
  data: {
    block_timestamp_last: string
    reserve_x: string
    reserve_y: string
  }
}

export async function usePoolPairs() {
  const {
    api: { fetchUrlPrefix },
    contracts: { swap: swapContract },
  } = useNetwork()
  const { token0, token1, isTransactionPending } = usePoolState()

  const { setPoolReserves, setLoadingPrice, setPoolPairRatio } =
    usePoolActions()

  const { data, isLoading } = useQuery<{
    poolReserves: TokenPairReserve | null
    poolPairRatio: number
  }>({
    queryKey: ['poolPairs', swapContract, token0, token1, isTransactionPending],
    queryFn: async () => {
      const url = `${fetchUrlPrefix}/v1/accounts/${swapContract}/resources`

      const response = await fetch(url)

      if (response.status === 200) {
        let inverse = false

        const data = await response.json()
        const reserves: TokenPairReserve[] = data.filter(
          (d: TokenPairReserve) => {
            if (
              d.type ===
              `${swapContract}::swap::TokenPairReserve<${token0.address}, ${token1.address}>`
            ) {
              inverse = false
              return true
            } else if (
              d.type ===
              `${swapContract}::swap::TokenPairReserve<${token1.address}, ${token0.address}>`
            ) {
              inverse = true
              return true
            }
          },
        )

        if (reserves?.length) {
          if (inverse) {
            return {
              poolReserves: reserves[0],
              poolPairRatio:
                Number(reserves[0]?.data?.reserve_x) /
                Number(reserves[0]?.data?.reserve_y),
            }
          } else {
            return {
              poolReserves: reserves[0],
              poolPairRatio:
                Number(reserves[0]?.data?.reserve_y) /
                Number(reserves[0]?.data?.reserve_x),
            }
          }
        }
      }

      return {
        poolReserves: null,
        poolPairRatio: 0,
      }
    },
  })

  useEffect(() => {
    if (data) {
      setPoolReserves(data?.poolReserves)
      setPoolPairRatio(data?.poolPairRatio)
    }
  }, [data, setPoolReserves, setPoolPairRatio])

  useEffect(() => {
    setLoadingPrice(isLoading)
  }, [isLoading, setLoadingPrice])
}

export const exactOutput = (amt_in: number, res_x: number, res_y: number) => {
  const amt_with_fee = amountWithFee(amt_in)
  const amt_out = (amt_with_fee * res_y) / (res_x * 10000 + amt_with_fee)
  return amt_out
}

const amountWithFee = (amt_in: number) => {
  return amt_in * 9975
}

function findPossibleRoutes(
  tokenA: string,
  tokenB: string,
  graph: any,
  visited: any,
  currentRoute: any,
  routes: any,
) {
  // Mark the current token as visited
  visited[tokenA] = true

  // Add the current token to the current route
  currentRoute.push(tokenA)

  // If the current token is the desired tokenB, add the current route to the routes array
  if (tokenA === tokenB) {
    routes.push([...currentRoute])
  } else {
    // Iterate through the adjacent tokens of the current token
    if (graph[tokenA]) {
      for (const adjacentToken of graph[tokenA]) {
        // If the adjacent token is not visited, recursively find possible routes
        if (!visited[adjacentToken]) {
          findPossibleRoutes(
            adjacentToken,
            tokenB,
            graph,
            visited,
            currentRoute,
            routes,
          )
        }
      }
    }
  }

  // Remove the current token from the current route and mark it as unvisited
  currentRoute.pop()
  visited[tokenA] = false
}

function RouteDemo(
  firstInput: any,
  ARR: any,
  tokenGraph: any,
  coinA: any,
  coinB: any,
) {
  const visitedTokens = {}
  const currentTokenRoute: any[] = []
  const allRoutes: any[] = []

  findPossibleRoutes(
    coinA.address,
    coinB.address,
    tokenGraph,
    visitedTokens,
    currentTokenRoute,
    allRoutes,
  )

  // let firstInput = 100000000
  let lastOutput = 0
  const bestFinder = []
  for (const route of allRoutes) {
    const prices = []
    if (route.length < 6) {
      if (
        ARR[`${route[0]}|||${route[1]}`] ||
        ARR[`${route[1]}|||${route[0]}`]
      ) {
        const res_x =
          ARR[`${route[0]}|||${route[1]}`]?.res_x ||
          ARR[`${route[1]}|||${route[0]}`]?.res_y
        const res_y =
          ARR[`${route[0]}|||${route[1]}`]?.res_y ||
          ARR[`${route[1]}|||${route[0]}`]?.res_x
        lastOutput = exactOutput(firstInput, res_x, res_y)
        prices.push(res_y / res_x)

        if (
          ARR[`${route[1]}|||${route[2]}`] ||
          ARR[`${route[2]}|||${route[1]}`]
        ) {
          const res_x =
            ARR[`${route[1]}|||${route[2]}`]?.res_x ||
            ARR[`${route[2]}|||${route[1]}`]?.res_y
          const res_y =
            ARR[`${route[1]}|||${route[2]}`]?.res_y ||
            ARR[`${route[2]}|||${route[1]}`]?.res_x
          lastOutput = exactOutput(lastOutput, res_x, res_y)
          prices.push(res_y / res_x)

          if (
            ARR[`${route[2]}|||${route[3]}`] ||
            ARR[`${route[3]}|||${route[2]}`]
          ) {
            const res_x =
              ARR[`${route[2]}|||${route[3]}`]?.res_x ||
              ARR[`${route[3]}|||${route[2]}`]?.res_y
            const res_y =
              ARR[`${route[2]}|||${route[3]}`]?.res_y ||
              ARR[`${route[3]}|||${route[2]}`]?.res_x
            lastOutput = exactOutput(lastOutput, res_x, res_y)
            prices.push(res_y / res_x)

            if (
              ARR[`${route[3]}|||${route[4]}`] ||
              ARR[`${route[4]}|||${route[3]}`]
            ) {
              const res_x =
                ARR[`${route[3]}|||${route[4]}`]?.res_x ||
                ARR[`${route[4]}|||${route[3]}`]?.res_y
              const res_y =
                ARR[`${route[3]}|||${route[4]}`]?.res_y ||
                ARR[`${route[4]}|||${route[3]}`]?.res_x
              lastOutput = exactOutput(lastOutput, res_x, res_y)
              prices.push(res_y / res_x)
            }
          }
        }
      }
      const midPrice = prices
        .slice(1)
        .reduce(
          (accumulator, currentValue) => accumulator * currentValue,
          prices[0],
        )
      const priceImpact = computePriceImpact(midPrice, firstInput, lastOutput)

      bestFinder.push({
        route: route,
        amountOut: lastOutput,
        priceImpact: priceImpact.toFixed(2),
      })
    }
  }
  const bestRoutePrice = bestFinder.length
    ? bestFinder.reduce((r: any, b: any) => (r.amountOut > b.amountOut ? r : b))
    : {}
  return bestRoutePrice
}

function computePriceImpact(
  midPrice: number,
  amountIn: number,
  amountOut: number,
) {
  const quotedOutputAmount = amountIn * midPrice
  const priceImpact =
    ((quotedOutputAmount - amountOut) / quotedOutputAmount) * 100
  return priceImpact
}

export const formatNumber = (number: number, decimals: number) => {
  if (number === 0) return '0'
  let _number = (number / 10 ** decimals).toFixed(decimals)
  if (_number) {
    if (_number.includes('.') && _number.split('.')[1].length > 8) {
      _number = Number(_number).toFixed(8)
    }
    if (_number.includes('.') && parseFloat(_number.split('.')[0]) > 0) {
      _number = Number(_number).toFixed(4)
    }
  } else {
    _number = '0'
  }
  if (Number(_number) < 0.000000001) {
    return '0'
  }
  return _number
}
