'use strict';

var request = require('request');
var _sortedIndexBy = require('lodash/sortedIndexBy');

module.exports = function(Transaction) {
  Transaction.disableRemoteMethodByName('prototype.__get__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__create__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__delete__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__findById__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__updateById__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__destroyById__transactionProducts');
  Transaction.disableRemoteMethodByName('prototype.__count__transactionProducts');

  Transaction.timeline = function(cb) {
    let productsByTransition = [];
    let transactions = [];

    request(Transaction.app.get('custom').endpoints.events, {json: true}, function(err, response, body) {
      if (err) {
        cb(err);
      } else {
        let events = body.events;

        for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
          let event = events[eventIndex];
          let transactionId = event.custom_data.find(function(value) {
            return value.key === 'transaction_id';
          }).value;

          switch (event.event) {
            case 'comprou':
              let transaction = Transaction.parseTransactionFromEvent(event);
              transactions.splice(_sortedIndexBy(transactions, transaction, function(item) {
                return -item.timestamp;
              }), 0, transaction);
              break;

            case 'comprou-produto':
              let product = Transaction.parseProductFromEvent(event);
              let i;
              for (i = 0; i < productsByTransition.length && transactionId <= productsByTransition[i].transaction_id; i++) {
                if (productsByTransition[i].transaction_id === transactionId) {
                  break;
                }
              }

              if (i < productsByTransition.length && productsByTransition[i].transaction_id === transactionId) {
                productsByTransition[i].products.push(product);
              } else {
                let j = _sortedIndexBy(productsByTransition, {transaction_id: transactionId}, function(item) {
                  return item.transaction_id;
                });
                productsByTransition.splice(j, 0, {transaction_id: transactionId, products: [product]});
              }

              break;
          }
        }

        productsByTransition.forEach(function(item) {
          let transactionIndex = transactions.findIndex(function(element) {
            return element.transaction_id === item.transaction_id;
          });
          if (transactionIndex !== -1) {
            transactions[transactionIndex].products = item.products;
          }
        });
        cb(null, transactions);
      }
    });
  };

  Transaction.remoteMethod(
    'timeline',
    {
      description: 'Transactions timeline',
      accepts: [],
      returns: {
        arg: 'timeline', type: ['Transaction'], root: false,
      },
      http: {path: '/timeline', verb: 'get'},
    }
  );

  Transaction.parseProductFromEvent = function(event) {
    let product = Transaction.app.models.Product();
    for (let j = 0; j < event.custom_data.length; j++) {
      if (event.custom_data[j].key.startsWith('product_')) {
        product[event.custom_data[j].key.replace('product_', '')] = event.custom_data[j].value;
      }
    }
    return product;
  };

  Transaction.parseTransactionFromEvent = function(event) {
    let transaction = Transaction({
      timestamp: event.timestamp,
      revenue: event.revenue,
    });
    for (let j = 0; j < event.custom_data.length; j++) {
      transaction[event.custom_data[j].key] = event.custom_data[j].value;
    }
    return transaction;
  };
};
