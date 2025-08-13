import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-900">
      <Hero />
      {/* <Categories /> */}
      <FeaturedProducts />
    </div>
  );
};

export default Home;
