import React from 'react';

import '@july_cm/rc-design/dist/styles.css';
import '@july_cm/rc-notion/dist/styles.css';
import '../styles/global.scss';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
