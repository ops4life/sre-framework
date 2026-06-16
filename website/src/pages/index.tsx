import Layout from '@theme/Layout';
import HomepageHero from '../components/HomepageHero';

export default function Home(): JSX.Element {
  return (
    <Layout description="Config-driven SRE dashboard. Prometheus-native. Zero-infra demo.">
      <HomepageHero />
    </Layout>
  );
}
