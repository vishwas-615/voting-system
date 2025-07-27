import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voting Backend API',
      version: '1.0.0',
      description: 'API documentation for Voting Backend',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Change port if needed
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;