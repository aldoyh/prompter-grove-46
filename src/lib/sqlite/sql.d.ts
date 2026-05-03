declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (buffer?: Uint8Array) => Database;
  }
  
  export interface Database {
    run(sql: string, params?: any[]): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }
  
  export interface Statement {
    bind(params: any[]): void;
    step(): boolean;
    getAsObject(): any;
    free(): void;
  }
  
  export default function initSqlJs(config: {
    locateFile: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
