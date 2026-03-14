# Quartz v4 Fork

## Docker Targets

This repo now provides two Docker targets:

1. `quartz-builder`: runs a one-shot static site build (`npx quartz build`)
2. `quartz-preview`: runs local preview mode (`npx quartz build --serve`)

Build images by target:

```bash
docker build --target quartz-builder -t quartz-builder .
docker build --target quartz-preview -t quartz-preview .
```

Example: run builder with mounted content/config/layout and export generated `public/` output:

```bash
docker run --rm \
	-v /content:/usr/src/app/content:ro \
	-v ./quartz.config.ts:/usr/src/app/quartz.config.ts:ro \
	-v ./quartz.layout.ts:/usr/src/app/quartz.layout.ts:ro \
	-v ./custom.scss:/usr/src/app/quartz/styles/custom.scss:ro \
	-v ./icon.png:/usr/src/app/quartz/static/icon.png:ro \
	-v ./public:/usr/src/app/public \
	quartz-builder
```

## Docker Compose Example (Nginx Static Hosting)

Use this in your deployment repo when you want Quartz to build static files and let Nginx serve them.

You do not need to check out this fork on the server if you use a published builder image from GHCR.

```yaml
services:
  quartz-build:
    image: ghcr.io/<your-github-user-or-org>/quartz-builder:latest
    working_dir: /usr/src/app
    command: >
      sh -c "npx quartz build && rm -rf /out/* && cp -a public/. /out/"
    volumes:
      - /content:/usr/src/app/content:ro
      - ./quartz.config.ts:/usr/src/app/quartz.config.ts:ro
      - ./quartz.layout.ts:/usr/src/app/quartz.layout.ts:ro
      - ./custom.scss:/usr/src/app/quartz/styles/custom.scss:ro
      - ./icon.png:/usr/src/app/quartz/static/icon.png:ro
      - quartz_public:/out
    restart: "no"

  nginx:
    image: nginx:1.27-alpine
    depends_on:
      - quartz-build
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - quartz_public:/usr/share/nginx/html:ro
    restart: unless-stopped

volumes:
  quartz_public:
```

Create `nginx.conf` next to your `docker-compose.yml`:

```nginx
server {
		listen 80;
		server_name _;

		root /usr/share/nginx/html;
		index index.html;
		error_page 404 /404.html;

		location / {
				try_files $uri $uri.html $uri/ =404;
		}
}
```

Usage flow:

1. Pull latest builder image: `docker compose pull quartz-build`
2. Build static output: `docker compose run --rm quartz-build`
3. Start static web server: `docker compose up -d nginx`

If your GHCR package is private, run `docker login ghcr.io` on the server first.
If you want anonymous pulls, set the package visibility to public in GitHub Packages.

If you rebuild later, run steps 1 and 2 again to refresh the shared `quartz_public` volume.
