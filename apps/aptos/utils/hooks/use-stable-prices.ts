import { Aptos, STABLECOINS } from 'lib/coins'
import { useMemo } from 'react'
import getCurrencyPrice from '../getCurrencyPrice'
import { Token } from '../tokenType'
import { usePoolsByTokens } from './use-pools-by-tokens'
import { useNetwork } from './useNetwork'

interface UseStablePrices {
  currencies: Token[] | undefined
  ledgerVersion?: number
}
export function useStablePrices({
  currencies,
  ledgerVersion,
}: UseStablePrices) {
  const { network, default_stable } = useNetwork()

  const native = useMemo(() => Aptos[network], [network])
  const stableTokens = useMemo(() => STABLECOINS[network], [network])

  const { tokenPairs, nativePairsEndIndex } = useMemo(() => {
    if (!currencies) return {}

    const stableNativePair = [native, default_stable] as const

    const nativePairs = currencies
      .map((currency) => {
        if (currency.address === native.address) {
          return undefined
        }
        return [native, currency] as const
      })
      .filter((pair) => pair !== undefined) as [Token, Token][]

    const stablePairs = currencies.flatMap((currency) => {
      return stableTokens
        .map((stableToken) => {
          if (currency.address === stableToken.address) {
            return undefined
          }
          return [currency, stableToken] as const
        })
        .filter((pair) => pair !== undefined) as [Token, Token][]
    })

    return {
      tokenPairs: [stableNativePair, ...nativePairs, ...stablePairs] as [
        Token,
        Token,
      ][],
      nativePairsEndIndex: 1 + nativePairs.length,
    }
  }, [currencies, native, default_stable, stableTokens])

  const tokens = useMemo(() => tokenPairs || [], [tokenPairs])

  const pairsInfo = usePoolsByTokens({
    tokens,
    ledgerVersion,
  })

  const prices = useMemo(() => {
    if (!currencies || !tokenPairs) return undefined

    const stableNativePairInfo = pairsInfo[0]

    const prices = currencies.map((currency) => {
      const nativePairInfo = pairsInfo.find((pairInfo, i) => {
        if (i === 0) return false
        if (i > nativePairsEndIndex) return false

        const token0 = pairInfo[1]?.token0
        const token1 = pairInfo[1]?.token1

        if (!token0 || !token1) return false

        return (
          token0.address === currency.address ||
          token1.address === currency.address
        )
      })

      const stablePairsInfo = pairsInfo.filter((pairInfo, index) => {
        if (index <= nativePairsEndIndex) return false

        const token0 = pairInfo[1]?.token0
        const token1 = pairInfo[1]?.token1

        if (!token0 || !token1) return false

        return (
          token0.address === currency.address ||
          token1.address === currency.address
        )
      })

      return getCurrencyPrice(
        currency,
        default_stable,
        native,
        stableTokens,
        nativePairInfo,
        stableNativePairInfo,
        stablePairsInfo,
      )
    })

    return prices.reduce(
      (acc, price, index) => {
        acc[currencies[index]!.address] = price || 0
        return acc
      },
      {} as Record<string, number>,
    )
  }, [currencies, tokenPairs, pairsInfo, default_stable, native, stableTokens])

  return prices
}
