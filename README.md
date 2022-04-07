## Description
Example application with basic CRUD operations for issues, and distribution of the issues to user-agents using message queue

### Database
| MySQL | ![enabled](https://img.icons8.com/color/24/000000/checked.png) |

### Message queue
| RabbitMQ | ![enabled](https://img.icons8.com/color/24/000000/checked.png) |

## Usage

### Run with docker
docker-compose up

### Run issue-resolver locally
npm run start-issue-resolver

### Run user-agent locally
npm run start-user-agent

## Testing
Swagger UI and interactive docs can be checked at http://localhost:3000/api/v1/docs