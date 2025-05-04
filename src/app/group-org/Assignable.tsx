import { mapEquals } from "./helpers";

export class Assignable {
  private _id: string;
  private name: string;
  private contact?: Map<string, string>;
  private availability?: Map<string, string | boolean | number | Array<string>>;
  private location?: Map<string, string | boolean | number | Array<string>>;
  private affinity?: Map<string, string | boolean | number | Array<string>>;
  private miscellaneous?: Map<
    string,
    string | boolean | number | Array<string>
  >;
  private leader?: boolean;
  private size?: number | string;
  private notes?: string;

  constructor({
    id,
    name,
    contact,
    availability,
    location,
    affinity,
    miscellaneous,
    leader,
    size,
    notes,
  }: {
    id: string;
    name: string;
    contact?: Map<string, string>;
    availability?: Map<string, string | boolean | number | Array<string>>;
    location?: Map<string, string | boolean | number | Array<string>>;
    affinity?: Map<string, string | boolean | number | Array<string>>;
    miscellaneous?: Map<string, string | boolean | number | Array<string>>;
    leader?: boolean;
    size?: number | string;
    notes?: string;
  }) {
    this._id = id;
    this.name = name;
    this.contact = contact;
    this.availability = availability;
    this.location = location;
    this.affinity = affinity;
    this.miscellaneous = miscellaneous;
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

  getContact() {
    return this.contact;
  }

  getAvailability() {
    return this.availability;
  }

  getLocation() {
    return this.location;
  }

  getAffinity() {
    return this.affinity;
  }

  getMiscellaneous() {
    return this.miscellaneous;
  }

  getLeader() {
    return this.leader;
  }

  getSize() {
    switch (typeof this.size) {
      case "number":
      case "undefined":
        return this.size;
      default:
        return this.miscellaneous?.get(this.size) as number;
    }
  }

  getNotes() {
    return this.notes;
  }

  equals(other: Assignable) {
    return (
      this._id == other._id &&
      this.name == other.name &&
      mapEquals(
        this.contact || new Map<string, string>(),
        other.contact || new Map<string, string>()
      ) &&
      mapEquals(
        this.contact || new Map<string, string>(),
        other.contact || new Map<string, string>()
      ) &&
      mapEquals(
        this.location || new Map<string, string>(),
        other.location || new Map<string, string>()
      ) &&
      mapEquals(
        this.affinity || new Map<string, string>(),
        other.affinity || new Map<string, string>()
      ) &&
      mapEquals(
        this.miscellaneous || new Map<string, string>(),
        other.miscellaneous || new Map<string, string>()
      ) &&
      this.leader == other.leader &&
      this.size == other.size &&
      this.notes == other.notes
    );
  }
}

export function sortAssignables(array: Array<Assignable>, sort?: string) {
  switch (sort) {
    case "name":
      array.sort((a, b) => a.getName().localeCompare(b.getName()));
      break;
    case "leader":
      array.sort((a, b) => +!!b.getLeader() - +!!a.getLeader());
      break;
    case "size":
      array.sort((a, b) => (b.getSize() || -1) - (a.getSize() || -1));
      break;
    default:
  }
  return array;
}

export function filterAssignables(
  array: Array<Assignable>,
  filter?: Array<string>
) {
  if (filter)
    if (filter.length > 0) {
      let newArray = [...array];
      for (const f of filter) {
        switch (f) {
          case "leader":
            newArray = [...newArray].filter((value) => value.getLeader());
            break;
        }
      }
      return newArray;
    }
  return array;
}
