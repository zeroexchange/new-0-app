import { createReducer } from '@reduxjs/toolkit'

import { setAprData, AprObjectProps, setStakingInfo} from './actions'

export interface PoolsState {
  aprData: AprObjectProps[]
  poolsData: any[]
}

const initialState: PoolsState = {
  aprData: [],
  poolsData: []
}

export default createReducer<PoolsState>(initialState, builder =>
  builder.addCase(setAprData, (state, { payload: { aprData } }) => {
    return {
      ...state,
      aprData
    }
  }).addCase(setStakingInfo, (state, { payload: { poolsData } }) => {
    return {
      ...state,
      poolsData
    }
  })
)