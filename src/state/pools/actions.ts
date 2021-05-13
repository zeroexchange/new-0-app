import { createAction } from '@reduxjs/toolkit'

export type AprObjectProps = {
  APY: number
  name: String
  chain: String
  contract_addr: String
}

export const setAprData = createAction<{ aprData: AprObjectProps[] }>('pools/setAprData') //apr data api 
export const setStakingInfo = createAction<{ poolsData: any[] }>('pools/setStakingInfo') // array with data
