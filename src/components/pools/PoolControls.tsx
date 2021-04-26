import React, { useState } from 'react'

import CardMode from '../../assets/svg/CardMode'
import ListMode from '../../assets/svg/ListMode'
import SearchBar from '../../components/SearchBar'
import Select from '../../components/Select'
import { TYPE } from '../../theme'
import styled from 'styled-components'

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`

`};
`
const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 32px;

  &:last-of-type {
    margin-right: 0px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction:column;
  align-items: flex-start;
`};
`
const SearchGroup = styled(ControlGroup)`
  flex-grow: 1;
  max-width: 240px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  max-width: none;
    width: 100%;
    margin-bottom:16px;
    margin-right: 0px;
    flex-direction: row;
  `};
`
const ControlLabel = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-right: 20px;
  flex-wrap: nowrap;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-bottom: 8px;
`};
`
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0px 8px;
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
`
const Button = styled.button<{ isSelected?: boolean }>`
  display: flex;
  width: 40px;
  height: 40px;
  background: none;
  border: 0px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  &:focus {
    outline: none;
  }
  &:hover {
    svg {
      g {
        fill: #ffffff;
      }
    }
  }
  svg {
    g {
      fill: #727bba;
    }
  }
  ${({ isSelected }) =>
    isSelected &&
    `
    svg {
        g {
          fill: #ffffff;
        }
      }
    `}
`
const Group = styled.div`
  display: flex;
`

export interface PoolControlsProps {
  displayMode: string
  setDisplayMode: (p: string) => void
}

function PoolControls({ displayMode, setDisplayMode }: PoolControlsProps) {
  const [searchText, setSearchText] = useState('')

  return (
    <Controls>
      <SearchGroup>
        <SearchBar value={searchText} onChange={e => setSearchText(e.target.value)} />
      </SearchGroup>
      <Group>
        <ControlGroup>
          <ControlLabel>
            <TYPE.main fontWeight={600} fontSize={12}>
              {`Sort by: `}
            </TYPE.main>
          </ControlLabel>
          <Select
            options={[
              {
                label: 'Hot',
                value: 'hot'
              },
              {
                label: 'APR',
                value: 'apr'
              },
              {
                label: 'Earned',
                value: 'earned'
              },
              {
                label: 'Liquidity',
                value: 'liquidity'
              }
            ]}
            onChange={() => {}}
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>
            <TYPE.main fontWeight={600} fontSize={12}>
              {`Mode: `}
            </TYPE.main>
          </ControlLabel>
          <InputContainer>
            <Button
              isSelected={displayMode === 'grid'}
              onClick={() => {
                setDisplayMode('grid')
              }}
            >
              <CardMode />
            </Button>
            <Button
              isSelected={displayMode === 'table'}
              onClick={() => {
                setDisplayMode('table')
              }}
            >
              <ListMode />
            </Button>
          </InputContainer>
        </ControlGroup>
      </Group>
    </Controls>
  )
}

export default PoolControls