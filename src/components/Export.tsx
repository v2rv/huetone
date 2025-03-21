import React, { FC, useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useStore } from '@nanostores/react'
import {
  exportToHexPalette,
  exportToTokens,
  parseHexPalette,
  exportToOklchPalette,
} from 'store/palette'
import { exportToCSS } from 'store/palette/converters'
import { paletteStore, setPalette } from 'store/palette'
import { TextArea } from './inputs'
import { CopyButton } from './CopyButton'
import { useKeyPress } from 'shared/hooks/useKeyPress'

export const TokenExportButton: FC = () => {
  const palette = useStore(paletteStore)
  return (
    <CopyButton
      getContent={() => {
        const tokens = exportToTokens(palette)
        return JSON.stringify(tokens, null, 2)
      }}
    >
      Copy tokens
    </CopyButton>
  )
}

export const CSSExportButton: FC = () => {
  const palette = useStore(paletteStore)
  return (
    <CopyButton getContent={() => exportToCSS(palette)}>
      Copy CSS variables
    </CopyButton>
  )
}

export const ExportField: FC = () => {
  const palette = useStore(paletteStore)
  const ref = useRef<any>()
  const [areaValue, setAreaValue] = useState('')
  const [isOklch, setIsOklch] = useState(false)
  const oPressed = useKeyPress('KeyO')

  useEffect(() => {
    if (oPressed) {
      setIsOklch(prev => !prev)
    }
  }, [oPressed])

  const currentJSON = JSON.stringify(
    isOklch ? exportToOklchPalette(palette) : exportToHexPalette(palette),
    null,
    2
  )

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      const newPaletteJson = currentJSON
      setAreaValue(newPaletteJson)
    }
  }, [currentJSON, isOklch])

  return (
    <Container>
      <JSONArea
        ref={ref}
        onBlur={() => setAreaValue(currentJSON)}
        value={areaValue}
        onFocus={e => e.target.select()}
        onChange={e => {
          const value = e.target.value
          setAreaValue(value)
          if (value) {
            try {
              const json = JSON.parse(value)
              const newPalette = parseHexPalette(json, palette.mode)
              setPalette(newPalette)
            } catch (error) {
              console.warn('Parsing error', error)
            }
          }
        }}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 368px; /* 400px - 2 * 16px padding */
`

const JSONArea = styled(TextArea)`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;
  min-width: 368px; /* 400px - 2 * 16px padding */
`
