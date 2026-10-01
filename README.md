# Don’t Press That! ✳

**One ship. Too many captains.** A colorful browser party game for 2–8 players, joining from their own devices with a room code. Players receive private missions while changing the same live spaceship controls. No typing during rounds.

## Play the game

**[Launch Don’t Press That!](https://dont-press-that.abtahac.workers.dev)**

Create a room and share its code with your friends. Each player joins from their own browser.

## My contribution

I shaped the game concept and chose tap-based gameplay to keep rounds fast and accessible. I configured the development environment, resolved dependency installation issues, and tested two-player gameplay locally.
I also published the source on GitHub, configured the Cloudflare D1 database, and deployed the frontend and multiplayer API on Cloudflare Workers.
The initial implementation was generated with AI assistance. My work focused on product decisions, setup, troubleshooting, testing, and deployment.

## Gameplay

- A captain creates a room and shares its five-character code.
- Two to eight players choose callsigns and avatars, then board.
- Five rounds last 60 seconds each. The captain launches each round.
- Complete private missions by tapping the shared controls. Other players can change them too.
- Basic tasks award **10 points**. Launch and partner tasks award **20 points**.
- Round 2 unlocks the orbit dial and launch pad. Round 3 introduces partner missions.
- Countdown warnings precede temporary freezes and button shuffles.
- The highest total wins. Ties share the crown, and the crew receives a combined rating.

Play together in person or on an external voice call. There is no built-in voice chat.

## Quick start

Requires Node.js 22.13 or newer. Open a terminal in this project folder:

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npx pnpm@11.25.0 run db:local
npx pnpm@11.25.0 run dev
```

Open the local address printed by Vite. Use an incognito window for a second player, because one browser profile remembers one seat. Production deployment needs your own Cloudflare account and D1 database; follow **START-HERE.md**.

## Publish

GitHub hosts the source repository. Cloudflare Workers hosts the playable frontend and API, and Cloudflare D1 stores rooms. **GitHub Pages cannot run this server-backed game by itself.**

The game is deployed at https://dont-press-that.abtahac.workers.dev. Deployment instructions are available in START-HERE.md..  Replace this example with the actual URL in your GitHub repository's About section. You can later attach a domain you own. The standalone version has no ChatGPT account dependency or sign-in integration.

## Stack and architecture

| Layer | Implementation |
| --- | --- |
| Interface | React 19, TypeScript, responsive CSS, Lucide icons |
| Framework | Vinext, which implements the Next.js API surface on Vite |
| Backend | Cloudflare Worker HTTP endpoint at `/api/game` |
| Persistence | Cloudflare D1 / SQLite and Drizzle schema migrations |
| Synchronization | Polling after a 450 ms delay between responses, plus immediate updates following taps |
| Concurrency | Versioned compare-and-swap room updates with bounded retries |
| Scoring | Authoritative server checks; client scores are never accepted |
| Reconnection | Device-local opaque seat token; room data lives in D1 |

This implementation uses **near-real-time polling, not WebSockets**. Latency depends on network and request duration.

### Files to explore

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Start screen, room lobby, controls, missions, scoreboard, API requests |
| `app/globals.css` | Colors, layout, controls, responsive mobile styles |
| `lib/game.ts` | Task generation, actions, timers, scoring, private-state filtering |
| `app/api/game/route.ts` | Create/join/sync/start/tap API and versioned database updates |
| `db/schema.ts` | Room table definition |
| `drizzle/0000_red_longshot.sql` | Initial database migration |
| `worker.ts` | Worker framework entry point |
| `vite.config.ts` | Framework and Cloudflare build plugins |
| `wrangler.jsonc` | Worker name and your database binding |
| `scripts/test-game.ts` | Game logic checks |
| `START-HERE.md` | Windows-friendly setup, GitHub upload, and public deployment |
| `CODE-EXPLAINED.md` | How the code connects and how to customize it |

## Verification

```sh
npx pnpm@11.25.0 run typecheck
npx pnpm@11.25.0 test
npx pnpm@11.25.0 run build
```

Validation included TypeScript checks, game logic tests, a production build, and API checks for room creation, joining, host-only launch, private-task filtering, and simultaneous updates.

I tested two-player gameplay locally using separate browser sessions and confirmed that shared controls synchronized between them.

## Current scope

Designed for small groups of friends. There is no captain transfer, mid-match joining, in-game voice chat, or large-scale abuse protection. Room codes are playable for 24 hours; expired database rows are not automatically deleted in this version. Five-round games and rematches are supported. D1 polling consumes requests and database reads, so monitor your hosting usage before promoting a public demo widely.

Keep seat tokens private. A token grants control of its player. Public room codes are invitation shortcuts, not an authentication mechanism.

## Credits

Game developed with AI assistance. Framework and dependency credits belong to their respective projects. `THIRD-PARTY.md` links the main dependencies. Review and choose a project license before accepting outside contributions.
