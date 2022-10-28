import { Container, MyAvatar, H1Target, PTarget, UlTarget } from '@/components'

export const About: React.FC = () => {
  return (
    <Container>
      <div className="pt-[80px] min-h-[100vh]">
        <MyAvatar />
        <H1Target>关于我</H1Target>
        <PTarget>
          我叫 July，这里是我的个人网站。由于我是一名 web
          前端开发工程师，所以会在这里分享的主要内容也围绕于此，除此之外还会有些兴趣相关的或者碎碎念。
        </PTarget>

        <H1Target>我的经历</H1Target>
        <PTarget>
          出生于 1997 年，浙江杭州周边的小县城，普普通通的农村家庭。
        </PTarget>
        <PTarget>
          读完县城的高中之后，考取的也是杭州市内普普通通的一本高校。在此期间，我主修完了计算机专业的相关课程，并且学习了电子相关的基础课程。
        </PTarget>
        <PTarget>
          期间做了一些考研的学习，当然最后并没有考上。而得益于此的是我捡起了教员的思想。这是我后续人生方向的指导思想，我也非常热衷于讨论这些哲学。
        </PTarget>
        <PTarget>2019 年至今我一直从事互联网前端开发相关工作。</PTarget>

        <H1Target>我的爱好</H1Target>
        <PTarget>
          最大的爱好是电子游戏，集齐了索尼和任天堂的设备（因为有台配置不错的
          pc，所以一直没有下决心买 xbox，笑）。
        </PTarget>
        <PTarget>其次热衷于数码设备，比如喜欢用苹果生态、关注显卡等。</PTarget>

        <H1Target>如何找到我</H1Target>
        <UlTarget>
          <li>Email: MyCrown1234@hotmail.com</li>
        </UlTarget>
      </div>
    </Container>
  )
}
