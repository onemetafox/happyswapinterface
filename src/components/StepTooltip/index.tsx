import React from 'react'
import styled from 'styled-components'

const StepTooltipContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 272px;
  padding: 24px 32px;
  background-color: #3A395E;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
  color: white;
  border-radius: 16px;
`

export default function StepTooltip({ children, placement, style }) {
    return (
        <StepTooltipContainer className={`step-tooltip step-tooltip-${placement}`} style={style}>
            { children }
        </StepTooltipContainer>
    )
}