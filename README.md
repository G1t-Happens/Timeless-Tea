# TimelessTea - Web Technologies Demonstration (Tea Webshop)

## Login:

Admin-Email: admin@example.com |  pw: admin

User-Email: user@example.com | pw: user


## Overview

TimelessTea is a project that demonstrates various web technologies by using Vue.js for the frontend and Sails.js for the backend. This project showcases how modern JavaScript frameworks can be integrated to create a complete web application.

**Frontend**: Vue.js  
**Backend**: Sails.js  
**Database**: MySQL

**Use Case**: An online demo tea shop.

## Technologies

- **Vue.js**: A progressive JavaScript framework for building user interfaces.
- **Sails.js**: A web application framework based on Node.js, designed for building APIs and scalable applications.
- **MySQL**: A relational database used to store the application data.
- **Cloudinary**: A cloud-based service for storing and managing images.

## Features

- A comprehensive web application showcasing the capabilities of Vue.js on the client side and Sails.js on the server side.
- **Frontend (Vue.js)**:
    - Dynamic, reactive user interface.
    - Component-based architecture.
- **Backend (Sails.js)**:
    - RESTful API to interact with the frontend.
    - Complex data models to handle business logic.
    - Integration with a MySQL database for data storage.
    - Use of Cloudinary for image storage.

## Setup & Startup

### Prerequisites

- Node.js (version 16 or higher)
- npm (Node Package Manager)
- Vue CLI (optional, for easily creating Vue.js apps)
- MySQL database (local or remote)
- Cloudinary API credentials (optional for image management)

### Frontend (Vue.js)

```bash

cd frontend
npm install
npm run dev
```

### Backend (Sails.js)

```bash

cd backend
npm install
sails lift --datastores.default.password=<mysqlpassword> --cloud_name=<cloudinary cloud name> --api_key=<cloudinary api key> --api_secret=<cloudinary api secret>
```

## **Legal Notice Regarding the Use of Images**
This project uses images of tea varieties and products for demonstration purposes only.  
I do not claim any rights to the images used. All rights to the images remain with their respective owners.  
If a rights holder has concerns regarding the use of their images, the respective image can be removed upon request.

