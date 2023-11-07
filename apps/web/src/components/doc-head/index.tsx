import React from 'react'
import Head from 'next/head'

const DocHead: React.FC<{ title: React.ReactNode }> = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}

export default DocHead
