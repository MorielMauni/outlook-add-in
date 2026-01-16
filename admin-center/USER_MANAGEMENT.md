# User Management Guide

This guide explains how to add, remove, or update user accounts for the Admin Center.

## Security Note

All passwords are **hashed** using `bcrypt` before being stored in `config/users.js`. You cannot store plain text passwords in the configuration file.

## Prerequisites

- **Docker** and **Docker Compose** installed on the machine.
- The `admin` container must be running (or you can run it momentarily).

## Managing Users

### 1. Generating a Password Hash

To add a user, you need to generate a secure hash of their password. You can run the generation script **inside the docker container** so you don't need Node.js installed on your host.

1. Ensure your containers are up:

   ```bash
   docker-compose up -d
   ```

2. Run the helper script inside the container:

   ```bash
   docker-compose exec admin node scripts/manage_users.js hash <your-password>
   ```

   **Example:**

   ```bash
   docker-compose exec admin node scripts/manage_users.js hash MySecretPass123
   ```

   **Output:**

   ```
   Hash for password "MySecretPass123":
   $2b$10$fjhXSY2Jv0ITCje8Cwyi3uH5d.w15aVq5dy7P9VWC6cHz3jdXs7Wa
   ```

### 2. Adding a User

To get the exact line to add to your config file:

```bash
docker-compose exec admin node scripts/manage_users.js add <username> <password>
```

**Example:**

```bash
docker-compose exec admin node scripts/manage_users.js add newadmin MySecretPass123
```

**Output:**

```
Add the following to config/users.js:
"newadmin": "$2b$10$..."
```

Copy the output line and paste it into `admin-center/config/users.js` on your host machine:

```javascript
module.exports = {
  admin: "$2b$10$...",
  newadmin: "$2b$10$...", // <--- New user added here
};
```

### 3. Removing a User

To remove a user, simply delete their line from `admin-center/config/users.js` and save the file.

### 4. Applying Changes

After modifying the configuration file, you must **restart the admin container** for changes to take effect:

```bash
docker-compose restart admin
```
