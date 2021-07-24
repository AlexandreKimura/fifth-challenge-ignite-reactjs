import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="logo" />
        <span>
          spacetraveling <span>.</span>
        </span>
      </div>
    </header>
  );
}
