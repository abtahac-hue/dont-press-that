# Start here: GitHub + a game link without ChatGPT

You have the frontend, backend, database schema, and tests. Nothing needs to be copied from the ChatGPT site. Your new deployment will use your own hosting account and a fresh database, so old rooms do not carry over.

## 1. Download and open

1. Download `dont-press-that-source.zip`.
2. Right-click the ZIP in Windows → **Extract All**.
3. In VS Code select **File → Open Folder** and choose the extracted `dont-press-that` folder. You should see `package.json` directly inside it.
4. Open **Terminal → New Terminal**.
5. Install Node.js 22.13 or newer from https://nodejs.org/ if needed. Restart VS Code after installing it.
6. Check:

```sh
node --version
npm --version
```

If PowerShell says scripts are disabled, choose **Command Prompt** from VS Code's terminal dropdown rather than changing your system's execution policy.

## 2. Run it on your computer

Run each command separately, waiting for it to finish:

```sh
npx pnpm@11.25.0 install --frozen-lockfile
```

If npx asks to install pnpm, accept. Then:

```sh
npx pnpm@11.25.0 run db:local
npx pnpm@11.25.0 run dev
```

Open the local URL printed in the terminal. It is a development address, not a public link. Leave that terminal running. Create a room; open an incognito window for player two. The local D1 database is separate from the production database.

## 3. Put the source on GitHub

Create an empty repository at https://github.com/new:

- Repository name: `dont-press-that`
- Description: `A colorful multiplayer party game with private missions, shared spaceship controls, and server-checked scoring.`
- Choose **Public** if you want recruiters to view it.
- Do not initialize a README, .gitignore, or license there: the first two already exist in this folder.

Use the terminal commands below after creating the empty repository.

If you prefer GitHub Desktop, **skip creating the empty repository on the website first**. Instead, use GitHub Desktop → **File → Add local repository**, choose this folder, and select **create a repository here** if prompted. Commit the files and select **Publish repository**. Use the name `dont-press-that`, and clear **Keep this code private** if you want it public. Do not create another nested folder.

Install Git if needed and use these commands in the project folder. Replace the URL with the exact HTTPS URL copied from your empty GitHub repository:

```sh
git init
git add .
git commit -m "Build multiplayer spaceship party game"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/dont-press-that.git
git push -u origin main
```

If Git asks for your name/email, enter the identity you want associated with your commits, then retry the commit. Authentication may open your browser.

## 4. Create your public hosting account

Sign up/sign in at https://dash.cloudflare.com/. A domain purchase is not needed for a workers.dev address. Hosting plans have usage limits; this guide does not assume unlimited usage.

Stop the development terminal with **Ctrl + C** or open a second terminal in the same folder. Run:

```sh
npx pnpm@11.25.0 exec wrangler login
```

A browser opens to authorize your own Cloudflare account. Then create the database:

```sh
npx pnpm@11.25.0 exec wrangler d1 create dont-press-that-db
```

The output includes a `database_id` UUID. Open `wrangler.jsonc` in VS Code and replace only:

```json
"database_id": "00000000-0000-4000-8000-000000000000"
```

with your returned ID. Keep `binding` as `DB`, and keep `migrations_dir` as `drizzle`. Save the file. The database ID is configuration, not an API secret. Do not copy passwords, tokens, or browser cookies into source files.

## 5. Prepare the database and publish

Run separately:

```sh
npx pnpm@11.25.0 run db:remote
npx pnpm@11.25.0 run typecheck
npx pnpm@11.25.0 test
npx pnpm@11.25.0 run deploy
```

The migration command may ask you to confirm applying the migration. It creates the room table in your new database.

The deployment prints your actual link, shaped like:

```text
https://dont-press-that.YOUR-CLOUDFLARE-SUBDOMAIN.workers.dev
```

That is an example, not a link already registered for you. If Cloudflare asks you to choose a workers.dev subdomain, choose an available one. Your public game does not use ChatGPT sign-in.

## 6. Test with a friend

1. Open the deployed URL on two different devices.
2. Player one chooses a callsign and clicks **Create a room**.
3. Player two opens that same deployed URL, chooses a callsign, enters the code, and clicks **Join room**.
4. Player one launches. Check that both devices show the same controls and timer but different missions.
5. Tap controls on both devices. Check that changes appear on the other device and scores update.
6. Refresh one device. It should reconnect to its existing seat.
7. Finish the rounds and test **Play again**.

Copy your deployed URL into GitHub → repository **About** settings → **Website**. Add desktop and mobile screenshots to your README once you have them. Upload your updated `wrangler.jsonc` and any other changes with a new commit.

## 7. Update the game later

Edit the source in VS Code, then check and publish:

```sh
npx pnpm@11.25.0 run typecheck
npx pnpm@11.25.0 test
npx pnpm@11.25.0 run deploy
```

Commit/push the same changes to GitHub. A GitHub push alone does not redeploy this setup. If you change `db/schema.ts`, generate and review a new migration first with `npx pnpm@11.25.0 run db:generate`, then apply it with `npx pnpm@11.25.0 run db:remote` before deployment. Do not rewrite already applied migrations.

## If something fails

- **JSON error / HTML response:** Confirm you opened the deployed workers.dev URL, and the frontend and API were deployed together. This export has no ChatGPT login routes.
- **Room server unavailable:** Confirm the DB binding and database ID, and that `db:remote` completed successfully.
- **Database already exists:** Use `npx pnpm@11.25.0 exec wrangler d1 list` to find its ID instead of repeatedly creating it.
- **Room not found:** Both devices must use the same deployed site; check the code. Local and public rooms are separate.
- **Second window reconnects as you:** Use incognito or a separate browser profile/device.
- **Friends cannot open localhost:** Localhost is your own computer. Share the deployed workers.dev URL.
- **New edits do not appear:** Deploy again, then use Ctrl + Shift + R.

## Official references

- D1 commands: https://developers.cloudflare.com/workers/wrangler/commands/d1/
- D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare Vite deployment: https://developers.cloudflare.com/workers/vite-plugin/get-started/
- workers.dev links: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- Framework source: https://github.com/cloudflare/vinext
