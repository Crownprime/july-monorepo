'use client';
import React, { useEffect, useRef } from 'react';

import cls from 'classnames';
import { highlightElement } from 'prismjs';

import { NotionBlock } from '../../types';

import 'prismjs/components/prism-json.min.js';

import './index.scss';

type CodeProps = {
  block: NotionBlock.Code;
} & React.HTMLAttributes<HTMLPreElement>;

const Code: React.FC<CodeProps> = ({ block, className, ...props }) => {
  const ref = useRef(null);
  const { code } = block;
  const {
    language,
    rich_text: [text],
  } = code;
  const { plain_text: content } = text;

  useEffect(() => {
    if (ref.current) {
      highlightElement(ref.current);
    }
  }, []);

  return (
    <pre className={cls('jmd-notion-code', className)} {...props}>
      <code className={`language-${language}`} ref={ref}>
        {content}
      </code>
    </pre>
  );
};

export { Code, type CodeProps };
