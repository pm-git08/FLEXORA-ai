## FLEXORA- AI: Freelancer & Job Posting Platform 
## (https://flexora-ai.vercel.app/) 


FLEXORA-AI connects skilled freelancers with exciting job opportunities. This platform allows freelancers to showcase their profiles and enables clients to post and manage job listings.



## API Reference

This API provides endpoints to manage freelancers and job postings. Authentication is typically required via an API key passed as a query parameter or header.

---

### Freelancers

#### Get all Freelancers

```http
 GET /api/freelancers
```

Retrieves a list of all available freelancers, with optional filtering and pagination.

| Parameter  | Type     | Description                                                                 |
| :--------- | :------- | :-------------------------------------------------------------------------- |
| `api_key`  | `string` |  Your API key for authentication.                                           |
| `limit`    | `integer`|  Number of freelancers to return per page (default: 10).                    |
| `offset`   | `integer`|  Number of freelancers to skip (for pagination, default: 0).                |
| `skill`    | `string` |  Filter freelancers by a specific skill (e.g., 'React', 'Nodejs').          |

**Example Success Response (200 OK):**
```json
{
  "data": [
    {
      "freelancerId": "f7b3a9c1",
      "name": "Jane Doe",
      "headline": "Full Stack Developer",
      "skills": ["React", "Node.js", "MongoDB"],
      "availability": "available"
    },
    {
      "freelancerId": "e4d2b8a0",
      "name": "John Smith",
      "headline": "UI/UX Designer",
      "skills": ["Figma", "Sketch", "Prototyping"],
      "availability": "part-time"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150
  }
}
```

#### Get a specific Freelancer

```http
 GET /api/freelancers/{freelancerId}
```

Retrieves details for a single freelancer by their ID.

| Parameter      | Type     | Description                                 |
| :------------- | :------- | :------------------------------------------ |
| `freelancerId` | `string` | The ID of the freelancer to fetch.          |
| `api_key`      | `string` | Your API key for authentication.            |  

**Example Success Response (200 OK):**
```json
{
  "freelancerId": "f7b3a9c1",
  "name": "Jane Doe",
  "headline": "Full Stack Developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "portfolioUrl": "[https://jane.dev](https://jane.dev)",
  "availability": "available",
  "bio": "Experienced developer focused on creating modern web applications.",
  "joinedDate": "2024-01-15T10:00:00Z"
}
```
**Example Error Response (404 Not Found):**
```json
{
  "error": "Freelancer not found"
}
```

#### Create a new Freelancer

```http
 POST /api/freelancers
```

Adds a new freelancer profile to the platform.

| Parameter | Type     | Description                            | Location     |
| :-------- | :------- | :------------------------------------- | :----------- |
| `api_key` | `string` |  Your API key.                         | Query/Header |
| `body`    | `object` |  Freelancer data object.               | Request Body |

**Example Request Body:**
```json
{
  "name": "Alice Brown",
  "headline": "DevOps Engineer",
  "skills": ["AWS", "Docker", "Kubernetes", "Terraform"],
  "portfolioUrl": "[https://alice.cloud](https://alice.cloud)",
  "availability": "available",
  "bio": "Cloud infrastructure specialist."
}
```
**Example Success Response (201 Created):**
```json
{
  "freelancerId": "c5a1e9d8",
  "name": "Alice Brown",
  "headline": "DevOps Engineer",
  "skills": ["AWS", "Docker", "Kubernetes", "Terraform"],
  "portfolioUrl": "[https://alice.cloud](https://alice.cloud)",
  "availability": "available",
  "bio": "Cloud infrastructure specialist.",
  "joinedDate": "2025-04-21T07:30:00Z"
}
```

#### Update a Freelancer

```http
 PUT /api/freelancers/{freelancerId}
```
or
```http
 PATCH /api/freelancers/{freelancerId}
```

Updates details for an existing freelancer. `PUT` replaces the entire resource, `PATCH` updates specific fields.

| Parameter      | Type     | Description                                        | Location     |
| :------------- | :------- | :------------------------------------------------- | :----------- |
| `freelancerId` | `string` |  The ID of the freelancer to update.               | Path         |
| `api_key`      | `string` |  Your API key.                                     | Query/Header |
| `body`         | `object` |  Fields to update.                                 | Request Body |

**Example Request Body (PATCH):**
```json
{
  "headline": "Senior Full Stack Developer",
  "availability": "part-time"
}
```
**Example Success Response (200 OK):**
```json
{
  "freelancerId": "f7b3a9c1",
  "name": "Jane Doe",
  "headline": "Senior Full Stack Developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "portfolioUrl": "[https://jane.dev](https://jane.dev)",
  "availability": "part-time",
  "bio": "Experienced developer focused on creating modern web applications.",
  "joinedDate": "2024-01-15T10:00:00Z"
}
```

#### Delete a Freelancer

```http
 DELETE /api/freelancers/{freelancerId}
```

Removes a freelancer profile from the platform.

| Parameter      | Type     | Description                                        | Location     |
| :------------- | :------- | :------------------------------------------------- | :----------- |
| `freelancerId` | `string` |  The ID of the freelancer to delete.               | Path         |
| `api_key`      | `string` |  Your API key.                                     | Query/Header |

**Example Success Response:** `204 No Content` or `200 OK` with `{"message": "Freelancer deleted successfully"}`

---

### Job Postings

#### Get all Job Postings

```http
 GET /api/jobpostings
```

Retrieves a list of all job postings, with optional filtering and pagination.

| Parameter  | Type     | Description                                                              |
| :--------- | :------- | :----------------------------------------------------------------------- |
| `api_key`  | `string` | **Required**. Your API key for authentication.                           |
| `limit`    | `integer`| *Optional*. Number of job postings to return per page (default: 20).   |
| `offset`   | `integer`| *Optional*. Number of job postings to skip (for pagination, default: 0). |
| `status`   | `string` | *Optional*. Filter job postings by status (e.g., 'open', 'closed').     |
| `category` | `string` | *Optional*. Filter job postings by category (e.g., 'Web Development').   |

**Example Success Response (200 OK):**
```json
{
  "data": [
    {
      "postId": "jp987xyz",
      "title": "Frontend Developer Needed",
      "company": "Tech Corp",
      "category": "Web Development",
      "status": "open",
      "postedDate": "2025-04-20T09:00:00Z"
    },
    {
      "postId": "jp654abc",
      "title": "Backend API Engineer",
      "company": "Innovate Ltd",
      "category": "Software Engineering",
      "status": "open",
      "postedDate": "2025-04-19T15:30:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 85
  }
}
```

#### Get a specific Job Posting

```http
 GET /api/jobpostings/{postId}
```

Retrieves details for a single job posting by its ID.

| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `postId`  | `string` | **Required**. The ID of the job posting to fetch. |
| `api_key` | `string` | **Required**. Your API key for authentication.      |

**Example Success Response (200 OK):**
```json
{
  "postId": "jp987xyz",
  "title": "Frontend Developer Needed",
  "company": "Tech Corp",
  "category": "Web Development",
  "status": "open",
  "description": "Seeking a skilled React developer to build interactive user interfaces...",
  "requiredSkills": ["React", "JavaScript", "HTML", "CSS", "Git"],
  "budget": "$5000",
  "postedDate": "2025-04-20T09:00:00Z",
  "clientId": "client123"
}
```

#### Create a new Job Posting

```http
 POST /api/jobpostings
```

Adds a new job posting to the platform.

| Parameter | Type     | Description                            | Location     |
| :-------- | :------- | :------------------------------------- | :----------- |
| `api_key` | `string` | **Required**. Your API key.            | Query/Header |
| `body`    | `object` | **Required**. Job posting data object. | Request Body |

**Example Request Body:**
```json
{
  "title": "Mobile App UI Designer",
  "company": "App Solutions",
  "category": "Design",
  "description": "Design intuitive interfaces for our new mobile application.",
  "requiredSkills": ["Figma", "Mobile UI Design", "Prototyping"],
  "budget": "$3000 - $4000",
  "clientId": "client456"
}
```
**Example Success Response (201 Created):**
```json
{
  "postId": "jp123def",
  "title": "Mobile App UI Designer",
  "company": "App Solutions",
  "category": "Design",
  "status": "open",
  "description": "Design intuitive interfaces for our new mobile application.",
  "requiredSkills": ["Figma", "Mobile UI Design", "Prototyping"],
  "budget": "$3000 - $4000",
  "postedDate": "2025-04-21T07:30:00Z",
  "clientId": "client456"
}
```

#### Update a Job Posting

```http
 PUT /api/jobpostings/{postId}
```
or
```http
 PATCH /api/jobpostings/{postId}
```

Updates details for an existing job posting.

| Parameter | Type     | Description                                     | Location     |
| :-------- | :------- | :---------------------------------------------- | :----------- |
| `postId`  | `string` | **Required**. The ID of the job posting to update. | Path         |
| `api_key` | `string` | **Required**. Your API key.                    | Query/Header |
| `body`    | `object` | **Required**. Fields to update.                 | Request Body |

**Example Request Body (PATCH):**
```json
{
  "status": "closed",
  "budget": "$5200"
}
```
**Example Success Response (200 OK):** (Returns the updated job posting object)

#### Delete a Job Posting

```http
 DELETE /api/jobpostings/{postId}
```

Removes a job posting from the platform.

| Parameter | Type     | Description                                     | Location     |
| :-------- | :------- | :---------------------------------------------- | :----------- |
| `postId`  | `string` |  The ID of the job posting to delete.           | Path         |
| `api_key` | `string` | **Required**. Your API key.                     | Query/Header |

**Example Success Response:** `204 No Content` or `200 OK` with `{"message": "Job posting deleted successfully"}`

---

## Authors

- [@pm-git08](https://www.github.com/pm-git08) - Project Lead (R&D, APIs)
- [@onlyvanshk](https://github.com/onlyvanshk) - Core Web Dev (Frontend)
- [@]()
- [@]()
- [@Akshat28072005](https://github.com/Akshat28072005) - Graphic Designer

## Color Reference

| Color Name    | Hex                                                               | Usage                  |
| ------------- | ----------------------------------------------------------------- | ---------------------- |
| Black         | ![#000000](https://www.color-hex.com/color/000000) #000000        | Body, Backgrounds      |
| Off White     | ![##f9f9f9](https://www.color-hex.com/color/f9f9f9) ##f9f9f9      | Texts                  |
| Purple        | ![#800080](https://www.color-hex.com/color/800080) #800080        | Buttons, Accents       |
| Light Blue    | ![#0000ff](https://www.color-hex.com/color/0000ff) #0000ff        | Hover States, Links    |


## Environment Variables

To run this project locally, you will need to create a `.env` file in the backend root directory and add the following environment variables:

```dotenv
# Database Configuration
DATABASE_URL=your_database_connection_string_here
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=flexora_db

# Server Configuration
PORT=5000

# Security
API_SECRET_KEY=your_super_secret_key_for_tokens_or_auth

# Node Environment
NODE_ENV=development
```

## Screenshots

![FLEXORA-ai Application Screenshot](https://via.placeholder.com/468x300?text=FLEXORA-ai+App+Screenshot)
*(Add real screenshots of your application here)*
