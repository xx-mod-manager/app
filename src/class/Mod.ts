export interface Mod {
  id: string;
  mod_id: string;
  name: string;
  description: string;
  downloadCount: number;
  repo: string;
  discussion_id: string | undefined;
}
