import { TooltipContent } from '@sushiswap/ui'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@sushiswap/ui'
import { PoolExtended } from 'lib/pool/hooks/use-pools-extended'
import React, { FC } from 'react'
import { CurrencyIcon } from 'ui/common/currency/currency-icon'
import { CurrencyIconList } from 'ui/common/currency/currency-icon-list'
import { useFarms, useIsFarm } from 'utils/hooks/useFarms'
import { Row } from './types'

export const PoolNameCell: FC<Row<PoolExtended>> = ({ row }) => {
  const { token0, token1 } = row
  const poolAddress = row?.id

  const { data: farms } = useFarms()
  const isFarm = useIsFarm({ poolAddress, farms })

  return (
    <div className="flex items-center gap-1">
      <div className="flex min-w-[54px]">
        {token0 && token1 && (
          <CurrencyIconList iconWidth={26} iconHeight={26}>
            <CurrencyIcon currency={token0} />
            <CurrencyIcon currency={token1} />
          </CurrencyIconList>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
          {token0?.symbol}{' '}
          <span className="font-normal text-gray-900 dark:text-slate-500">
            /
          </span>{' '}
          {token1?.symbol}{' '}
        </span>
        <div className="flex gap-1">
          {isFarm !== undefined && isFarm !== -1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="whitespace-nowrap bg-green/20 text-green text-[10px] px-2 rounded-full">
                    🧑‍🌾
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Farm rewards available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}
