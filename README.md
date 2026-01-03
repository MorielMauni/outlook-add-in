# M&D Signatures - Production Deployment Guide

For detailed production setup and customization instructions (including Lawyer signatures), please refer to [prod.md](prod.md).

This project contains the source code and deployment configuration for the M&D Signatures Outlook Add-in.

## Architecture

The application is containerized using Docker and Orchestrated via Docker Compose.

- **Load Balancer**: An Nginx container runs at the front, handling HTTPS traffic on port 3000.
- **Application Cluster**: Behind the load balancer, 4 replicas of the Node.js application run in parallel.
  - If one container fails, the others continue to serve handling specific requests.
  - The `npm run dev-server` command is used inside the containers as requested, serving the app via webpack.

## Prerequisites

1.  **Docker** and **Docker Compose** installed on your server (Ubuntu/Debian).
    ```bash
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo usermod -aG docker $USER
    # Log out and back in for group changes to take effect
    ```

## Quick Start (Production)

To start the application with high availability (1 main + 3 backups):

1.  **Build and Run**:

    ```bash
    docker-compose up --build -d
    ```

    This command will:
    - Build the Docker image.
    - Generate self-signed certificates automatically in a shared volume.
    - Start 4 application containers.
    - Start the Nginx load balancer listening on port 3000.

2.  **Verify Status**:
    ```bash
    docker-compose ps
    ```
    You should see `lb` (1 instance) and `app` (4 instances) running.

## Sideloading in Outlook

Since this deployment uses self-signed certificates generated inside the container, you need to trust them or simply accept the warning in the browser.

1.  **Access the Manifest**:
    Navigate to `https://<YOUR-SERVER-IP>:3000/manifest.xml`.
    _Note: You will see a security warning. Click "Advanced" -> "Proceed" to accept it._

2.  **Install**:
    - **OWA**: Go to Outlook Web -> New Message -> Add-ins -> Add from File -> Upload the `manifest.xml` (you might need to download it from the URL first).
    - **Desktop**: Add from file or URL if trusted.

## Updating the Manifest for Production Domain

If you have a real domain (e.g., `signatures.md-company.com`):

1.  Edit `manifest.xml` in the project root.
2.  Replace `https://localhost:3000` with `https://signatures.md-company.com:3000` (or just port 443 if you change port mapping).
3.  Rebuild the containers:
    ```bash
    docker-compose up --build -d
    ```

## Maintenance

- **View Logs**:
  ```bash
  docker-compose logs -f
  ```
- **Stop Server**:
  ```bash
  docker-compose down
  ```
- **Scale Up/Down**:
  To change the number of backup containers (e.g., to 6 total):
  ```bash
  docker-compose up -d --scale app=6
  ```

## File Structure

- `src/`: Source code.
- `assets/`: Images.
- `docker-compose.yml`: Orchestration config.
- `Dockerfile`: Container definition.
- `nginx.conf`: Load balancer configuration.
- `entrypoint.sh`: Startup script for cert generation.

## Troubleshooting

- **"Site not reachable"**: Ensure port 3000 is open in your server's firewall (AWS Security Group / UFW).
  ```bash
  sudo ufw allow 3000
  ```
- **"Invalid Certificate"**: This setup uses self-signed certs. For a real production setup, you should mount valid Let's Encrypt certificates into `/etc/nginx/certs` in the `docker-compose.yml` and update `nginx.conf` to use them.
