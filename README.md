# TechLitHub.com is a scalable microservices-based blog platform developed with React, Node.js, MongoDB, AWS S3, EC2, Nginx, TensorFlow, Docker, and Redis. A platform enabling users to create technical blogs, summaries, and share insights from the technical books they've explored.

Link to Deployed Site: https://techlithub.netlify.app/

## Features

- **Scalable Microservices Architecture**: Built with React frontend, Node.js backend, and MongoDB, enabling seamless blog management and user interaction.
- **AWS S3 Integration**: Utilizes AWS S3 for efficient image storage, enhancing user experience with fast-loading content.
- **TensorFlow-based AI**: Implements TensorFlow for real-time spell checking, ensuring the accuracy and professionalism of user-generated content.
- **System Design Best Practices**: Adopts best practices in system design, leveraging Docker, Kubernetes, and Redis for CI/CD, high availability, fault tolerance, and improved system performance.
- **User Authentication:** Users can sign up and log in securely to the platform.
- **Create Blogs:** Authenticated users can create and publish their own tech blogs.
- **Read Blogs:** Users can browse through a collection of tech blogs sorted by categories or search for specific topics.
- **Responsive Design:** The site is optimized for various screen sizes, ensuring a seamless experience across devices.


![Demo of project features](https://github.com/TejasSathe010/TechLitHub/blob/main/TechLitHub.gif)


## Technologies Used

### Frontend:

- React: A JavaScript library for building user interfaces.
- React Router: For managing navigation within the application.
- Axios: For making HTTP requests to the backend server.
- Tailwind.CSS: For styling components in a modular and scoped manner.
- Responsive Design: Ensured using CSS media queries and flexible layouts.

### Backend:

- Node.js: A JavaScript runtime for building scalable network applications.
- Express.js: A web application framework for Node.js.
- MongoDB: A NoSQL database for storing blog data.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- AWS S3: Amazon service for image storage.


## Getting Started

1. **Clone the Repository**:

    ```bash
    git clone <repository_url>
    ```

2. **Install Dependencies**:

    ```bash
    # Navigate to the project directory
    cd tech-blog-site

    # Navigate to the server directory
    cd server

    # Install backend dependencies
    npm install

    # Navigate to the client directory
    cd client

    # Install frontend dependencies
    npm install
    ```

3. **Set Up Environment Variables**:

    Create a `.env` file in the root directory of server and add the following environment variables:

    ```
    DB_Location=<your_mongodb_uri>

    SECRET_ACCESS_KEY=<your_jwt_secret>

    AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>

    AWS_ACCESS_KEY=<your_aws_access_key>
    ```
    
    Create a `.env` file in the root directory of client and add the following environment variables:

    ```
    VITE_SERVER_DOMAIN=<your_server_domain>
    ```

4. **Run the Application**:

    ```bash
    # Navigate to the server directory
    cd server
    
    # Start the backend server
    npm start

    # Navigate to the client directory
    cd client

    # Start the frontend development server
    npm run dev
    ```

5. **Access the Application**:

    Open your browser and navigate to `http://localhost:3000` to access the Tech Blog Site.

## Contributing

Contributions are welcome! If you have any suggestions, feature requests, or bug reports, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
