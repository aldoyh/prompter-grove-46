declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (buffer?: Uint8Array) => Database;
  }
  
  export interface Database {
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }
  
  export interface Statement {
    bind(params: unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }
  
  export default function initSqlJs(config: {
    locateFile: (file: string) => string;
  }): Promise<SqlJsStatic>;
}