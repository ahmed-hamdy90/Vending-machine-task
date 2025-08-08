# Vending machine Task

Simple NodeJS Task Simulate Vending Machine Behaviour As Restful APIs

### Full Task Details

We want you to design an API for a vending machine, allowing users
with a “seller” role to add, update or remove products, while users with a “buyer” role
can deposit coins into the machine and make purchases. Your vending machine
should only accept 5, 10, 20, 50 and 100 cent coins.(Feel free to use AI generative tools to assist in building the solution.)

**Tasks**

- REST API should be implemented consuming and producing “application/json”

- Implement product model with amountAvailable, cost, productName and sellerId fields.

- Implement user model with username, password, deposit and role fields

- Implement CRUD for users (POST shouldn’t require authentication)

- Implement CRUD for a product model (GET can be called by anyone, while
POST, PUT and DELETE can be called only by the seller user who created the
product)

- Implement `/deposit` endpoint so users with a “buyer” role can deposit 5, 10, 20,
50 and 100 cent coins into their vending machine account

- Implement `/buy` endpoint (accepts productId, amount of products) so users
with a “buyer” role can buy products with the money they’ve deposited. API
should return total they’ve spent, products they’ve purchased and their
change if there’s any (in 5, 10, 20, 50 and 100 cent coins)

- Implement `/reset` endpoint so users with a “buyer” role can reset their deposit

-----

### Project Structure

The project follows a modular and clean architecture to separate concerns, making it scalable and easy to maintain.

```
.
├── Config/               # configurtions folder include different enviroments file
├── src/                  # All application source code
│   ├── DB/               # All files related to Database Level
│   │    ├── Adapters     # Database Wrapper classes to apply Adapter pattern for database engine
│   │    ├── Mappers      # Database Mapper classes to keep every document separated Deal with database level
│   │    └── MongoModels  # All Mongo Models files for every Document
│   ├── Entities          # All Separated Entities Classes represent Simple DTO
│   ├── Erorrs/           # Custom Error files
│   ├── Middlewares/      # Custom Middleware logic files
│   ├── Routes/           # Handlers for route requests (business logic Seperate)
│   ├── Seeds/            # Seeds files based on Database every Tables/Documents
│   ├── Services/         # Service Logic Layer files
│   ├── utils/            # Helper functions (e.g., logging, validation)
│   └── Validators/       # Custom Validator files
├── test/                 # All tests for the API
│   ├── unit              # All Unit tests for the API            
│   └── Scenario          # All Scenario tests for the API
├── .dockerigone          # Docker ignore file
├── .gitignore            # Specifies files and folders to ignore by Git
├── Dockerfile            # Instructions for building the Docker image of Node API
├── package.json          # Project metadata, script commands and chosen NPM packages
├── app.js                # The main entry point and Express application setup
├── dbSeeder.js           # The main entry point for Running Database Seeds
└── README.md
```

-----

### Available HTTP Routes

The following API endpoints are available for interacting with Vending machine.
**Note:** Make sure about Authorization rule based on Tasks Description

| Method | Route | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | Perform authication action, Take JSON Body with `username` and `password` |
| **GET** | `/api/v1/users` | List all available Users list |
| **GET** | `/api/v1/users/:userId` | Browse Request User Details |
| **POST** | `/api/v1/users` | Perform Create new User, Take JSON Body with `username`, `password`, `deposit` and `rule` |
| **PUT** | `/api/v1/users/edit/:userId` | Perform Edit Exists User, Same JSON Body for Creation |
| **DELETE** | `/api/v1/users/remove/:userId` | Perform Remove Exists User |
| **GET** | `/api/v1/products` | List all available Products list |
| **GET** | `/api/v1/products/:productId` | Browse Request Product Details |
| **POST** | `/api/v1/products` | Perform Create new Product, Take JSON Body with `productName`, `cost`, `amount` and `saller` |
| **PUT** | `/api/v1/products/edit/:productId` | Perform Edit Exists Product, Same JSON Body for Creation |
| **DELETE** | `/api/v1/products/remove/:productId` | Perform Remove Exists Product |

-----

### How to Run with Docker And Docker Compose

To run this project in a containerized environment, follow these steps:

1.  **Build the Docker image for Node API:**

    ```bash
    docker compose build
    ```

2.  **Run the containers after built image**

    ```bash
    docker compose run
    ```
    This command maps port `3000` from your local machine to port `3000` inside the container. You can now access the API at `http://localhost:3000`.

3.  **Run the Database Seeds before Testing API (if needed)**
    ```bash
    docker exec -it nodeapi npm run run-db-seeds
    ```
4.  **Clean Containers After close Run (if needed)**

    ```bash
    docker compose down
    ```

-----

### Versions & TODOs

#### Versions

  - [v1.0.0](https://github.com/ahmed-hamdy90/Vending-machine-task/tree/Development): Initial release with basic functionality for all Given Tasks List Except Payment functionality Tasks **Current Version**

#### Future Enhancements (TODOs)

  - [ ] Replace Mapper pattern(Idea not useful) with Repository Pattern to iclude deal with Database and any extra logic and wrapping Monogo Adapter and Model classes as this Class to be more clear when we need to Replace database integration
  - [ ] Make Integration for Redis through Repository to used and nestted (Apply Cashing first approach)
  - [ ] Use .Env Varaiables insetad of simple configuration
  - [ ] Make Custom Looger to be logging on file
  - [ ] Make Swagger Implementation for easy and testable API documentation