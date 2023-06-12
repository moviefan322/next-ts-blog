import "@/styles/globals.css";
import Layout from "@/components/layout/layout";
import Head from "next/head";

type AppProps = {
  Component: React.FC;
  pageProps: any;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <meta name="description" content="NextJS Blog" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
