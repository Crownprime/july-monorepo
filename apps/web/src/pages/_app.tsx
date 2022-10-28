import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import theme from '@/styles/theme'

import 'prismjs/themes/prism.css'
import '@/styles/global.css'

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
