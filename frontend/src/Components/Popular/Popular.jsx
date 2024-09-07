

import React, { useState } from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = () => {
  // Manually defined popular products data
  const [popularProducts, setPopularProducts] = useState([
    {
      id: 1,
      name: 'Product 1',
      image: 'https://m.media-amazon.com/images/I/61buPgvuzzL._AC_UY1100_.jpghttps://m.media-amazon.com/images/I/61buPgvuzzL._AC_UY1100_.jpg',
      new_price: 25.99,
      old_price: 35.99
    },
    {
      id: 2,
      name: 'Product 2',
      image: 'https://images.cbazaar.com/images/red-faux-georgette-embroidered-saree-sasnf6993-u.jpg',
      new_price: 45.99,
      old_price: 55.99
    },
    {
      id: 3,
      name: 'Product 3',
      image: 'https://www.wholesalecatalog.in/images/product/sub_images/2022/11/ladies-flavor-launching-a-new-series-raashi-in-readymade-salwar-suit-for-upcoming-festival-0-2022-11-29_16_19_06.jpeg',
      new_price: 29.99,
      old_price: 39.99
    },
    {
      id: 3,
      name: 'Product 3',
      image: 'https://prathamexports.com/images/product/2022/06/s4u-599-short-frok-style-fancy-kurtis-wholesale-price-surat-2022-06-27_17_41_37.jpg',
      new_price: 29.99,
      old_price: 39.99
    },
   
    // Add more products as needed
  ]);
  
  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
      {/* Render Item component or other content */}
    </div>
  );
};

export default Popular;
