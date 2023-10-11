'use client'

import { PlusIcon } from '@heroicons/react-v1/solid'
import { SteerVault } from '@sushiswap/client/src/pure/steer-vault/vault'
import { STEER_PERIPHERY_ADDRESS, SteerChainId } from '@sushiswap/steer-sdk'
import { Button, DialogTrigger, classNames } from '@sushiswap/ui'
import { Checker } from '@sushiswap/wagmi/future'
import { Web3Input } from '@sushiswap/wagmi/future/components/Web3Input'
import { Field } from 'lib/constants'
import React, { FC, useMemo } from 'react'
import { ChainId } from 'sushi/chain'

import {
  useSteerPositionAddActions,
  useSteerPositionAddDerivedInfo,
  useSteerPositionAddState,
} from './SteerPositionAddProvider'
import { SteerPositionAddReviewModal } from './SteerPositionAddReviewModal'

interface SteerPositionAddProps {
  vault: SteerVault
}

export const SteerPositionAdd: FC<SteerPositionAddProps> = ({ vault }) => {
  const {
    currencies,
    independentField,
    dependentField,
    parsedAmounts,
    isLoading,
  } = useSteerPositionAddDerivedInfo({
    vault,
  })
  const { onFieldAInput, onFieldBInput } = useSteerPositionAddActions()
  const { typedValue } = useSteerPositionAddState()

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts?.[dependentField].toSignificant(6) ?? '',
  }

  const amounts = useMemo(() => {
    if (!parsedAmounts) return undefined
    return Object.values(parsedAmounts)
  }, [parsedAmounts])

  return (
    <div
      className={classNames(
        isLoading ? 'opacity-40 pointer-events-none' : '',
        'flex flex-col gap-4',
      )}
    >
      <div className="relative">
        <Web3Input.Currency
          id="add-liquidity-token0"
          type="INPUT"
          className="p-3 bg-white dark:bg-secondary rounded-xl border border-accent"
          chainId={vault.chainId as ChainId}
          value={formattedAmounts[Field.CURRENCY_A]}
          onChange={onFieldAInput}
          currency={currencies?.CURRENCY_A}
          loading={isLoading}
        />
      </div>
      <div className="flex items-center justify-center mt-[-24px] mb-[-24px] z-10">
        <div className="p-1 bg-white dark:bg-slate-900 border border-accent rounded-full">
          <PlusIcon width={16} height={16} className="text-muted-foreground" />
        </div>
      </div>
      <div className="relative">
        <Web3Input.Currency
          id="add-liquidity-token1"
          type="INPUT"
          className="p-3 bg-white dark:bg-secondary rounded-xl border border-accent"
          chainId={vault.chainId as ChainId}
          value={formattedAmounts[Field.CURRENCY_B]}
          onChange={onFieldBInput}
          currency={currencies?.CURRENCY_B}
          loading={isLoading}
        />
      </div>

      <Checker.Connect fullWidth>
        <Checker.Network fullWidth chainId={vault.chainId}>
          <Checker.Amounts
            fullWidth
            chainId={vault.chainId as ChainId}
            amounts={amounts}
          >
            <Checker.ApproveERC20
              fullWidth
              id="approve-erc20-0"
              amount={parsedAmounts?.[Field.CURRENCY_A]}
              contract={STEER_PERIPHERY_ADDRESS[vault.chainId as SteerChainId]}
              enabled={!!parsedAmounts?.[Field.CURRENCY_A]}
            >
              <Checker.ApproveERC20
                fullWidth
                id="approve-erc20-1"
                amount={parsedAmounts?.[Field.CURRENCY_B]}
                contract={
                  STEER_PERIPHERY_ADDRESS[vault.chainId as SteerChainId]
                }
                enabled={!!parsedAmounts?.[Field.CURRENCY_B]}
              >
                <SteerPositionAddReviewModal
                  vault={vault}
                  onSuccess={() => {
                    onFieldAInput('')
                    onFieldBInput('')
                  }}
                  // successLink={successLink}
                >
                  <DialogTrigger asChild>
                    <Button
                      fullWidth
                      size="xl"
                      testId="add-steer-liquidity-preview"
                    >
                      Preview
                    </Button>
                  </DialogTrigger>
                </SteerPositionAddReviewModal>
              </Checker.ApproveERC20>
            </Checker.ApproveERC20>
          </Checker.Amounts>
        </Checker.Network>
      </Checker.Connect>
    </div>
  )
}
