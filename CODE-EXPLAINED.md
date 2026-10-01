# What the code does

## The browser is the controller

`app/page.tsx` renders the screens and listens for button presses. A player first sends their callsign and avatar to the server. The server responds with a room code and a random seat token. The browser remembers the seat token locally so refreshing reconnects that player.

While in a room, the browser sends `sync` requests. After each response it waits 450 milliseconds before requesting again. A tap sends its own request immediately. The browser displays the latest shared panel and its player's private task.

`app/globals.css` supplies the colors, layout, tactile control styles, and mobile breakpoints. Sound is generated with the browser's Web Audio API and can be muted.

## The server is the referee

`app/api/game/route.ts` receives five actions:

| Action | Meaning |
| --- | --- |
| `create` | Create a random room code and captain seat |
| `join` | Add a player to an unstarted room, up to eight |
| `sync` | Return the latest room and this player's private task |
| `start` | Captain starts the next round or a rematch |
| `tap` | Apply a legal panel action and check completed tasks |

The server checks the seat token, player count, phase, captain permissions, and permitted controls. The browser cannot send an arbitrary score. The server controls the timer and awards points from verified actions.

## The game engine decides what happens

`lib/game.ts` contains:

- `task()` — choose a random task appropriate to the round.
- `start()` — increment the round, set its deadline, and assign tasks.
- `advance()` — calculate events and move an expired round to results.
- `act()` — change a control, then check tasks against the updated panel.
- `view()` — remove other players' tasks and all seat identifiers before returning state.

Basic tasks can complete when another player makes the required shared change. Launch tasks require their owner to press launch in the correct state. Partner tasks require the named other player to act. Completed tasks are replaced immediately. During a freeze, actions do not change the panel. Shuffling changes the positions of labeled buttons, so accessibility does not depend on color alone.

The round deadline is calculated on the server. There is no always-running timer process: incoming requests advance the state, while each browser displays a countdown adjusted to server time.

## The database holds the shared truth

`db/schema.ts` defines one room table containing the code, serialized room state, revision, and expiry. D1 persists it outside the browser. SQL queries use bound values.

Two players may tap simultaneously. Each update includes the revision that was read. If another request changed that revision first, the update fails its compare-and-swap condition and retries from the newest state. This prevents one device's update from erasing another's. Retries are bounded so overload returns an error rather than looping forever.

Room codes expire after 24 hours. This version does not schedule deletion of expired rows.

## Customization

| Change | Edit |
| --- | --- |
| Game title and screen copy | `app/page.tsx`, `app/layout.tsx` |
| Palette | CSS variables at the top of `app/globals.css` |
| Avatars | `avatars` in `app/page.tsx` |
| Mission wording/types | `task()` in `lib/game.ts` |
| Task points | `points` in `task()` |
| Round duration | `start()` / `advance()` in `lib/game.ts`; also update the displayed copy |
| Number of rounds | Final-round check in `advance()` plus UI/rules copy |
| Worker URL name | `name` in `wrangler.jsonc` |

When adding a task type, update both its generation and its completion check. Add a meaningful test to `scripts/test-game.ts`, then verify it from two devices.

## How to describe it honestly

“This is an AI-assisted multiplayer web game that I customized and deployed. It has server-checked scoring, private player missions, room-code joining, persistent room state, and near-real-time polling. I can explain how the frontend, API, game engine, and database work together.”

Use that description only for the parts you actually reviewed and completed. Do not call it a WebSocket implementation or claim the template/framework was written from scratch.
