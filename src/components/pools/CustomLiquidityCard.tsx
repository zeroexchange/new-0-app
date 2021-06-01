import React, { useState } from 'react'
import styled from 'styled-components'

import { PoolLiquidityToken } from 'state/crosschain/reducer'

import CurrencyLogo from 'components/CurrencyLogo'
import { Wrapper } from 'pages/Pools'
import { ArrowDown as Arrow } from 'components/Arrows'
import { RowBetween } from 'components/Row'
import { StyledTradelLink } from 'pages/Pools/Manage'
import { ButtonOutlined } from 'components/Button'
const LiquidityTitle = styled.h2`
  font-size: 20px;
`

const SelectTitle = styled(LiquidityTitle)`
  font-size: 16px;
  text-align: center;
  color: #727bba;
`

const ImportedWrap = styled.div<{ isPoolCardOpen?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ isPoolCardOpen }) => (isPoolCardOpen ? '20px' : '0')};

  div {
    display: flex;
    justify-content: flex-start;
  }

  h3 {
    font-weight: 500;
    color: #a7b1f4;
    font-size: 15px;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`};
  }
`

const ArrowRotate = styled.div<{ isPoolCardOpen?: boolean }>`
  transform: ${({ isPoolCardOpen }) => (isPoolCardOpen ? 'rotate(180deg)' : 'none')};
`

const ImportRowBetween = styled(RowBetween)`
  margin-top: 15px;
`

const PooledImportTitle = styled(SelectTitle)`
  display: flex;
  gap: 10px;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
font-size: 13px;
`};
`

export type CustomLiquidityCardProps = {
  item: PoolLiquidityToken
}

const CustomLiquidityCard = ({ item }: CustomLiquidityCardProps) => {
  const [isPoolCardOpen, setIsPoolCardOpen] = useState<boolean>(false)
  return (
    <Wrapper style={{ padding: '20px' }}>
      <ImportedWrap isPoolCardOpen={isPoolCardOpen} onClick={() => setIsPoolCardOpen(!isPoolCardOpen)}>
        <div>
          <CurrencyLogo currency={item.firstToken} />
          <CurrencyLogo currency={item.secondToken} />
        </div>

        <h3>
          <span>{item.firstToken.symbol}</span>/<span>{item.secondToken.symbol}</span>
        </h3>
        <ArrowRotate isPoolCardOpen={isPoolCardOpen}>
          <Arrow activeColor="#727bba" />
        </ArrowRotate>
      </ImportedWrap>
      {isPoolCardOpen && (
        <>
          <ImportRowBetween>
            <PooledImportTitle>Pooled {item.firstToken.symbol}:</PooledImportTitle>
            <PooledImportTitle>
              {Number(item.firstTokenPart).toFixed(5)}

              <CurrencyLogo currency={item.firstToken} />
            </PooledImportTitle>
          </ImportRowBetween>
          <ImportRowBetween>
            <PooledImportTitle>Pooled {item.secondToken.symbol}:</PooledImportTitle>
            <PooledImportTitle>
              {Number(item.secondTokenPart).toFixed(5)}

              <CurrencyLogo currency={item.secondToken} />
            </PooledImportTitle>
          </ImportRowBetween>

          <ImportRowBetween>
            <PooledImportTitle>Your pool tokens:</PooledImportTitle>
            <PooledImportTitle>{Number(item.balanceOf).toFixed(5)}</PooledImportTitle>
          </ImportRowBetween>

          <ImportRowBetween>
            <PooledImportTitle>Your pool share:</PooledImportTitle>
            <PooledImportTitle>{(item.totalPercent * 100).toFixed(10)}%</PooledImportTitle>
          </ImportRowBetween>
          <ImportRowBetween style={{justifyContent: 'center'}}>
            <StyledTradelLink
              
              className="trade-button-link"
              to={{
                pathname: `/remove/${item.firstToken.address}/${item.secondToken.address}`
              }}
            >
              <ButtonOutlined className="add-liquidity-button">Remove</ButtonOutlined>
            </StyledTradelLink>
          </ImportRowBetween>
        </>
      )}
    </Wrapper>
  )
}

export default CustomLiquidityCard
