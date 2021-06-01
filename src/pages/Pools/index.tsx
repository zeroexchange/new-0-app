import { BigNumber, ethers, utils } from 'ethers'
import {
  AprObjectProps,
  setAprData,
  setPoolsData,
  setStackingInfo,
  setToggle,
  setPoolEarnings
} from './../../state/pools/actions'
import { CustomLightSpinner, StyledInternalLink, TYPE, Title } from '../../theme'
import React, { useEffect, useState, useCallback } from 'react'
import { STAKING_REWARDS_INFO, useStakingInfo } from '../../state/stake/hooks'
import { filterPoolsItems, searchItems, setOptions } from 'utils/sortPoolsPage'
import styled, { keyframes } from 'styled-components'
import { ArrowDown as Arrow } from '../../components/Arrows'
import QuestionHelper from '../../components/QuestionHelper'
import { AppDispatch } from '../../state'
import { ButtonOutlined } from '../../components/Button'
import Circle from '../../assets/images/blue-loader.svg'
import ClaimRewardModal from '../../components/pools/ClaimRewardModal'
import DropdownArrow from './../../assets/svg/DropdownArrow'
import { NoWalletConnected } from '../../components/NoWalletConnected'
import PageContainer from './../../components/PageContainer'
import PoolCard from '../../components/pools/PoolCard'
import PoolControls from '../../components/pools/PoolControls'
import PoolRow from '../../components/pools/PoolRow'
import ZeroIcon from '../../assets/svg/zero_icon.svg'
import { getAllPoolsAPY } from 'api'
import { useActiveWeb3React } from '../../hooks'
import { useDispatch } from 'react-redux'
import { usePoolsState } from './../../state/pools/hooks'
import { useWalletModalToggle } from '../../state/application/hooks'

import { CurrencySelect } from 'components/CurrencyInputPanel'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import {
  GetTokenByAddrAndChainId,
  useCrossChain,
  useCrosschainHooks,
  useCrosschainState
} from '../../state/crosschain/hooks'
import { setNewPairLuiqidity, setImportToken, setImportPoolsPage } from '../../state/crosschain/actions'
import CurrencyLogo from 'components/CurrencyLogo'
import { ButtonPrimary } from 'components/Button'
import { Token, Pair } from '@zeroexchange/sdk'
import { usePairContract, useStakingContract } from '../../hooks/useContract'
import { Contract } from '@ethersproject/contracts'
import { isAddress } from '../../utils'
import CustomLiquidityCard from 'components/pools/CustomLiquidityCard'
import { RowBetween } from 'components/Row'

const numeral = require('numeral')



const PageWrapper = styled.div`
  flex-direction: column;
  display: flex;
  width: 100%;
  flex-grow: 1;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding:0px;
`};
`

export const Wrapper = styled.div`
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-bottom: 1rem;
  padding: 30px 0;
  width: 100%;
  overflow: hidden;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  border-radius: 16px;
  padding: 16px 16px;
`};
`
const PoolsTable = styled.table`
  border-collapse: collapse;
  border-spacing: 0px;
  tr {
    vertical-align: middle;
    &:last-of-type {
      border-bottom-width: 0px;
    }
  }
  td[colspan='6'] {
    width: 100%;
  }
`

const HeaderCell = styled.th<{ mobile?: boolean }>`
  :last-child {
    width: 45px;
  }
  ${({ theme, mobile = true }) =>
    !mobile &&
    theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const EmptyData = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: 64px;
`
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const opacity = keyframes`
  from {
    opacity:.8;
  }
  50%  {  opacity: 0.3;}
  to {
    opacity: .8;
  }
`

const TextLink = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #6752f7;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &.pink {
    color: #b368fc;
  }
  &:hover {
    opacity: 0.9;
  }
`

// Here we create a component that will rotate everything we pass in over two seconds
const Spinner = styled.img`
  width: 100px;
  height: auto;
  display: inline-block;
  animation: ${rotate} 2s linear infinite, ${opacity} 1.5s linear infinite;

  padding: 2rem 1rem;
  font-size: 1.2rem;
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  column-gap: 28px;
`

const StatsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 24px;
  margin-bottom: 1.5rem;
  .add-liquidity-link {
    width: 160px;
    margin-left: auto;
    text-decoration: none;
  }
  .remove-liquidity-link {
    text-decoration: none;
    margin-left: 2rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  align-items: flex-start;
  .add-liquidity-link {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 500px;
  }
  .remove-liquidity-link {
    margin-left: auto;
    margin-right: auto;
    margin-top: 2rem;
  }
`};
`
const Stat = styled.div`
  display: flex;
  flex-grow: 0;
  flex-direction: column;
  &.harvest {
    margin-left: 2rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  &.harvest {
    margin-top: 1rem;
    margin-bottom: 1rem;
    margin-left: 0;
  }
`};
`

const StatLabel = styled.h5`
  font-weight: bold;
  color: #fff;
  font-size: 1rem;
  span {
    opacity: 0.75;
    font-weight: normal;
  }
`

const StatValue = styled.h6`
  font-weight: bold;
  color: #fff;
  font-size: 1.75rem;
  margin-top: 10px;
  margin-bottom: 0;
  span {
    opacity: 0.75;
    font-weight: normal;
    font-size: 1.25rem;
  }
`
const DropDownWrap = styled.span`
  cursor: pointer;
  position: absolute;
  right: -20px;
  top: '1px';

  svg {
    width: 10px;
    g {
      fill: rgba(179, 104, 252, 1);
    }
  }
`

const HeaderCellSpan = styled.span`
  position: relative;
`

const LiquidityTitle = styled.h2`
  font-size: 20px;
`

const CustomPoolsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 56px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0;
`};
`
const QuestionWrap = styled(CustomPoolsHeader)`
  padding: 0;
`

const ImportWrapHeader = styled(CustomPoolsHeader)`
  padding: 0 15px;
`

const LiquidityContent = styled.div`
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  padding: 0 56px;

  p {
    font-size: 14px;
    color: #a7b1f4;
    text-align: center;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
padding: 0;
`};
`

const LiquidityFooter = styled(CustomPoolsHeader)`
  div {
    display: flex;
    gap: 10px;
  }
`

const ArrowLeft = styled.div`
  transform: rotate(90deg);
  cursor: pointer;
`

export const SelectTitle = styled(LiquidityTitle)`
  font-size: 16px;
  text-align: center;
  color: #727bba;
`



const SelectWrap = styled.div`
  display: flex;
  padding: 0 43px;
  margin: 20px 0px;
`

const CurrencySelectPool = styled(CurrencySelect)`
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
font-size: 13px;
`};
`

const TokenWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;

  div {
    display: flex;
    align-items: center;
  }
`

const WarningTitle = styled.h5`
  color: red;
  text-align: center;
`

const HasNoLiquidityTitle = styled(WarningTitle)`
  color: #6752f7;
`




const ImportWrapper = styled.div`
  width: 500px;
  max-height: 600px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  max-width: 320px;
  width: 100%;
`};
`

export type SortedTitleProps = {
  title: String
}

export default function Pools() {
  const {
    availableChains: allChains,
    currentChain,
    token0,
    token1,
    isImportPoolsPage,
    poolsTokens
  } = useCrosschainState()

  //@ts-ignore
  const serializePoolControls = JSON.parse(localStorage.getItem('PoolControls')) //get filter data from local storage
  const dispatch = useDispatch<AppDispatch>()
  const poolsState = usePoolsState()
  const {
    aprData,
    poolsData,
    weeklyEarnings,
    readyForHarvest,
    totalLiquidity,
    weeklyEarningsTotalValue,
    readyForHarvestTotalValue
  } = poolsState
  const { account, chainId } = useActiveWeb3React()
  const stakingInfos = useStakingInfo()
  console.log(stakingInfos)
  const toggleWalletModal = useWalletModalToggle()

  // filters & sorting
  const [searchText, setSearchText] = useState(serializePoolControls ? serializePoolControls.searchText : '')
  const [isStaked, setShowStaked] = useState(
    serializePoolControls?.hasOwnProperty('isStaked') ? serializePoolControls.isStaked : false
  )
  const [isLive, setShowLive] = useState(
    serializePoolControls?.hasOwnProperty('isLive') ? serializePoolControls.isLive : true
  )
  const [filteredMode, setFilteredMode] = useState(
    serializePoolControls?.filteredMode ? serializePoolControls?.filteredMode : 'Hot'
  )
  const [displayMode, setDisplayMode] = useState(
    serializePoolControls?.displayMode ? serializePoolControls?.displayMode : 'table'
  )

  const [showClaimRewardModal, setShowClaimRewardModal] = useState<boolean>(false)
  const [claimRewardStaking, setClaimRewardStaking] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOpen2, setModalOpen2] = useState(false)

  const [isPoolCardOpen, setIsPoolCardOpen] = useState<boolean>(false)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const handleInputSelect = useCallback(inputCurrency => {
    console.log(inputCurrency)
    if (inputCurrency?.address) {
      const newToken = GetTokenByAddrAndChainId(inputCurrency.address, currentChain.chainID)
      dispatch(
        setImportToken({
          currentToken: 'token0',
          token: {
            name: newToken?.name || '',
            address: newToken?.address || '',
            chainId,
            symbol: newToken?.symbol || '',
            decimals: newToken?.decimals || 18
          }
        })
      )
    }
  }, [])

  const handleOutputSelect = useCallback(inputCurrency => {
    if (inputCurrency?.address) {
      const newToken = GetTokenByAddrAndChainId(inputCurrency.address, currentChain.chainID)
      dispatch(
        setImportToken({
          currentToken: 'token1',
          token: {
            name: newToken?.name || '',
            address: newToken?.address || '',
            chainId,
            symbol: newToken?.symbol || '',
            decimals: newToken?.decimals || 18
          }
        })
      )
    }
  }, [])

  let tokenFirst = new Token(56, '0x4f491d389A5bF7C56bd1e4d8aF2280fD217C8543', 18, 'WISB', 'Wise Token')
  let tokenSecond = new Token(56, '0xA6b4a72a6f8116dab486fB88192450CF3ed4150C', 18, 'INDA', 'ZERO INDA')

  if (
    Object.keys(token0).length > 0 &&
    token0.symbol.length &&
    Object.keys(token1).length > 0 &&
    token1.symbol.length
  ) {
    tokenFirst = new Token(token0.chainId, token0.address, token0.decimals, token0.symbol, token0.name)
    tokenSecond = new Token(token1.chainId, token1.address, token1.decimals, token1.symbol, token1.name)
  }

  const [isPoolFound, setIsPoolFound] = useState(false)
  const [isUserHasAlready, setIsUserHasAlready] = useState(false)
  const [isUserHasNotLiquidity, setIsUserHasNotLiquidity] = useState(false)
  const contractAddress = Pair.getAddress(tokenFirst, tokenSecond)
  const pairContract = usePairContract(contractAddress)
  const takeBalance = async () => {
    try {
      return await pairContract?.balanceOf(account)
    } catch (e) {
      setIsPoolFound(true)
      setIsUserHasNotLiquidity(false)
      setIsUserHasAlready(false)
      return null
    }
  }

  const takeSupply = async () => {
    try {
      return await pairContract?.totalSupply()
    } catch (e) {
      console.log(e)
    }
  }

  const getReservesFromContract = async () => {
    try {
      return await pairContract?.getReserves()
    } catch (e) {
      console.log(e)
    }
  }

  const getDecimals = async () => {
    try {
      return await pairContract?.decimals()
    } catch (e) {
      console.log(e)
    }
  }

  const getFirstToken = async () => {
    try {
      return await pairContract?.token0()
    } catch (e) {
      console.log(e)
    }
  }

  const getSecondToken = async () => {
    try {
      return await pairContract?.token1()
    } catch (e) {
      console.log(e)
    }
  }

  const takeInfo = async () => {
    if (token0.symbol.length && token1.symbol.length) {
      const balance = await takeBalance()
      const totalSupply = await takeSupply()
      const reserves = await getReservesFromContract()
      const decimals = await getDecimals()
      let firstToken = await getFirstToken()
      let secondToken = await getSecondToken()

      if (balance != null && !(balance.toString() > 0)) {
        setIsUserHasNotLiquidity(true)
        setIsPoolFound(false)
        setIsUserHasAlready(false)
      }

      if (firstToken && secondToken) {
        firstToken = GetTokenByAddrAndChainId(firstToken, currentChain.chainID)
        secondToken = GetTokenByAddrAndChainId(secondToken, currentChain.chainID)

        firstToken = new Token(
          firstToken.chainId,
          firstToken.address,
          firstToken.decimals,
          firstToken.symbol,
          firstToken.name
        )
        secondToken = new Token(
          secondToken.chainId,
          secondToken.address,
          secondToken.decimals,
          secondToken.symbol,
          secondToken.name
        )
      }

      if (balance != null && balance.toString() > 0 && totalSupply && reserves && decimals) {
        console.log(balance)
        const totalPercent = Number(String(balance)) / Number(String(totalSupply))
        const balanceOf = ethers.utils.formatUnits(balance, decimals)

        let firstTokenPart = reserves.reserve0.mul(balance).div(totalSupply)
        firstTokenPart = ethers.utils.formatUnits(firstTokenPart.toString(), decimals)

        let secondTokenPart = reserves.reserve1.mul(balance).div(totalSupply)
        secondTokenPart = ethers.utils.formatUnits(secondTokenPart.toString(), decimals)

        let returnFlag = false

        if (poolsTokens.length > 0) {
          // @ts-ignore
          poolsTokens.forEach(item => {
            if (item.contractAddress === contractAddress) {
              returnFlag = true
            }
          })
        }

        if (returnFlag) {
          setIsPoolFound(false)
          setIsUserHasNotLiquidity(false)
          setIsUserHasAlready(true)
          return
        }

        dispatch(
          setNewPairLuiqidity({
            pairLiquidity: {
              balanceOf,
              totalPercent,
              firstTokenPart,
              secondTokenPart,
              contractAddress,
              firstToken,
              secondToken
            }
          })
        )
        dispatch(setImportPoolsPage({ isImportPoolsPage: false }))
      }
    }
  }

  const [apyRequested, setApyRequested] = useState(false)
  const getAllAPY = async () => {
    const res = await getAllPoolsAPY()
    setApyRequested(true)
    if (!res.hasError) {
      dispatch(setAprData({ aprData: res?.data }))
      setApyRequested(false)
    }
  }

  let arrayToShow: any[] = []

  const setArrayToShow = async () => {
    !aprData.length && (await getAllAPY())
    //  APR
    if (aprData && aprData.length) {
      stakingInfos.forEach(arrItem => {
        aprData.forEach((dataItem: AprObjectProps) => {
          if (dataItem?.contract_addr === arrItem.stakingRewardAddress && !arrItem['APR']) {
            arrItem['APR'] = dataItem.APY
          }
        })
      })
    }

    arrayToShow = filterPoolsItems(
      stakingInfos,
      isLive,
      isStaked,
      readyForHarvest,
      filteredMode,
      searchText,
      chainId,
      totalLiquidity
    )
  }

  setArrayToShow()

  useEffect(() => {
    dispatch(setImportPoolsPage({ isImportPoolsPage: false }))
    dispatch(
      setImportToken({
        currentToken: 'token1',
        token: {
          name: '',
          address: '',
          chainId,
          symbol: '',
          decimals: 18
        }
      })
    )
    dispatch(
      setImportToken({
        currentToken: 'token0',
        token: {
          name: '',
          address: '',
          chainId,
          symbol: '',
          decimals: 18
        }
      })
    )
  }, [])
  useEffect(() => {
    let earnings: any = 0
    let harvest: any = 0
    Object.values(weeklyEarnings).forEach(value => {
      earnings = earnings + parseFloat(value.replace(/,/g, ''))
    })
    Object.values(readyForHarvest).forEach(value => {
      harvest = harvest + parseFloat(value.replace(/,/g, ''))
    })
    if (weeklyEarningsTotalValue !== earnings || readyForHarvestTotalValue !== harvest) {
      dispatch(setPoolEarnings({ weeklyEarningsTotalValue: earnings, readyForHarvestTotalValue: harvest }))
    }
  }, [weeklyEarnings, readyForHarvest, stakingInfos, token0, token1])

  const onSortChange = (key: string, value: string | boolean) => {
    switch (key) {
      case 'searchText':
        setSearchText(value)
        break
      case 'isStaked':
        setShowStaked(value)
        break
      case 'isLive':
        setShowLive(value)
        break
      case 'filteredMode':
        setFilteredMode(value)
        break
      case 'displayMode':
        setDisplayMode(value)
        break
    }
    const clone = { ...serializePoolControls, [key]: value }
    localStorage.setItem('PoolControls', JSON.stringify(clone))
  }

  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  const handleHarvest = (stakingInfo: any) => {
    setClaimRewardStaking(stakingInfo)
    setShowClaimRewardModal(true)
  }

  const SortedTitle = ({ title }: SortedTitleProps) => (
    <HeaderCellSpan>
      {title}
      {title === filteredMode && (
        <DropDownWrap>
          <DropdownArrow />
        </DropDownWrap>
      )}
    </HeaderCellSpan>
  )

  return (
    <>
      {claimRewardStaking && (
        <>
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => {
              setShowClaimRewardModal(false)
              setClaimRewardStaking(null)
            }}
            stakingInfo={claimRewardStaking}
          />
        </>
      )}
      <Title>Pools</Title>
      {isImportPoolsPage && (
        <ImportWrapper>
          <Wrapper>
            <ImportWrapHeader>
              <ArrowLeft onClick={() => dispatch(setImportPoolsPage({ isImportPoolsPage: false }))}>
                <Arrow activeColor="#727bba" />
              </ArrowLeft>
              <LiquidityTitle>Import Pool</LiquidityTitle>
              <QuestionWrap>
                <QuestionHelper
                  text={'Use this tool to find pairs that do not automatically appear in the interface'}
                />
              </QuestionWrap>
            </ImportWrapHeader>

            <SelectWrap>
              <CurrencySelectPool
                selected={false}
                className={`open-currency-select-button ${true ? 'centered' : ''}`}
                onClick={() => {
                  setModalOpen(true)
                }}
              >
                {token0.symbol.length > 0 ? (
                  <TokenWrap>
                    <div>
                      <CurrencyLogo currency={token0} />
                      <span style={{ display: 'inline-block', marginLeft: '10px' }}>{token0.symbol}</span>
                    </div>
                    <Arrow activeColor="#fff" />
                  </TokenWrap>
                ) : (
                  'Select a Token'
                )}
              </CurrencySelectPool>
            </SelectWrap>

            <SelectWrap>
              <CurrencySelectPool
                selected={false}
                className={`open-currency-select-button ${true ? 'centered' : ''}`}
                onClick={() => {
                  setModalOpen2(true)
                }}
              >
                {token1.symbol.length > 0 ? (
                  <TokenWrap>
                    <div>
                      <CurrencyLogo currency={token1} />
                      <span style={{ display: 'inline-block', marginLeft: '10px' }}>{token1.symbol}</span>
                    </div>
                    <Arrow activeColor="#fff" />
                  </TokenWrap>
                ) : (
                  'Select a Token'
                )}
              </CurrencySelectPool>
            </SelectWrap>
            <SelectWrap>
            <ButtonPrimary disabled={!(token0.symbol.length && token1.symbol.length)} onClick={takeInfo}>Import</ButtonPrimary>
            </SelectWrap>
            {isPoolFound && (
              <>
              <WarningTitle>No pool found.</WarningTitle>
              <RowBetween style={{justifyContent:"center"}}>
              <StyledInternalLink className="add-liquidity-link" 
               to={{
                pathname: `/add/${token0.address}/${token1.address}`
              }} style={{display: 'inline-block', width: 'auto', textAlign: 'center'}}>
                Create pool                
              </StyledInternalLink>
              <QuestionWrap>
              <QuestionHelper
                text={
                  "You are the first liquidity provider. The ratio of tokens you add will set the price of this pool. Once you are happy with the rate click supply to review."
                }
              />
            </QuestionWrap>
            </RowBetween>
              </>
            )
            }
            {isUserHasNotLiquidity && (
              <>
              <HasNoLiquidityTitle>You don’t have liquidity in this pool yet.</HasNoLiquidityTitle>
              <StyledInternalLink className="add-liquidity-link" 
               to={{
                pathname: `/add/${token0.address}/${token1.address}`
              }} style={{display: 'inline-block', width: '100%', textAlign: 'center'}}>
                Add Liquidity                  
              </StyledInternalLink>
              </>
            )}
            {isUserHasAlready && (
              <>
              <HasNoLiquidityTitle>You already have this LP Tokens.</HasNoLiquidityTitle>
              <StyledInternalLink className="add-liquidity-link" 
               to={{
                pathname: `/add/${token0.address}/${token1.address}`
              }} style={{display: 'inline-block', width: '100%', textAlign: 'center'}}>
                Add Liquidity                  
              </StyledInternalLink>
              </>
            ) }
            <SelectTitle>Select a token to find your liquidity.</SelectTitle>
          </Wrapper>
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={handleInputSelect}
          />
          <CurrencySearchModal
            isOpen={modalOpen2}
            onDismiss={() => setModalOpen2(false)}
            onCurrencySelect={handleOutputSelect}
          />
        </ImportWrapper>
      )}

      {(!arrayToShow || apyRequested) && <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />}
      <PageContainer>
        {account !== null && arrayToShow?.length > 0 && aprData?.length > 0 && !apyRequested && !isImportPoolsPage && (
          <StatsWrapper>
            <Stat className="weekly">
              <StatLabel>Weekly Earnings:</StatLabel>
              <StatValue>
                {numeral(weeklyEarningsTotalValue).format('0,0.00')} <span>Tokens</span>
              </StatValue>
            </Stat>
            <Stat className="harvest">
              <StatLabel>Ready To Harvest:</StatLabel>
              <StatValue>
                {numeral(readyForHarvestTotalValue).format('0,0.00')} <span>Tokens</span>
              </StatValue>
            </Stat>
            <StyledInternalLink className="add-liquidity-link" to={{ pathname: `/add` }}>
              <ButtonOutlined className="add-liquidity-button">Add Liquidity</ButtonOutlined>
            </StyledInternalLink>
            <StyledInternalLink className="remove-liquidity-link" to={{ pathname: `/remove` }}>
              <TextLink>Remove Liquidity</TextLink>
            </StyledInternalLink>
          </StatsWrapper>
        )}
        <PageWrapper>
          {account !== null && !isImportPoolsPage && (
            <PoolControls
              isLive={isLive}
              displayMode={displayMode}
              searchText={searchText}
              onSortChange={onSortChange}
              isStaked={isStaked}
              options={setOptions(filteredMode)}
              activeFilteredMode={filteredMode}
            />
          )}
          {account !== null &&
            stakingInfos?.length > 0 &&
            arrayToShow?.length > 0 &&
            !isImportPoolsPage &&
            (displayMode === 'table' ? (
              <>
                <Wrapper>
                  <PoolsTable style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ verticalAlign: 'top', height: '30px' }}>
                        <HeaderCell style={{ width: '45px' }}></HeaderCell>
                        <HeaderCell>
                          <TYPE.main fontWeight={600} fontSize={12} style={{ textAlign: 'left', paddingLeft: '20px' }}>
                            Type
                          </TYPE.main>
                        </HeaderCell>
                        <HeaderCell mobile={false}>
                          <TYPE.main fontWeight={600} fontSize={12}>
                            Reward
                          </TYPE.main>
                        </HeaderCell>
                        <HeaderCell
                          style={{ cursor: 'pointer' }}
                          mobile={false}
                          onClick={() => onSortChange('filteredMode', 'APR')}
                        >
                          <TYPE.main fontWeight={600} fontSize={12}>
                            <SortedTitle title="APR" />
                          </TYPE.main>
                        </HeaderCell>
                        <HeaderCell
                          style={{ cursor: 'pointer' }}
                          mobile={false}
                          onClick={() => onSortChange('filteredMode', 'Liquidity')}
                        >
                          <TYPE.main fontWeight={600} fontSize={12}>
                            <SortedTitle title="Liquidity" />
                          </TYPE.main>
                        </HeaderCell>
                        <HeaderCell
                          style={{ cursor: 'pointer' }}
                          mobile={false}
                          onClick={() => onSortChange('filteredMode', 'Earned')}
                        >
                          <TYPE.main fontWeight={600} fontSize={12}>
                            <SortedTitle title="Earned" />
                          </TYPE.main>
                        </HeaderCell>
                        <HeaderCell style={{ width: '150px' }}>
                          <TYPE.main fontWeight={600} fontSize={12} style={{ textAlign: 'left', paddingLeft: '20px' }}>
                            Ending:
                          </TYPE.main>
                        </HeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {arrayToShow?.map((item: any) => {
                        if (!item) {
                          return <></>
                        }
                        return (
                          <PoolRow
                            onHarvest={() => handleHarvest(item)}
                            key={item.stakingRewardAddress}
                            stakingInfoTop={item}
                          />
                        )
                      })}
                    </tbody>
                  </PoolsTable>
                </Wrapper>
              </>
            ) : (
              <GridContainer>
                {arrayToShow?.map((item: any) => {
                  if (!item) {
                    return <></>
                  }
                  return (
                    <PoolCard
                      onHarvest={() => handleHarvest(item)}
                      key={item.stakingRewardAddress}
                      stakingInfoTop={item}
                    />
                  )
                })}
              </GridContainer>
            ))}
            {account !== null && arrayToShow?.length > 0 && aprData?.length > 0 && !apyRequested && !isImportPoolsPage && (
 <Wrapper>
 <CustomPoolsHeader>
   <LiquidityTitle>Your Liquidity</LiquidityTitle>
   <QuestionWrap>
     <QuestionHelper
       text={
         "When you add liquidity, you are given pool tokens that represent your share. If you don't see a pool you joined in this list, try importing a pool below."
       }
     />
   </QuestionWrap>
 </CustomPoolsHeader>
 <LiquidityContent>
   {poolsTokens.length ? (
     poolsTokens.map(item => <CustomLiquidityCard key={item.contractAddress} item={item}/>)
   ) : (
     <p>No liquidity found.</p>
   )}
 </LiquidityContent>
 <LiquidityFooter>
   <div>
     Don't see a pool you joined?{' '}
     <TextLink onClick={() => dispatch(setImportPoolsPage({ isImportPoolsPage: true }))}>
       Import it.
     </TextLink>
   </div>
 </LiquidityFooter>
</Wrapper>
            )}
            
          {account !== null && stakingRewardsExist && stakingInfos?.length === 0 && (
            <EmptyData>
              <Spinner src={ZeroIcon} />
            </EmptyData>
          )}
          {account === null && <NoWalletConnected handleWalletModal={toggleWalletModal} />}
        </PageWrapper>
      </PageContainer>
    </>
  )
}
