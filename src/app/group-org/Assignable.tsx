import { mapEquals } from "./helpers";

export class Assignable {
  private _id: string;
  private name: string;
  private attributes: Map<string, string | boolean | number | Array<string>>;
  private attributeGroups: Map<string, string>;
  private leader?: boolean;
  private size?: number | string;
  private notes?: string;

  constructor({
    id,
    name,
    attributes,
    attributeGroups,
    leader,
    size,
    notes,
  }: {
    id: string;
    name: string;
    attributes?: Map<string, string | boolean | number | Array<string>>;
    attributeGroups?: Map<string, string>;
    leader?: boolean;
    size?: number | string;
    notes?: string;
  }) {
    this._id = id;
    this.name = name;
    this.attributes =
      attributes ||
      new Map<string, string | boolean | number | Array<string>>();
    this.attributeGroups = attributeGroups || new Map<string, string>();
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

  getAttributes() {
    return this.attributes;
  }

  getAttributeGroups() {
    return this.attributeGroups;
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
        return this.attributes.get(this.size) as number;
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
        this.attributes || new Map<string, string>(),
        other.attributes || new Map<string, string>()
      ) &&
      mapEquals(
        this.attributeGroups || new Map<string, string>(),
        other.attributeGroups || new Map<string, string>()
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
      array.sort((a, b) =>
        (a.getAttributes().get(sort || "") as string)?.localeCompare(
          b.getAttributes().get(sort || "") as string
        )
      );
  }
  return array;
}

/**Intersectional filtering: only return Assignables that meet all filter requirements */
export function filterAssignables(
  array: Array<Assignable>,
  filter?: Array<string>
) {
  /**ensure filter exists and has at least one element in it before processing */
  if (filter?.length) {
    let newArray = [...array];
    for (const f of filter) {
      switch (f) {
        case "leader":
          newArray = [...newArray].filter((value) => value.getLeader());
          break;
        default:
          newArray = [...newArray].filter((value) => {
            const data = value.getAttributes()?.get(f.split("|").shift() || "");
            return typeof data == "boolean"
              ? data
              : data == (f.split("|").pop() || "");
          });
      }
    }
    return newArray;
  }
  return array;
}
