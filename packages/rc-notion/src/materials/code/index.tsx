import React from 'react';

import cls from 'classnames';
import { languages, highlight } from 'prismjs';

import { NotionBlock } from '../../types';

import 'prismjs/components/prism-json.min.js';

import './index.scss';

type CodeProps = {
  block: NotionBlock.Code;
} & React.HTMLAttributes<HTMLPreElement>;

const Code: React.FC<CodeProps> = ({ block, className, ...props }) => {
  const { code } = block;
  const {
    language,
    rich_text: [text],
  } = code;
  const { plain_text: content } = text;

  const lang = languages[language] || languages.javascript;
  const html = highlight(content, lang, language);

  return (
    <pre className={cls('jmd-notion-code', `language-${language}`, className)} {...props}>
      <code dangerouslySetInnerHTML={{ __html: html }}></code>
    </pre>
  );
};

export { Code, type CodeProps };
