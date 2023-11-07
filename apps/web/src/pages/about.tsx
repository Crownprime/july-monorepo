import DocHead from '@/components/doc-head'
import { Header, Footer } from '@/components'
import { About } from '@/features/about'

const AboutPage: React.FC = () => (
  <>
    <DocHead title="July's Site" />
    <Header />
    <About />
    <Footer />
  </>
)

export default AboutPage
