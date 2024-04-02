import React from 'react';

import * as iconMap from '@july_cm/rc-icons';

const icons = Object.keys(iconMap).map((key) => ({ key, Icon: iconMap[key] }));

const Page: React.FC = () => {
  return (
    <div>
      <p>This is my React Icon Lib. </p>
      <p>The icon svg resources get from Google Fonts.</p>
      <p>https://fonts.google.com/icons?icon.style=Rounded</p>
      <p>Svg customization:</p>
      <ul>
        <li>fill: 0</li>
        <li>weight: 400</li>
        <li>grade: 0</li>
        <li>optical size: 48</li>
      </ul>
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
    </div>
  );
};

export default Page;
