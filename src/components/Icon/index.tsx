import Icons from './Icons'
import React from 'react'
import styled from 'styled-components'

const StyledSpan = styled.span`
  width: 20px;
  height: 20px;
`
export interface IconProps {
  icon: string
  active?: boolean
  color?: string
}

const Icon = ({ icon, active = false, color }: IconProps) => {
  const IconPath = Icons[icon]
  return (
    <StyledSpan>
      <svg width="21" height="21" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <IconPath color={color ? color : active ? 'white' : '#A7B1F4'} />
      </svg>
    </StyledSpan>
  )
}

export default Icon
