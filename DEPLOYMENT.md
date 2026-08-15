# Production deployment

Pushes to `main` run linting and a production build before deploying the
frontend to `cloud-admin@2.144.27.2`. Manual workflow runs are also restricted
to the `main` branch.

The application is installed in `~/apps/language-tut-main`, runs as the
`language-tut-main` Docker Compose project, and is exposed on port 3000 by
default.

## GitHub production environment

Create a `production` environment in the GitHub repository with these secrets:

- `DEPLOY_SSH_KEY`: the private deployment key authorized by the server.
- `DEPLOY_HOST_KEY`: the pinned host-key line for `2.144.27.2`.
- `PROD_ENV_B64`: the base64 encoding of the production environment file.

The production environment currently uses:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://2.144.27.2:8001
NEXT_PUBLIC_SITE_URL=http://2.144.27.2:3000
APP_PORT=3000
```

`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` are passed into the image
build because Next.js embeds public environment variables in browser bundles.
