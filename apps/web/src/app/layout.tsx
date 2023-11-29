import React from 'react';

import { RootClientLayout } from '../components/root-client-layout';

import 'node_modules/modern-normalize/modern-normalize.css';
import './global.css';

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
