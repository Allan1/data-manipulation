# Data manipulation

## Project requirements
- Docker
- Docker Compose

## Project setup

- Start with: docker-compose up -d
- Stop with: docker-compose down
- Default api endpoint: http://localhost:3000/api/

### Routes

- GET /transactions/timeline

  Example output:

  ```
  {
    "timeline": [
      {
        "timestamp": "2016-10-02T14:37:31.230Z",
        "revenue": 120,
        "transaction_id": "3409340",
        "store_name": "BH Shopping",
        "products": [
          {
            "name": "Tenis Preto",
            "price": 120
          }
        ]
      },
      {
        "timestamp": "2016-09-22T16:57:31.231Z",
        "revenue": 250,
        "transaction_id": "3029384",
        "store_name": "Patio Savassi",
        "products": [
          {
            "name": "Camisa Azul",
            "price": 100
          },
          {
            "name": "Calça Rosa",
            "price": 150
          }
        ]
      }
    ]
  }
  ```