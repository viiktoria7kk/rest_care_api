# Rest Care API

## Requirements
- Node.js v20.10.0
- Docker

## Running the Application with Docker

1. **Clone the repository:**
    ```sh
    git clone <repository-URL>
    cd <app_name>
    ```

2. **Create a `.env` file in both the `src` directory and the root directory, you can copy the contents of `example.env` to `.env`.**
    ```sh
    cp example.env .env
    cd src
    cp example.env .env
    ```

3. **Start the application with Docker Compose:**
    ```sh
    docker compose up --build
    ```

4. **Run migrations from the Docker container:**
    ```sh
    docker exec -it rest_care npm run migration:run
    ```

5. **Access the API:**
   Open your browser and navigate to `http://localhost:3000`.

# Project Structure

- `src/` - source code of the project
- `src/app.module.ts` - main module of the application
- `src/config/typeorm.config.ts` - TypeORM configuration
- `src/.env` - environment variables
- `src/core/redis/` - module for Redis integration
- `src/core/config/jwt.config.ts` - JWT configuration


### Migrations
Create a new migration:
```sh
 docker exec -it product_2 bash
 npm run migration:generate --name=<migration_name>