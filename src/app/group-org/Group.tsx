import { Assignable } from "./Assignable";

export class Group {
  private _id: string;
  private members: Map<string, Assignable>;
  private name?: string;
  private leader?: Assignable;
  private size?: number;
  private notes?: string;

  constructor({
    id,
    name,
    leader,
    size,
    notes,
    members,
  }: {
    id: string;
    name?: string;
    leader?: Assignable;
    size?: number;
    notes?: string;
    members?: Map<string, Assignable>;
  }) {
    this._id = id;
    this.members = members || new Map<string, Assignable>();
    this.name = name;
    this.leader = leader;
    this.size = size;
    this.notes = notes;
  }

  getID() {
    return this._id;
  }

  getName() {
    return this.name;
  }

  getLeader() {
    return this.leader;
  }

  getSize() {
    return this.size;
  }

  getNotes() {
    return this.notes;
  }

  getAllMembers() {
    return this.members;
  }

  getMember(id: string) {
    return this.members.get(id);
  }
}

export function sortGroups(array: Array<Group>, sort?: string | undefined) {
  switch (sort) {
    case "name":
      array.sort((a, b) => a.getName()?.localeCompare(b.getName() || "") || 0);
      break;
    case "size":
      array.sort(
        (a, b) =>
          (b.getSize() || 0) -
          b.getAllMembers().size -
          ((a.getSize() || 0) - a.getAllMembers().size)
      );
      break;
    default:
  }
  return array;
}

export function filterGroups(array: Array<Group>, filter?: Array<string>) {
  if (filter)
    if (filter.length > 0) {
      let newArray = [...array];
      for (const f of filter) {
        switch (f) {
          case "unfull":
            newArray = [...newArray].filter(
              (value) =>
                value.getSize() == undefined ||
                (value.getSize() || 0) > value.getAllMembers().size
            );
            break;
        }
      }
      return newArray;
    }
  return array;
}
