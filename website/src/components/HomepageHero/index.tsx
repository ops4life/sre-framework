import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.css';

const features = [
  {
    icon: '⚙️',
    title: 'Config-driven',
    description:
      'Drop a sre.yaml, pick a provider preset, done. No PromQL hardcoded anywhere — all queries live in YAML and are fully overridable.',
  },
  {
    icon: '🚀',
    title: 'Zero-infra demo',
    description:
      'One docker compose up gives you a live SRE dashboard with synthetic metrics from three fake services. No Prometheus to install.',
  },
  {
    icon: '📚',
    title: 'Learn Mode',
    description:
      'Toggle concept tooltips on every panel — SLO, error budget, burn rate, golden signals. Built-in SRE onboarding for the whole team.',
  },
];

export default function HomepageHero(): JSX.Element {
  return (
    <>
      <header className={styles.heroBanner}>
        <div className="container">
          <img
            src={useBaseUrl('/img/banner.svg')}
            alt="SRE Framework"
            className={styles.bannerImg}
          />
          <p className="hero__subtitle">
            Config-driven SRE dashboard · Prometheus-native · Zero-infra demo
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              href="https://github.com/ops4life/sre-framework"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.features}>
        <div className={clsx('container', styles.featureGrid)}>
          <p className={styles.sectionTitle} style={{ gridColumn: '1 / -1' }}>
            Everything you need to run SRE in production
          </p>
          {features.map(({ icon, title, description }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{icon}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
