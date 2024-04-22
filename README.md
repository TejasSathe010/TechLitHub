# Tech Blog Site

Welcome to our Tech Blog Site! This is a web application developed using React and Node.js where you can read and write tech-related blogs.

## Features

- **User Authentication:** Users can sign up and log in securely to the platform.
- **Create Blogs:** Authenticated users can create and publish their own tech blogs.
- **Read Blogs:** Users can browse through a collection of tech blogs sorted by categories or search for specific topics.
- **Responsive Design:** The site is optimized for various screen sizes, ensuring a seamless experience across devices.

## Technologies Used

### Frontend:

- React: A JavaScript library for building user interfaces.
- React Router: For managing navigation within the application.
- Redux: For managing the application state.
- Axios: For making HTTP requests to the backend server.
- CSS Modules: For styling components in a modular and scoped manner.
- Responsive Design: Ensured using CSS media queries and flexible layouts.

### Backend:

- Node.js: A JavaScript runtime for building scalable network applications.
- Express.js: A web application framework for Node.js.
- MongoDB: A NoSQL database for storing blog data.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.

## Getting Started

1. **Clone the Repository**:

    ```bash
    git clone <repository_url>
    ```

2. **Install Dependencies**:

    ```bash
    # Navigate to the project directory
    cd tech-blog-site

    # Install backend dependencies
    npm install

    # Navigate to the client directory
    cd client

    # Install frontend dependencies
    npm install
    ```

3. **Set Up Environment Variables**:

    Create a `.env` file in the root directory and add the following environment variables:

    ```
    PORT=5000
    MONGODB_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    ```

4. **Run the Application**:

    ```bash
    # Start the backend server
    npm start

    # Navigate to the client directory
    cd client

    # Start the frontend development server
    npm start
    ```

5. **Access the Application**:

    Open your browser and navigate to `http://localhost:3000` to access the Tech Blog Site.

## Contributing

Contributions are welcome! If you have any suggestions, feature requests, or bug reports, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
