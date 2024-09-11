import { css } from 'styled-components'

export const componentCls = 'post-toc'

export const styles = css`
  width: 300px;
  height: 400px;
  overflow-y: overlay;
  position: sticky;
  bottom: 20px;
  flex-shrink: 0;
  padding-left: 80px;
  .${componentCls}-node {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
    .${componentCls}-node-circle {
      width: 10px;
      height: 4px;
      background-color: #e5e5e5;
      border-radius: 20px;
      margin-right: 12px;
      transition: background 0.5s;
    }
    .${componentCls}-node-text {
      color: #8e8787;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.5s;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &.primary {
      .${componentCls}-node-circle {
        width: 16px;
        margin-right: 6px;
      }
    }
    &:hover,
    &.active {
      .${componentCls}-node-circle {
        background-color: #8e8787;
      }
      .${componentCls}-node-text {
        color: #655e5e;
      }
    }
  }
  &:hover {
    .${componentCls}-node-text {
      opacity: 1;
    }
  }

  @media screen and (max-width: 1040px) {
    display: none;
  }
`
