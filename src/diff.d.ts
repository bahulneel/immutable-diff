import { List, Map, Record as ImmutableRecord, Collection, Seq } from 'immutable';

export type DiffOp =
  | { op: 'add'; path: (string | number)[]; value: any }
  | { op: 'remove'; path: (string | number)[] }
  | { op: 'replace'; path: (string | number)[]; value: any };

export type ImmutableType =
  | Map<any, any>
  | List<any>
  | ImmutableRecord<any>
  | Collection<any, any>
  | Seq<any, any>
  | any;

/**
 * Computes a diff between two Immutable.js data structures (Map, List, Record, etc.).
 * @param a The first value (Immutable.js structure or primitive)
 * @param b The second value (Immutable.js structure or primitive)
 * @param path (optional) The path prefix for the diff (used internally for recursion)
 * @returns A List of diff operations (add, remove, replace)
 */
declare function diff(
  a: ImmutableType,
  b: ImmutableType,
  path?: (string | number)[]
): List<DiffOp>;

export default diff; 