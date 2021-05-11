import { createReducer } from '@reduxjs/toolkit'

import { setAprAdata, AprObjectProps } from './actions'

export interface PoolsState {
  readonly aprData: AprObjectProps[]
}

const initialState: PoolsState = {
  aprData: []
}

export default createReducer<PoolsState>(initialState, builder =>
  builder.addCase(setAprAdata, (state, { payload: { aprData } }) => {
    return {
      ...state,
      aprData
    }
  })
)
