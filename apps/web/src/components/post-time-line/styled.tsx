import styled from 'styled-components'

export const TimeLineStyled = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 36px;
  &::before {
    content: '';
    width: 2px;
    height: 100%;
    background: ${props => props.theme.$T1};
    position: absolute;
    top: 10px;
    left: -1px;
  }
  .year {
    color: ${props => props.theme.$T0};
    position: relative;
    padding-left: ${props => props.theme.$lg};
    font-weight: 500;
    &::after {
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 100%;
      background: ${props => props.theme.$T0};
      position: absolute;
      top: 8px;
      left: -6px;
      box-shadow: 0 0 0 3px ${props => props.theme.$T1};
    }
  }
  .posts {
    .post {
      padding-left: ${props => props.theme.$lg};
      color: ${props => props.theme.$T0};
      margin-top: ${props => props.theme.$lg};
      position: relative;
      &::after {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 100%;
        background: ${props => props.theme.$T0};
        position: absolute;
        top: 8px;
        left: -4px;
        box-shadow: 0 0 0 2px ${props => props.theme.$T1};
      }
      .echo-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
          flex-grow: 1;
          flex-shrink: 1;
          padding-right: ${props => props.theme.$md};
          color: ${props => props.theme.$T0};
          & > span:hover {
            text-decoration: underline;
          }
        }
        .date {
          flex-grow: 0;
          flex-shrink: 0;
        }
      }
      .introduction {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
`
