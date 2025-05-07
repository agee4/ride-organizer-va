export class Group {
  private _id: string;
  private members: Set<string>;
  private name?: string;
  private leader?: string;
  private size?: number;
  private notes?: string;

  constructor({
    id,
    members,
    name,
    leader,
    size,
    notes,
  }: {
    id: string;
    members?: Set<string>;
    name?: string;
    leader?: string;
    size?: number;
    notes?: string;
  }) {
    this._id = id;
    this.members = members || new Set<string>();
    this.name = name;
    this.leader = leader;
    this.size = size;
    this.notes = notes;
  }

  getID() {
    return this._id;
  }

  getAllMembers() {
    return this.members;
  }

  getMember(id: string) {
    return this.members.has(id);
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

export interface GroupJSON {
  id: string;
  members?: Array<string>;
  name?: string;
  leader?: string;
  size?: number;
  notes?: string;
}
