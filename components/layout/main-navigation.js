import Link from 'next/link';

import Logo from './logo';
import classes from './main-navigation.module.css';

function MainNavigation() {
  return (
    <header className={classes.header}>
      <Link href='/'>
        <a>
          <Logo />
        </a>
      </Link>
      <nav>
        <ul>
          <li>
            <Link href='/posts'>Posts</Link>
          </li>
          <li>
            <a target="_blank" href='https://www.linkedin.com/in/ignacio-jimenezjimenez/'>Contact</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
