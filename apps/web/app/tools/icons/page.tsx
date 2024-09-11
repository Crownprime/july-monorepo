import React from 'react';

import { Typography } from '@july_cm/rc-design';
import * as iconMap from '@july_cm/rc-icons';

import { ArticleLayout } from '../../../components/layout';

const icons = Object.keys(iconMap).map((key) => ({ key, Icon: iconMap[key] }));

const Page: React.FC = () => {
  return (
    <ArticleLayout>
      <Typography.Paragraph>This is my React Icon Lib. </Typography.Paragraph>
      <Typography.Paragraph>
        The icon svg resources get from&nbsp;
        <Typography.Text href="https://fonts.google.com/icons?icon.style=Rounded">
          Google Fonts
        </Typography.Text>
        .
      </Typography.Paragraph>
      <Typography.Paragraph>Google Fonts has some options, this is Svg customization:</Typography.Paragraph>
      <Typography.Paragraph>fill: 0</Typography.Paragraph>
      <Typography.Paragraph>weight: 400</Typography.Paragraph>
      <Typography.Paragraph>grade: 0</Typography.Paragraph>
      <Typography.Paragraph>optical size: 48</Typography.Paragraph>
      <h1>How to use</h1>
      <h2>Install</h2>
      <pre>npm install @july_cm/rc-icons</pre>
      <h2>Usage</h2>
      <pre>
        import {`{`} ChevronRight {`}`} from "@july_cm/rc-icons";
        <br />
        export const Demo = () ={`>`} {`<`}ChevronRight /{`>`};
      </pre>
      <h1>Icon list</h1>
      {icons.map(({ Icon }) => (
        <Icon />
      ))}
    </ArticleLayout>
  );
};

export default Page;
