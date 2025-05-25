import { css, Global } from '@emotion/react'

import SUIT from '../fonts/SUIT-Variable.woff2'
import SUITE from '../fonts/SUITE-Variable.woff2'

const customFonts = css`
  @font-face {
    font-family: 'Suit';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(${SUIT}) format('woff2');
  }
  @font-face {
    font-family: 'Suite';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(${SUITE}) format('woff2');
  }
  html,
  body {
    font-family: 'Suit', 'Suite';
  }
`

export default function Fonts() {
  return (
    <>
      <Global styles={customFonts} />
    </>
  )
}
