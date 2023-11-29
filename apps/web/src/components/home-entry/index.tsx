'use client';
import React from 'react';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const prefixCls = 'home';

const PageStyled = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .${prefixCls}--wrap {
    display: flex;
    margin-top: 30%;
    font-size: 18px;
    letter-spacing: 1px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const HomeEntry = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push('/articles');
  };
  return (
    <PageStyled>
      <div className={`${prefixCls}--wrap`} onClick={handleClick}>
        July
      </div>
    </PageStyled>
  );
};
