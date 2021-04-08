// import { ChainId, Token } from '@zeroexchange/sdk';

export type TokenConfig = {
  chainId?: string
  address: string
  decimals: number
  name?: string
  symbol?: string
  imageUri?: string
  resourceId: string
  isNativeWrappedToken?: boolean
  assetBase: string
}

export type BridgeConfig = {
  chainId: number
  networkId: number
  name: string
  bridgeAddress: string
  erc20HandlerAddress: string
  rpcUrl: string
  gasLimit?: number
  type: 'Ethereum' | 'Substrate'
  tokens: TokenConfig[]
  nativeTokenSymbol: string
  //This should be the full path to display a tx hash, without the trailing slash, ie. https://etherscan.io/tx
  blockExplorer?: string
  defaultGasPrice?: number
}

export type ChainbridgeConfig = {
  chains: BridgeConfig[]
}

export const crosschainConfig: ChainbridgeConfig = {
  chains: [
    {
      chainId: 1,
      networkId: 4,
      name: 'Rinkeby',
      bridgeAddress: '0xC113367F7b35E695C8570d768E7F67b48b2E135D',
      erc20HandlerAddress: '0x083D9DacEb094e2b6C018AEbF58BB7c4D01E17db',
      rpcUrl: 'https://rinkeby.infura.io/v3/45174a29359d4b07ade01676259bc47a',
      type: 'Ethereum',
      blockExplorer: 'https://rinkeby.etherscan.io',
      nativeTokenSymbol: 'ETH',
      tokens: [
        {
          address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
          name: 'WETH',
          symbol: 'WETH',
          assetBase: 'ETH',
          decimals: 18,
          resourceId: '0x0000000000000000000000c778417e063141139fce010982780140aa0cd5ab01'
        },
        {
          address: '0xc66227E44bf1E6F043919A65707b826e3E9f1132',
          name: 'USDT',
          symbol: 'USDT',
          assetBase: 'USDT',
          decimals: 6,
          resourceId: '0x0000000000000000000000c66227E44bf1E6F043919A65707b826e3E9f113201'
        },
        {
          address: '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926',
          name: 'USDC',
          symbol: 'USDC',
          assetBase: 'USDC',
          decimals: 6,
          resourceId: '0x0000000000000000000000eb8f08a975ab53e34d8a0330e0d34de942c9592601'
        },
        {
          address: '0x9EfCe00Be4E0c2D9aEF18aACe4e273D9ebcf574a',
          name: 'ZERO',
          symbol: 'ZERO',
          assetBase: 'ZERO',
          decimals: 18,
          resourceId: '0x00000000000000000000009efce00be4e0c2d9aef18aace4e273d9ebcf574a01'
        }
      ]
    },
    {
      chainId: 2,
      networkId: 43113,
      name: 'Avalanche',
      bridgeAddress: '0xD73CFAACEfe4812d350d38f634fA61eC3aFdFEbA',
      erc20HandlerAddress: '0xff7c781E1ed2A67a790Be70536299c7DFE4D5f33',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      type: 'Ethereum',
      blockExplorer: 'https://cchain.explorer.avax-test.network',
      nativeTokenSymbol: 'AVAX',
      defaultGasPrice: 470,
      tokens: [
        {
          address: '0x3BaDD0399e9c1DFAd16dddb42D6759afE0e3e6f2',
          name: 'zETH',
          symbol: 'zETH',
          assetBase: 'zETH',
          decimals: 18,
          resourceId: '0x00000000000000000000003BaDD0399e9c1DFAd16dddb42D6759afE0e3e6f202'
        },
        {
          address: '0x63cF3afFD720F23c55cD652Ba2242EfE1bccFBfC',
          name: 'zUSDT',
          symbol: 'zUSDT',
          assetBase: 'USDT',
          decimals: 6,
          resourceId: '0x000000000000000000000063cF3afFD720F23c55cD652Ba2242EfE1bccFBfC02'
        },
        {
          address: '0xA14Af06dEc505ca794635f827a24B976a434d427',
          name: 'zUSDC',
          symbol: 'zUSDC',
          assetBase: 'USDC',
          decimals: 6,
          resourceId: '0x0000000000000000000000A14Af06dEc505ca794635f827a24B976a434d42702'
        },
        {
          address: '0x5C2E43c99318F60Acc6503f40d734B64dA7106cc',
          name: 'ZERO',
          symbol: 'ZERO',
          assetBase: 'ZERO',
          decimals: 18,
          resourceId: '0x00000000000000000000005C2E43c99318F60Acc6503f40d734B64dA7106cc02'
        }
      ]
    },
    {
      chainId: 3,
      networkId: 97,
      name: 'Smart Chain',
      bridgeAddress: '0xD73CFAACEfe4812d350d38f634fA61eC3aFdFEbA',
      erc20HandlerAddress: '0xff7c781E1ed2A67a790Be70536299c7DFE4D5f33',
      rpcUrl: 'https://data-seed-prebsc-1-s2.binance.org:8545',
      type: 'Ethereum',
      gasLimit: 6721975,
      defaultGasPrice: 12.5,
      blockExplorer: 'https://testnet.bscscan.com',
      nativeTokenSymbol: 'BNB',
      tokens: [
        {
          address: '0x7239C57c6E24C2d5cBdf6ca186d46ef33967539e',
          name: 'zETH',
          symbol: 'zETH',
          assetBase: 'zETH',
          decimals: 18,
          resourceId: '0x00000000000000000000007239C57c6E24C2d5cBdf6ca186d46ef33967539e03'
        },
        {
          address: '0xe874dCF01d498DDe836d1F6B7f1Fe125217e4eaf',
          name: 'zUSDT',
          symbol: 'zUSDT',
          assetBase: 'USDT',
          decimals: 6,
          resourceId: '0x0000000000000000000000e874dCF01d498DDe836d1F6B7f1Fe125217e4eaf03'
        },
        {
          address: '0xB366412128A00620B42825312564307Db2d5Cc45',
          name: 'zUSDC',
          symbol: 'zUSDC',
          assetBase: 'USDC',
          decimals: 6,
          resourceId: '0x0000000000000000000000B366412128A00620B42825312564307Db2d5Cc4503'
        },
        {
          address: '0x9BBba9D5be49c777A1c9cDF4ED7965A27CaBb7F2',
          name: 'ZERO',
          symbol: 'ZERO',
          assetBase: 'ZERO',
          decimals: 18,
          resourceId: '0x00000000000000000000009BBba9D5be49c777A1c9cDF4ED7965A27CaBb7F203'
        }
      ]
    },
    {
      chainId: 4,
      networkId: 1287,
      name: 'Moonbeam',
      bridgeAddress: '0xD73CFAACEfe4812d350d38f634fA61eC3aFdFEbA',
      erc20HandlerAddress: '0xff7c781E1ed2A67a790Be70536299c7DFE4D5f33',
      rpcUrl: 'https://rpc.testnet.moonbeam.network',
      type: 'Ethereum',
      gasLimit: 6721975,
      defaultGasPrice: 12.5,
      blockExplorer: 'https://moonbeam-explorer.netlify.app/',
      nativeTokenSymbol: 'DEV',
      tokens: [
        {
          address: '0x036D90f25DbfC55534C8cBD659bBd891D15121E7',
          name: 'zETH',
          symbol: 'zETH',
          assetBase: 'zETH',
          decimals: 18,
          resourceId: '0x0000000000000000000000036D90f25DbfC55534C8cBD659bBd891D15121E704'
        },
        {
          address: '0x90Cef7CfE4C88b3bd6d8bE52c2Ebce04210820Ac',
          name: 'zUSDT',
          symbol: 'zUSDT',
          assetBase: 'USDT',
          decimals: 6,
          resourceId: '0x000000000000000000000090Cef7CfE4C88b3bd6d8bE52c2Ebce04210820Ac04'
        },
        {
          address: '0xA14Af06dEc505ca794635f827a24B976a434d427',
          name: 'zUSDC',
          symbol: 'zUSDC',
          assetBase: 'USDC',
          decimals: 6,
          resourceId: '0x0000000000000000000000A14Af06dEc505ca794635f827a24B976a434d42704'
        },
        {
          address: '0x201BBbc21F3A461c775f5A8A59beD69769355dC8',
          name: 'ZERO',
          symbol: 'ZERO',
          assetBase: 'ZERO',
          decimals: 18,
          resourceId: '0x0000000000000000000000201BBbc21F3A461c775f5A8A59beD69769355dC804'
        }
      ]
    }
  ]
}
