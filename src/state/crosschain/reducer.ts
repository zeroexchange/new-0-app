import {
  ChainTransferState,
  CrosschainChain,
  CrosschainToken,
  PendingTransfer,
  ProposalStatus,
  SwapDetails,
  setAvailableChains,
  setAvailableTokens,
  setCrosschainDepositConfirmed,
  setCrosschainLastTimeSwitched,
  setCrosschainFee,
  setCrosschainRecipient,
  setCrosschainSwapDetails,
  setCrosschainTransferStatus,
  setCurrentChain,
  setCurrentToken,
  setCurrentTokenBalance,
  setCurrentTxID,
  setPendingTransfer,
  setTargetChain,
  setTargetTokens,
  setTransferAmount,
  setNewPairLuiqidity,
  setImportToken,
  setImportPoolsPage
} from './actions'

import { createReducer } from '@reduxjs/toolkit'

export interface Token {
  name: string
  address: string
  chainId: any
  symbol: string
  decimals: number
}
export interface PoolLiquidityToken {
  balanceOf: string
  totalPercent: number
  firstTokenPart: number,
  secondTokenPart: number,
  firstToken: Token,
  secondToken: Token,
  contractAddress: string
}


export const initTokenObject = {
  name: '',
  address: '',
  chainId: '',
  symbol: '',
  decimals: 18
}


export interface CrosschainState {
  readonly currentRecipient: string
  readonly currentTxID: string
  readonly availableChains: Array<CrosschainChain>
  readonly availableTokens: Array<CrosschainToken>
  readonly currentChain: CrosschainChain
  readonly targetChain: CrosschainChain
  readonly targetTokens: Array<CrosschainToken>
  readonly currentToken: CrosschainToken
  readonly currentBalance: string
  readonly transferAmount: string
  readonly crosschainFee: string
  readonly crosschainTransferStatus: ChainTransferState
  readonly swapDetails: SwapDetails
  readonly depositConfirmed: boolean
  readonly pendingTransfer: PendingTransfer
  readonly lastTimeSwitched: number
  readonly poolsTokens: Array<PoolLiquidityToken>
  readonly token0: Token
  readonly token1: Token
  readonly firstToken: Token
  readonly secondToken: Token
  readonly isImportPoolsPage: boolean
}


export const initialState: CrosschainState = {
  poolsTokens: [],
  token0: initTokenObject,
  token1: initTokenObject,
  firstToken: initTokenObject,
  secondToken: initTokenObject,
  isImportPoolsPage: false,
  currentRecipient: '',
  currentTxID: '',
  availableChains: new Array<CrosschainChain>(),
  availableTokens: new Array<CrosschainToken>(),
  targetTokens: new Array<CrosschainToken>(),
  currentChain: {
    name: '',
    chainID: ''
  },
  targetChain: {
    name: '',
    chainID: ''
  },
  currentToken: {
    name: '',
    address: '',
    assetBase: '',
    symbol: '',
    decimals: 18
  },
  currentBalance: '',
  transferAmount: '',
  crosschainFee: '',
  crosschainTransferStatus: ChainTransferState.NotStarted,
  swapDetails: {
    status: ProposalStatus.INACTIVE,
    voteCount: 0
  },
  depositConfirmed: false,
  pendingTransfer: {},
  lastTimeSwitched: ~~(Date.now() / 1000),
}

export default createReducer<CrosschainState>(initialState, builder =>
  builder
    .addCase(setCrosschainRecipient, (state, { payload: { address } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        currentRecipient: address
      }
    })
    .addCase(setPendingTransfer, (state, { payload: { pendingTransfer } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        pendingTransfer
      }
    })
    .addCase(setCurrentTxID, (state, { payload: { txID } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        currentTxID: txID
      }
    })
    .addCase(setAvailableChains, (state, { payload: { chains } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        availableChains: chains
      }
    })
    .addCase(setAvailableTokens, (state, { payload: { tokens } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        availableTokens: tokens
      }
    })
    .addCase(setTargetTokens, (state, { payload: { targetTokens } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        targetTokens
      }
    })
    .addCase(setCurrentChain, (state, { payload: { chain } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        currentChain: chain
      }
    })
    .addCase(setTargetChain, (state, { payload: { chain } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        targetChain: chain
      }
    })
    .addCase(setCurrentToken, (state, { payload: { token } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        currentToken: token
      }
    })
    .addCase(setCurrentTokenBalance, (state, { payload: { balance } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        currentBalance: balance
      }
    })
    .addCase(setTransferAmount, (state, { payload: { amount } }) => {
      const currentState = { ...initialState, ...state }
      console.log(`For cross chain, transfer amount will be ${amount}`)
      return {
        ...currentState,
        transferAmount: amount
      }
    })
    .addCase(setCrosschainFee, (state, { payload: { value } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        crosschainFee: value
      }
    })
    .addCase(setCrosschainTransferStatus, (state, { payload: { status } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        crosschainTransferStatus: status
      }
    })
    .addCase(setCrosschainSwapDetails, (state, { payload: { details } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        swapDetails: details
      }
    })
    .addCase(setCrosschainDepositConfirmed, (state, { payload: { confirmed } }) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        depositConfirmed: confirmed
      }
    })
    .addCase(setCrosschainLastTimeSwitched, (state, {}) => {
      const currentState = { ...initialState, ...state }
      return {
        ...currentState,
        lastTimeSwitched: ~~(Date.now() / 1000) + 5
      }
    }).addCase(setNewPairLuiqidity, (state, { payload: { pairLiquidity } }) => {
      return {
        ...state,
        poolsTokens: [...state.poolsTokens, pairLiquidity]
      }
    }).addCase(setImportToken, (state, { payload: { currentToken, token } }) => {
      return {
        ...state,
        [currentToken]: token
      }
    }).addCase(setImportPoolsPage, (state, { payload: { isImportPoolsPage } }) => {
      return {
        ...state,
        isImportPoolsPage: isImportPoolsPage
      }
    })
)
