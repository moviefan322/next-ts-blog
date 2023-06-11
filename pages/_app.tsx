import "@/styles/globals.css";
import Layout from "@/components/layout/layout";

type AppProps = {
  Component: React.FC;
  pageProps: any;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
