import React from 'react';

import { RootClientLayout } from '../components/root-client-layout';

import '@july_cm/rc-design/dist/styles.css';
import '@july_cm/rc-notion/dist/styles.css';
import '../styles/global.scss';

const RootLayout: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <html>
      <body>
        <RootClientLayout {...props} />
      </body>
    </html>
  );
};

export default RootLayout;
