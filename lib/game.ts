export const colors = ['PURPLE', 'YELLOW', 'PINK', 'CYAN'];
export const symbols = ['★', '◆', '●', '✚'];
export type Task = {
    kind: string;
    target: number;
    other?: number;
    partner?: string;
    points: number;
    text: string;
};
export type Player = {
    id: string;
    name: string;
    avatar: number;
    score: number;
    task: Task | null;
    last: number;
    completed: number;
};
export type Room = {
    code: string;
    host: string;
    players: Player[];
    phase: string;
    round: number;
    end: number;
    panel: {
        planet: number;
        symbol: number;
        power: boolean;
        dial: number;
    };
    feed: string[];
    event: string;
    seed: number;
};
const pick = (n: number) => Math.floor(Math.random() * n);
export function task(r: Room, p: Player): Task {
    const kind = pick(r.round >= 3 ? 6 : r.round >= 2 ? 5 : 3);
    const target = pick(4);
    const partner = r.players.filter(x => x.id !== p.id)[pick(r.players.length - 1)];
    if (kind === 0)
        return { kind: 'planet', target, points: 10, text: `Make the planet ${colors[target]}.` };
    if (kind === 1)
        return { kind: 'symbol', target, points: 10, text: `Set the beacon to ${symbols[target]}.` };
    if (kind === 2)
        return { kind: 'power', target: r.panel.power ? 0 : 1, points: 10, text: `Turn the reactor ${r.panel.power ? 'OFF' : 'ON'}.` };
    if (kind === 3)
        return { kind: 'dial', target, points: 10, text: `Set the orbit dial to ${target + 1}.` };
    if (kind === 4)
        return { kind: 'combo', target, other: pick(4), points: 20, text: `Press LAUNCH while the planet is ${colors[target]}.` };
    return { kind: 'partner', target, partner: partner.id, points: 20, text: `Get ${partner.name} to set the beacon to ${symbols[target]}.` };
}
export function start(r: Room, now: number) { r.phase = 'playing'; r.round++; r.end = now + 60000; r.seed = pick(4); r.event = ''; for (const p of r.players)
    p.task = task(r, p); r.feed = ['New round. Same ship. Questionable crew.']; }
export function advance(r: Room, now: number) { if (r.phase === 'playing' && now >= r.end) {
    r.phase = r.round === 5 ? 'finished' : 'results';
    r.event = '';
    for (const p of r.players)
        p.task = null;
} if (r.phase === 'playing') {
    const elapsed = 60 - Math.ceil((r.end - now) / 1000);
    r.event = elapsed >= 25 && elapsed < 30 ? 'Freeze in ' + (30 - elapsed) + '…' : elapsed >= 30 && elapsed < 34 ? 'FREEZE' : elapsed >= 43 && elapsed < 48 ? 'Shuffle in ' + (48 - elapsed) + '…' : elapsed >= 48 && elapsed < 54 ? 'SHUFFLE' : '';
} }
export function act(r: Room, p: Player, key: string, value: number, now: number) {
    if (r.phase !== 'playing' || r.event === 'FREEZE' || now - p.last < 120)
        return;
    p.last = now;
    if (key === 'planet' && Number.isInteger(value) && value >= 0 && value < 4)
        r.panel.planet = value;
    else if (key === 'symbol' && Number.isInteger(value) && value >= 0 && value < 4)
        r.panel.symbol = value;
    else if (key === 'power')
        r.panel.power = !r.panel.power;
    else if (key === 'dial' && r.round >= 2)
        r.panel.dial = (r.panel.dial + 1) % 4;
    else if (key !== 'launch' || r.round < 2)
        return;
    for (const x of r.players) {
        const t = x.task;
        if (!t)
            continue;
        const done = t.kind === 'planet' ? key === 'planet' && r.panel.planet === t.target : t.kind === 'symbol' ? key === 'symbol' && r.panel.symbol === t.target : t.kind === 'power' ? key === 'power' && Number(r.panel.power) === t.target : t.kind === 'dial' ? key === 'dial' && r.panel.dial === t.target : t.kind === 'combo' ? p.id === x.id && key === 'launch' && r.panel.planet === t.target : t.kind === 'partner' ? p.id === t.partner && key === 'symbol' && r.panel.symbol === t.target : false;
        if (done) {
            x.score += t.points;
            x.completed++;
            x.task = task(r, x);
            r.feed.unshift(`${x.name} completed a task! +${t.points}`);
            r.feed = r.feed.slice(0, 5);
        }
    }
}
export function view(r: Room, id: string, now: number) { return { ...r, host: undefined, players: r.players.map(p => ({ ...p, id: undefined, last: undefined, task: p.id === id && p.task ? { ...p.task, partner: undefined } : null, isMe: p.id === id, isHost: p.id === r.host })), isHost: r.host === id, now }; }
