import Image from 'next/image';

import classes from './hero.module.css';

function Hero() {
  return (
    <section className={classes.hero}>
      <div className={classes.image}>
        <Image
          src='/images/site/js-jungle-logo.png'
          alt='An image showing the logo'
          width={300}
          height={300}
        />
      </div>
      <h1>The JavaScript Jungle</h1>
      <p>
          Welcome to the JavaScript Jungle! Here, I share insights and expertise on
          a wide range of tricks and topics I've acquired throughout my experience with this
          formidable language. My aim is to assist others in their journey and prevent unnecessary
          redundancy. Stay tuned for more valuable content!
      </p>
    </section>
  );
}

export default Hero;
