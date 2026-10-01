import { env } from 'cloudflare:workers';
import { Room, Player, start, advance, act, view } from '../../../lib/game';
function db() { if (!env.DB)
    throw Error('Game server unavailable. Please try again.'); return env.DB; }
const fail = (error: string, status = 400) => Response.json({ error }, { status });
export async function POST(req: Request) {
    try {
        const b = await req.json() as Record<string, any>;
        const now = Date.now();
        if (b.action === 'create') {
            const name = String(b.name || '').trim().slice(0, 18);
            if (!name)
                return fail('Choose a callsign first.');
            const id = crypto.randomUUID();
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            for (let n = 0; n < 5; n++) {
                let code = '';
                for (let i = 0; i < 5; i++)
                    code += chars[Math.floor(Math.random() * chars.length)];
                const p: Player = { id, name, avatar: Number(b.avatar) % 6 || 0, score: 0, task: null, last: 0, completed: 0 };
                const r: Room = { code, host: id, players: [p], phase: 'lobby', round: 0, end: 0, panel: { planet: 0, symbol: 0, power: false, dial: 0 }, feed: [], event: '', seed: 0 };
                try {
                    await db().prepare('INSERT INTO rooms (code,state,version,expires) VALUES (?,?,0,?)').bind(code, JSON.stringify(r), now + 86400000).run();
                    return Response.json({ id, room: view(r, id, now) });
                }
                catch (e) {
                    if (n === 4)
                        throw e;
                }
            }
        }
        const code = String(b.code || '').toUpperCase();
        let joinId = crypto.randomUUID();
        for (let attempt = 0; attempt < 12; attempt++) {
            const row = await db().prepare('SELECT state,version,expires FROM rooms WHERE code=?').bind(code).first<{
                state: string;
                version: number;
                expires: number;
            }>();
            if (!row || row.expires < now)
                return fail('Room not found. Check the code or create a new room.', 404);
            const r: Room = JSON.parse(row.state);
            const before = JSON.stringify(r);
            advance(r, now);
            let id = String(b.id || '');
            let p = r.players.find(x => x.id === id);
            if (b.action === 'join') {
                if (r.phase !== 'lobby')
                    return fail('This crew already launched. Join a new room.');
                if (r.players.length >= 8)
                    return fail('Room full. Maximum 8 players.');
                const name = String(b.name || '').trim().slice(0, 18);
                if (!name)
                    return fail('Choose a callsign first.');
                id = joinId;
                p = { id, name, avatar: Number(b.avatar) % 6 || 0, score: 0, task: null, last: 0, completed: 0 };
                r.players.push(p);
            }
            else if (!p)
                return fail('Your seat is unavailable. Rejoin from the start screen.', 403);
            if (b.action === 'start') {
                if (id !== r.host)
                    return fail('Only the captain can launch.', 403);
                if (r.players.length < 2)
                    return fail('Invite at least one friend.');
                if (!['lobby', 'results', 'finished'].includes(r.phase))
                    return fail('Round already started.');
                if (r.phase === 'finished') {
                    r.round = 0;
                    for (const x of r.players) {
                        x.score = 0;
                        x.completed = 0;
                    }
                }
                start(r, now);
            }
            if (b.action === 'tap')
                act(r, p!, String(b.key), Number(b.value), now);
            if (!['join', 'start', 'tap', 'sync'].includes(b.action))
                return fail('Unknown action.');
            if (JSON.stringify(r) !== before) {
                const result = await db().prepare('UPDATE rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(r), code, row.version).run();
                if (!result.meta.changes)
                    continue;
            }
            return Response.json({ id, room: view(r, id, now) });
        }
        return fail('Busy control panel. Try tapping again.', 409);
    }
    catch (e) {
        console.error(e);
        return fail('Could not reach the ship. Try again shortly.', 503);
    }
}
