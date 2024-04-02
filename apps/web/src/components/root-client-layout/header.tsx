import React from 'react';

import Link from 'next/link';
import styled from 'styled-components';

const prefixCls = 'header';

const HeaderStyled = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0 24px;
  .${prefixCls}--search {
    flex-grow: 1;
    flex-shrink: 1;
  }
  .${prefixCls}--nav {
    display: flex;
    column-gap: 24px;
    a {
      font-size: 15px;
      color: rgb(64, 71, 86);
      text-decoration: none;
    }
  }
`;

const Header = () => {
  return (
    <HeaderStyled>
      <div></div>
      <div className={`${prefixCls}--search`}></div>
      <div className={`${prefixCls}--nav`}>
        <Link href="/">Home</Link>
        <Link href="/articles">Articles</Link>
        <Link href="/tools/icons">Icons</Link>
      </div>
    </HeaderStyled>
  );
};

export { Header };
