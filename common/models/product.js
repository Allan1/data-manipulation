'use strict';

module.exports = function(Product) {
  Product.parseFromEvent = function(event) {
    let product = Product();
    for (let j = 0; j < event.custom_data.length; j++) {
      if (event.custom_data[j].key.startsWith('product_')) {
        product[event.custom_data[j].key.replace('product_', '')] = event.custom_data[j].value;
      }
    }
    return product;
  };
};
