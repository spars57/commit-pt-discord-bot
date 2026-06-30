export const PRIMARY_COLOR = '#79C0FF';

export type CustomEmoji = { name: string; id: string };
export type RoleEmoji = string | CustomEmoji;

export function formatEmoji(emoji: RoleEmoji): string {
  return typeof emoji === 'string' ? emoji : `<:${emoji.name}:${emoji.id}>`;
}

export const ROLES = {
  COMMIT_PLUS: '1514004224889983026',
  PROGRAMMER: '1519017947589382154',
  STAFF: '1427069200123433021',
} as const;

export const AUTO_ROLES_AREAS = [
  { name: 'Frontend', emoji: '🎨', roleId: '1411394991628226590' },
  { name: 'Backend', emoji: '⚙️', roleId: '1411395057180868618' },
  { name: 'Fullstack', emoji: '💻', roleId: '1411395117540966531' },
  { name: 'DevOps', emoji: '🛠️', roleId: '1411395166601875486' },
  { name: 'Cloud', emoji: '☁️', roleId: '1411399214348505138' },
  { name: 'Cybersecurity', emoji: '🛡️', roleId: '1411399289078419546' },
  { name: 'Mobile', emoji: '📱', roleId: '1411400198818762803' },
  { name: 'UI/UX', emoji: '🎨', roleId: '1411397938650812451' },
  { name: 'Data Science', emoji: '🔬', roleId: '1411398068288491741' },
  { name: 'Game Development', emoji: '🎮', roleId: '1411399373287592086' },
  { name: 'AI', emoji: '🤖', roleId: '1411398813922496663' },
] as const;

export const AUTO_ROLES_LANGUAGES: { name: string; emoji: RoleEmoji; roleId: string }[] = [
  {
    name: 'JavaScript',
    emoji: { name: 'js', id: '1417040985669632051' },
    roleId: '1411410683853017281',
  },
  {
    name: 'TypeScript',
    emoji: { name: 'ts', id: '1417040867285405758' },
    roleId: '1411410703075512461',
  },
  {
    name: 'Python',
    emoji: { name: 'python', id: '1417041073913724990' },
    roleId: '1411410605008752792',
  },
  {
    name: 'Java',
    emoji: { name: 'java', id: '1520735541639778345' },
    roleId: '1411410751154950355',
  },
  {
    name: 'Go',
    emoji: { name: 'go', id: '1417439898650148924' },
    roleId: '1411410786080919632',
  },
  {
    name: 'PHP',
    emoji: { name: 'php', id: '1417042175526703106' },
    roleId: '1520735995182714990',
  },
  {
    name: 'C/C++',
    emoji: { name: 'c_', id: '1520736246878437426' },
    roleId: '1411410723887648838',
  },
  {
    name: 'C#',
    emoji: { name: 'csharp', id: '1520900008017264814' },
    roleId: '1520899633612587129',
  },
  {
    name: 'Swift',
    emoji: { name: 'swift', id: '1521432039029473371' },
    roleId: '1521432182076477500',
  },
  {
    name: 'Kotlin',
    emoji: { name: 'kotlin', id: '1521432694767091873' },
    roleId: '1521432443775746148',
  },
];

export const CATEGORIES = {
  TICKETS: '1514018939460517968',
} as const;

export const CHANNELS = {
  WELCOME: '1411397291109253220',
  PRESENTATIONS: '1514273687996465203',
  GENERAL: '1411023329116164217',
  COMMIT_PLUS: '1431386665133543506',
  SUGGESTIONS: '1514008756256636978',
  ROLES_SELECTION: '1520733796427759757',
  ALERTS: '1520745325361496135',
  LEVELS: '1520771840505811084',
  TICKETS: '1514018565928255588',
  NEWS: '1520784852150915102',
} as const;
