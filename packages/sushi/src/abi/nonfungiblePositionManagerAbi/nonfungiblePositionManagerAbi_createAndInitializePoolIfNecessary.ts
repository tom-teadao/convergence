export const nonfungiblePositionManagerAbi_createAndInitializePoolIfNecessary =
  [
    {
      inputs: [
        { internalType: 'address', name: 'token0', type: 'address' },
        { internalType: 'address', name: 'token1', type: 'address' },
        { internalType: 'uint24', name: 'fee', type: 'uint24' },
        { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      ],
      name: 'createAndInitializePoolIfNecessary',
      outputs: [{ internalType: 'address', name: 'pool', type: 'address' }],
      stateMutability: 'payable',
      type: 'function',
    },
  ] as const
