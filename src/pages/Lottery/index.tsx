import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import { AutoRow, RowBetween } from '../../components/Row'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { CHAIN_LABELS, ETH_RPCS } from '../../constants'
import Card, { GreyCard } from '../../components/Card'
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Trade } from '@zeroexchange/sdk'
import {
  ChainTransferState,
  CrosschainChain,
  setCrosschainTransferStatus,
  setCurrentToken,
  setTargetChain,
  setTransferAmount
} from '../../state/crosschain/actions'
import Column, { AutoColumn } from '../../components/Column'
import { Field, selectCurrency } from '../../state/swap/actions'
import { GetTokenByAddress, useCrossChain, useCrosschainHooks, useCrosschainState } from '../../state/crosschain/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { copyToClipboard, wait } from '../../utils'
import styled, { ThemeContext } from 'styled-components'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'

import AddressInputPanel from '../../components/AddressInputPanel'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import { AppDispatch } from '../../state'
import { ArrowDown } from 'react-feather'
import BigNumber from 'bignumber.js'
import BubbleBase from '../../components/BubbleBase'
import ChainBridgeModal from '../../components/ChainBridgeModal'
import Circle from '../../assets/images/circle-grey.svg'
import Circle2 from '../../assets/images/circle.svg'
import { ClickableText } from '../Legacy_Pool/styleds'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import ConfirmTransferModal from '../../components/ConfirmTransferModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ArrowDown as CustomArrowDown } from '../../components/Arrows'
import { CustomLightSpinner } from '../../theme/components'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import Icon from '../../components/Icon'
import Loader from '../../components/Loader'
import PageContainer from './../../components/PageContainer'
import ProgressSteps from '../../components/ProgressSteps'
import { ProposalStatus } from '../../state/crosschain/actions'
import Settings from '../../components/Settings'
import { Text } from 'rebass'
import TokenWarningModal from '../../components/TokenWarningModal'
import TradePrice from '../../components/swap/TradePrice'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { getTokenBalances } from 'api'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { setTokenBalances } from '../../state/user/actions'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useDispatch } from 'react-redux'
import useENSAddress from '../../hooks/useENSAddress'
import { useETHBalances } from '../../state/wallet/hooks'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useTokenBalances } from '../../state/user/hooks'
import useWindowDimensions from './../../hooks/useWindowDimensions'

const CrossChainLabels = styled.div`
  p {
    display: flex;
    text-align: left;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.5rem;
    margin-bottom: 0;
    font-size: 0.9rem;
    span {
      margin-left: auto;
      font-weight: bold;
    }
  }
`
const StyledEthereumLogo = styled.img`
  width: 48px;
  height: 48px;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const SwapOuterWrap = styled.div`
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
padding: 0;
`};
`
const Title = styled.h1`
  width: 100%;
  padding: 0px 64px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 0;
  text-align: center;
  font-size: 49px;
  margin-top: 40px;
  margin-bottom: 0px;
`};
`
const SubTitle = styled.h2`
  font-size: 32px;
`
const SwapFlexRow = styled.div`
  flex: 1;
  width: 100%;
`
const SwapWrap = styled.div`
  font-family: Poppins;
  position: relative;
  width: 620px;
  max-width: 100%;
  padding: 28px 34px;
  min-height: 570px;
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-right: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-top: 20px
  margin-right: auto;
  margin-left: auto;
`};
  ${({ theme }) => theme.mediaWidth.upToSmall`
width: 100%;
`};
`
const SwapFlex = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  align-items: center;
`};
`
const TextBalance = styled.h3`
  font-size: 32px;
  white-space: nowrap;
  margin-bottom: 1rem;
`
const BalanceRow = styled.div<{ isColumn?: boolean }>`
  flex: 1;
  width: 100%;
  display: ${({ isColumn }) => (isColumn ? 'flex' : 'block')};
  flex-direction: ${({ isColumn }) => (isColumn ? 'column' : 'row')};
  align-items: ${({ isColumn }) => (isColumn ? 'center' : '')};
  min-width: 300px;
`
const ChainBridgePending = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  padding: 0.25rem 1rem 0.25rem 1rem;
  border-radius: 12px;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease-in-out;
  background: linear-gradient(45deg, #5496ff, #8739e5);
  position: fixed;
  top: 68px;
  right: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: relative;
    top: auto; right: auto;
  `};
  &:hover {
    cursor: pointer;
    filter: brightness(1.2);
  }
  p {
    font-size: 0.9rem;
    font-weight: bold;
  }
`
const BottomGroupingSwap = styled(BottomGrouping)`
  padding: 14px, 30px, 14px, 30px;
  width: 100%;
  cursor: pointer;
  margin-top: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`

margin-top: 20px;
`};
`
const SwapText = styled.h3`
  font-size: 17px;
  color: #a7b1f4;
  opacity: 0.88;
`
const Flex = styled(RowBetween)`
  align-items: center;
  margin-top: 1rem;
`
const IconWrap = styled.div`
  margin-left: 1.5rem;
  margin-top: 8px;
`
const BalanceCard = styled.div`
  margin-bottom: 20px;
  position: relative;
  height: 118px;
  width: 100%;
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 34px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  `};
`
const Box = styled.div`
  margin-left: 24px;
`

const CrossChain = styled.div`
  font-weight: 600;
  font-size: 13px;

  span {
    margin-left: 10px;
    color: #929ad6;
    opacity: 0.8;
  }
`
const AdressWallet = styled.div`
  font-size: 17px;
  color: #b97cd6;
  opacity: 0.88;
`
const BoxFlex = styled.div`
  display: flex;
`
const CopyImage = styled.div`
  cursor: pointer;
`
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

export default function Lottery() {
  return (
    <>
      <Title>Lottery</Title>
      <PageContainer>
        <SwapOuterWrap>
          <SwapFlex>
            <SwapFlexRow>
              <SwapWrap>
                <BubbleBase />
                <Wrapper id="lottery-page">
                  <Header>
                    <SubTitle>Swap</SubTitle>
                    <Settings />
                  </Header>
                  <AutoColumn gap={'md'}>
                    <CurrencyInputPanel
                      blockchain={isCrossChain ? currentChain.name : getChainName()}
                      label={'From'}
                      value={formattedAmounts[Field.INPUT]}
                      showMaxButton={!atMaxAmountInput}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      isCrossChain={isCrossChain}
                      id="swap-currency-input"
                    />
                    <AutoColumn justify="space-between">
                      <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                        <ArrowWrapper
                          clickable
                          onClick={() => {
                            if (!isCrossChain) {
                              setApprovalSubmitted(false) // reset 2 step UI for approvals
                              onSwitchTokens()
                            }
                          }}
                        >
                          <CustomArrowDown
                            conditionInput={currencies[Field.INPUT]}
                            conditionOutput={currencies[Field.OUTPUT]}
                            defaultColor={theme.primary1}
                            activeColor={theme.text2}
                          />
                        </ArrowWrapper>
                        {recipient === null && !showWrap && isExpertMode ? (
                          <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                            + Add a send (optional)
                          </LinkStyledButton>
                        ) : null}
                      </AutoRow>
                    </AutoColumn>
                    <CurrencyInputPanel
                      blockchain={isCrossChain ? currentChain.name : getChainName()}
                      value={isCrossChain ? formattedAmounts[Field.INPUT] : formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      label={'To'}
                      showMaxButton={false}
                      currency={isCrossChain ? currencies[Field.INPUT] : currencies[Field.OUTPUT]}
                      onCurrencySelect={handleOutputSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      isCrossChain={isCrossChain}
                      disableCurrencySelect={isCrossChain}
                      hideBalance={isCrossChain}
                      currentTargetToken={currentTargetToken}
                      id="swap-currency-output"
                    />

                    {recipient !== null && !showWrap ? (
                      <>
                        <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                          <ArrowWrapper clickable={false}>
                            <ArrowDown size="16" color={theme.text2} />
                          </ArrowWrapper>
                          <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                            - Remove send
                          </LinkStyledButton>
                        </AutoRow>
                        <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                      </>
                    ) : null}

                    {isCrossChain && (
                      <>
                        <CrossChainLabels>
                          <p>
                            Fee:{' '}
                            <span>
                              {crosschainFee} {currentChain?.symbol}
                            </span>
                          </p>
                        </CrossChainLabels>
                      </>
                    )}

                    {showWrap ? null : (
                      <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                        {!isCrossChain && (
                          <AutoColumn gap="4px">
                            {Boolean(trade) && (
                              <RowBetween align="center">
                                <Text fontWeight={500} fontSize={14} color={theme.text2}>
                                  Price
                                </Text>
                                <TradePrice
                                  price={trade?.executionPrice}
                                  showInverted={showInverted}
                                  setShowInverted={setShowInverted}
                                />
                              </RowBetween>
                            )}
                            {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                              <RowBetween align="center">
                                <ClickableText
                                  fontWeight={500}
                                  fontSize={14}
                                  color={theme.text2}
                                  onClick={toggleSettings}
                                >
                                  Slippage Tolerance
                                </ClickableText>
                                <ClickableText
                                  fontWeight={500}
                                  fontSize={14}
                                  color={theme.text2}
                                  onClick={toggleSettings}
                                >
                                  {allowedSlippage / 100}%
                                </ClickableText>
                              </RowBetween>
                            )}
                          </AutoColumn>
                        )}
                      </Card>
                    )}
                  </AutoColumn>
                  <Flex>
                    <BottomGroupingSwap>
                      {!account ? (
                        <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                      ) : !trade ? (
                        <GreyCard
                          style={{
                            textAlign: 'center',
                            minWidth: '230px',
                            borderRadius: '100px',
                            height: '58px',
                            paddingTop: 0,
                            paddingBottom: 0
                          }}
                        >
                          <TYPE.main mb="4px" style={{ lineHeight: '58px' }}>
                            Enter A Trade
                          </TYPE.main>
                        </GreyCard>
                      ) : showWrap ? (
                        <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                          {wrapInputError ??
                            (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                        </ButtonPrimary>
                      ) : noRoute && userHasSpecifiedInputOutput ? (
                        <GreyCard style={{ textAlign: 'center' }}>
                          <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                        </GreyCard>
                      ) : showApproveFlow ? (
                        <RowBetween>
                          <ButtonConfirmed
                            onClick={approveCallback}
                            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                            width="48%"
                            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                            confirmed={approval === ApprovalState.APPROVED}
                          >
                            {approval === ApprovalState.PENDING ? (
                              <AutoRow gap="6px" justify="center">
                                Approving <Loader stroke="white" />
                              </AutoRow>
                            ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                              'Approved'
                            ) : (
                              'Approve ' + currencies[Field.INPUT]?.symbol
                            )}
                          </ButtonConfirmed>
                          <ButtonError
                            onClick={() => {
                              if (isExpertMode) {
                                handleSwap()
                              } else {
                                setSwapState({
                                  tradeToConfirm: trade,
                                  attemptingTxn: false,
                                  swapErrorMessage: undefined,
                                  showConfirm: true,
                                  txHash: undefined
                                })
                              }
                            }}
                            width="48%"
                            id="swap-button"
                            disabled={
                              !isValid ||
                              approval !== ApprovalState.APPROVED ||
                              (priceImpactSeverity > 3 && !isExpertMode)
                            }
                            error={isValid && priceImpactSeverity > 2}
                          >
                            <Text fontSize={16} fontWeight={500}>
                              {priceImpactSeverity > 3 && !isExpertMode
                                ? `Price Impact High`
                                : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                            </Text>
                          </ButtonError>
                        </RowBetween>
                      ) : (
                        <ButtonError
                          isPointer
                          onClick={() => {
                            if (isExpertMode) {
                              handleSwap()
                            } else {
                              setSwapState({
                                tradeToConfirm: trade,
                                attemptingTxn: false,
                                swapErrorMessage: undefined,
                                showConfirm: true,
                                txHash: undefined
                              })
                            }
                          }}
                          id="swap-button"
                          disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                          error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                        >
                          <Text fontSize={18} fontWeight={600}>
                            {swapInputError
                              ? swapInputError
                              : priceImpactSeverity > 3 && !isExpertMode
                              ? `Price Impact Too High`
                              : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                          </Text>
                          <IconWrap>
                            <Icon icon="swap" color="white" />
                          </IconWrap>
                        </ButtonError>
                      )}
                      {showApproveFlow && (
                        <Column style={{ marginTop: '1rem' }}>
                          <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                        </Column>
                      )}
                      {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </BottomGroupingSwap>
                  </Flex>
                </Wrapper>
                {!isCrossChain && +formattedAmounts[Field.INPUT] > 0 && +formattedAmounts[Field.OUTPUT] > 0 && (
                  <AdvancedSwapDetailsDropdown trade={trade} chainId={chainId} />
                )}
              </SwapWrap>
            </SwapFlexRow>
            {account && userEthBalance && (
              <BalanceRow isColumn={isColumn}>
                <TextBalance>Your Balances</TextBalance>
                <BalanceCard>
                  <BubbleBase />
                  <BoxFlex>
                    <StyledEthereumLogo src={EthereumLogo} />
                    <Box>
                      <CrossChain>
                        ETH
                        <span>Ether</span>
                      </CrossChain>
                      <AdressWallet>{userEthBalance?.toSignificant(4)}</AdressWallet>
                    </Box>
                  </BoxFlex>
                  <CopyImage>
                    <Icon icon="copyClipboard" />
                  </CopyImage>
                </BalanceCard>
                {tokenBalances?.map((token: any, index) => {
                  const onClickCopyClipboard = async (e: any) => {
                    e.stopPropagation()
                    copyToClipboard(token.address)
                    await wait(1)
                  }

                  return (
                    <BalanceCard key={index}>
                      <BubbleBase />
                      <BoxFlex>
                        <CurrencyLogo size="48px" currency={token} />
                        <Box>
                          <CrossChain>
                            {token?.symbol}
                            <span>{token?.name}</span>
                          </CrossChain>
                          <AdressWallet>{weiToEthNum(new BigNumber(token?.amount), token?.decimals)}</AdressWallet>
                        </Box>
                      </BoxFlex>
                      <CopyImage onClick={onClickCopyClipboard}>
                        <Icon icon="copyClipboard" />
                      </CopyImage>
                    </BalanceCard>
                  )
                })}
              </BalanceRow>
            )}
          </SwapFlex>
          {(chainId === undefined || account === undefined) && (
            <CustomLightSpinner
              src={Circle2}
              alt="loader"
              size={'60px'}
              style={{
                position: 'fixed',
                left: '0',
                right: '0',
                margin: 'auto',
                top: '45%'
              }}
            />
          )}
          {crosschainTransferStatus !== ChainTransferState.NotStarted ? (
            <ChainBridgePending onClick={handleChainBridgeButtonClick}>
              <p>{`Cross-chain transfer pending`}</p>
              <CustomLightSpinner src={Circle} alt="loader" size={'20px'} style={{ marginLeft: '10px' }} />
            </ChainBridgePending>
          ) : (
            ''
          )}
        </SwapOuterWrap>
      </PageContainer>
    </>
  )
}
