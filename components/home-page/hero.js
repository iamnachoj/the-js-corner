import Image from 'next/image';

import classes from './hero.module.css';

function Hero() {
  return (
    <section className={classes.hero}>
      <div className={classes.image}>
        <Image
          src='/images/site/me.png'
          alt='An image showing Max'
          width={300}
          height={300}
        />
      </div>
      <h1>Hi, I'm Ignacio</h1>
      <p>
        Welcome to the JS corner! here, I blog about JavaScript, especially frontend frameworks like
        Angular or React, but I also solve code challenges, and talk about the web.
      </p>
    </section>
  );
}

export default Hero;
