"use client";

import {
  ActionDispatch,
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

/* type RecursiveMap<K, V> = Map<K, V | RecursiveMap<K, V>>; */

type ArrayReducerAction<V> =
  | { type: "create"; value: V }
  | { type: "delete"; value: V }
  | { type: "replace"; value: Array<V> };

function arrayReducer<V>() {
  return (itemArray: Array<V>, action: ArrayReducerAction<V>) => {
    switch (action.type) {
      case "create": {
        return new Array(...itemArray, action.value);
      }
      case "delete": {
        const newCollection = new Array(...itemArray);
        /* newCollection(action.value); */
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

function useArrayReducer<V>(array?: Array<V>) {
  return useReducer(arrayReducer<V>(), array || new Array<V>());
}

type MapReducerAction<K, V> =
  | { type: "create"; key: K; value: V }
  | { type: "delete"; key: K }
  | { type: "replace"; value: Map<K, V> };

function mapReducer<K, V>() {
  return (itemMap: Map<K, V>, action: MapReducerAction<K, V>) => {
    switch (action.type) {
      case "create": {
        return new Map([...itemMap.entries()]).set(action.key, action.value);
      }
      case "delete": {
        const newCollection = new Map([...itemMap.entries()]);
        newCollection.delete(action.key);
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

function useMapReducer<K, V>(map?: Map<K, V>) {
  return useReducer(mapReducer<K, V>(), map || new Map<K, V>());
}

type SetReducerAction<V> =
  | { type: "create"; value: V }
  | { type: "delete"; value: V }
  | { type: "replace"; value: Set<V> };

function setReducer<V>() {
  return (itemSet: Set<V>, action: SetReducerAction<V>) => {
    switch (action.type) {
      case "create": {
        return new Set(itemSet).add(action.value);
      }
      case "delete": {
        const newCollection = new Set(itemSet);
        newCollection.delete(action.value);
        return newCollection;
      }
      case "replace": {
        return action.value;
      }
      default:
        throw Error("Unknown action");
    }
  };
}

function useSetReducer<V>(set?: Set<V>) {
  return useReducer(setReducer<V>(), set || new Set<V>());
}

class Assignable {
  private _id: string;
  private name: string;
  private contact?: Map<string, string>;
  private availability?: Map<string, string | boolean | number | string[]>;
  private location?: Map<string, string | boolean | number | string[]>;
  private affinity?: Map<string, string | boolean | number | string[]>;
  private miscellaneous?: Map<string, string | boolean | number | string[]>;
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
    availability?: Map<string, string | boolean | number | string[]>;
    location?: Map<string, string | boolean | number | string[]>;
    affinity?: Map<string, string | boolean | number | string[]>;
    miscellaneous?: Map<string, string | boolean | number | string[]>;
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
}

const AssignableComponent = ({
  data,
  assignableCallback,
}: {
  data: Assignable;
  assignableCallback: (assignable: Assignable) => void;
}) => {
  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      <ul>
        <div className="flex flex-row place-content-between font-bold">
          {data.getName()}
          <button
            className="rounded-sm border px-1"
            onClick={() => assignableCallback(data)}
          >
            &times;
          </button>
        </div>
        <ul className="flex flex-row place-content-between text-xs italic">
          <li>{data.getID()}</li>
          <li>{data.getLeader() && "Leader"}</li>
        </ul>
        <ul className="m-1">
          {data.getContact() &&
            Array.from(data.getContact() as Map<string, string>)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  <span>{value}</span>
                </li>
              ))}
          {data.getAvailability() &&
            Array.from(
              data.getAvailability() as Map<
                string,
                string | number | boolean | string[]
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getLocation() &&
            Array.from(
              data.getLocation() as Map<
                string,
                string | number | boolean | string[]
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getAffinity() &&
            Array.from(
              data.getAffinity() as Map<
                string,
                string | number | boolean | string[]
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {data.getMiscellaneous() &&
            Array.from(
              data.getMiscellaneous() as Map<
                string,
                string | number | boolean | string[]
              >
            )
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
        </ul>
        {data.getSize() != undefined && (
          <li className="m-1 flex flex-row place-content-between gap-1">
            <span>Size:</span>
            <span>{data.getSize()}</span>
          </li>
        )}
        {data.getNotes() && (
          <textarea
            className="m-1 rounded-sm border bg-cyan-300 dark:bg-cyan-700"
            disabled
            defaultValue={data.getNotes()}
          />
        )}
      </ul>
    </div>
  );
};

function sortAssignables(array: Assignable[], sort?: string) {
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

function filterAssignables(array: Assignable[], filter?: string[]) {
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

class Group {
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

const GroupComponent = ({
  data,
  deleteGroupCallback,
  addGroupMember,
  removeGroupMember,
}: {
  data: Group;
  deleteGroupCallback: (group: Group) => void;
  addGroupMember: (group: Group) => void;
  removeGroupMember: (group: Group, member: Assignable) => void;
}) => {
  const leader = data.getLeader();
  const size = data.getSize() || -1;

  const removeMember = (member: Assignable) => {
    removeGroupMember(data, member);
  };

  return (
    <div className="my-1 max-w-[496px] rounded-md bg-neutral-400 p-2 dark:bg-neutral-600">
      <ul>
        <li className="flex flex-row place-content-between font-bold">
          {data.getName() || leader?.getName() || data.getID()}
          <button
            className="rounded-sm border px-1"
            onClick={() => deleteGroupCallback(data)}
          >
            &times;
          </button>
        </li>
        <li className="text-xs italic">{data.getID()}</li>
        {!!leader && <GroupMemberComponent member={leader} />}
        <ul className="text-center">
          {data.getSize() != undefined && (
            <li>Size: {size - data.getAllMembers().size}</li>
          )}
          {Array.from(data.getAllMembers().values()).map((value) => (
            <GroupMemberComponent
              member={value}
              removeMember={removeMember}
              key={value.getID()}
            />
          ))}
          {(!data.getSize() || size > data.getAllMembers().size) && (
            <li>
              <button
                className="rounded-sm border"
                onClick={() => addGroupMember(data)}
              >
                +
              </button>
            </li>
          )}
        </ul>
        {data.getNotes() && (
          <textarea
            className="rounded-sm border bg-cyan-300 dark:bg-cyan-700"
            disabled
            defaultValue={data.getNotes()}
          />
        )}
      </ul>
    </div>
  );
};

const GroupMemberComponent = ({
  member,
  removeMember,
}: {
  member: Assignable;
  removeMember?: (member: Assignable) => void;
}) => {
  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      <ul>
        <li className="flex flex-row place-content-between font-bold">
          {member.getName()}
          {removeMember && (
            <button
              className="rounded-sm border px-1"
              onClick={() => removeMember(member)}
            >
              &times;
            </button>
          )}
        </li>
        <li className="text-xs italic">{member.getID()}</li>
        <ul className="m-1">
          {member.getContact() &&
            Array.from(member.getContact() as Map<string, string>).map(
              ([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  <span>{value}</span>
                </li>
              )
            )}
          {member.getAvailability() &&
            Array.from(member.getAvailability() as Map<string, string>)
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
          {member.getLocation() &&
            Array.from(member.getLocation() as Map<string, string>)
              .filter(
                ([, value]) =>
                  (Array.isArray(value) && value.length > 0) || value
              )
              .map(([key, value]) => (
                <li
                  className="flex flex-row place-content-between gap-1"
                  key={key}
                >
                  <span>{key}:</span>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-right">{value}</span>
                  )}
                </li>
              ))}
        </ul>
      </ul>
    </div>
  );
};

function sortGroups(array: Group[], sort?: string | undefined) {
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

function filterGroups(array: Group[], filter?: string[]) {
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

class Field {
  private name: string;
  private type: string;
  private group: string;
  private required: boolean;
  private options: Set<string>;
  private multiple: boolean;
  private preset: boolean;

  constructor({
    name,
    type,
    group,
    required,
    options,
    multiple,
    preset,
  }: {
    name: string;
    type: string;
    group: string;
    required?: boolean;
    options?: Set<string>;
    multiple?: boolean;
    preset?: boolean;
  }) {
    this.name = name;
    this.type = type;
    this.group = group;
    this.required = required || false;
    this.options = options || new Set<string>();
    this.multiple = multiple || false;
    this.preset = preset || false;
  }

  getName() {
    return this.name;
  }

  getType() {
    return this.type;
  }

  getGroup() {
    return this.group;
  }

  getRequired() {
    return this.required;
  }

  getOptions() {
    return this.options;
  }

  getMultiple() {
    return this.multiple;
  }

  getPreset() {
    return this.preset;
  }

  getPlaceholderName() {
    return (
      this.name +
      (this.required ? "*" : "") +
      (this.group != "miscellaneous" ? " (" + this.group + ")" : "") +
      (" [" + this.type + "]")
    );
  }

  equals(other: Field | undefined) {
    function optionsEquals(first: Set<string>, second: Set<string>) {
      return first.symmetricDifference(second).size == 0;
    }
    return (
      !!other &&
      this.name == other.name &&
      this.type == other.type &&
      this.group == other.group &&
      this.required == other.required &&
      optionsEquals(this.getOptions(), other.getOptions()) &&
      this.multiple == other.multiple &&
      this.preset == other.preset
    );
  }
}

class Setting {
  private name?: string;
  private assignableIDSource: string;
  private assignableFields: Map<string, Field>;
  private assignableNotes: boolean;
  private useLeader: boolean;
  private groupIDSource: string;
  private groupCustomName: boolean;
  private groupUseSize: boolean;
  private groupSizeSource: string;
  private groupNotes: boolean;

  constructor({
    name,
    assignableIDSource,
    assignableFields,
    assignableNotes,
    useLeader,
    groupIDSource,
    groupCustomName,
    groupUseSize,
    groupSizeSource,
    groupNotes,
  }: {
    name?: string;
    assignableIDSource?: string;
    assignableFields?: Map<string, Field>;
    assignableNotes?: boolean;
    useLeader?: boolean;
    groupIDSource?: string;
    groupCustomName?: boolean;
    groupUseSize?: boolean;
    groupSizeSource?: string;
    groupNotes?: boolean;
  }) {
    this.name = name;
    this.assignableIDSource = assignableIDSource || "name";
    this.assignableFields = assignableFields || new Map<string, Field>();
    this.assignableNotes = assignableNotes || false;
    this.useLeader = useLeader || false;
    this.groupIDSource = groupIDSource || "id";
    this.groupCustomName = groupCustomName || false;
    this.groupUseSize = groupUseSize || false;
    this.groupSizeSource = groupSizeSource || "groupsize";
    this.groupNotes = groupNotes || false;
  }

  getName() {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  getAssignableIDSource() {
    return this.assignableIDSource;
  }

  getAssignableFields() {
    return this.assignableFields;
  }

  getAssignableNotes() {
    return this.assignableNotes;
  }

  getUseLeader() {
    return this.useLeader;
  }

  getGroupIDSource() {
    return this.groupIDSource;
  }

  getGroupCustomName() {
    return this.groupCustomName;
  }

  getGroupUseSize() {
    return this.groupUseSize;
  }

  getGroupSizeSource() {
    return this.groupSizeSource;
  }

  getGroupNotes() {
    return this.groupNotes;
  }

  equals(other: Setting | undefined) {
    function fieldsEquals(
      first: Map<string, Field>,
      second: Map<string, Field>
    ) {
      if (first.size != second.size) return false;
      for (const [key, value] of first) {
        if (!value.equals(second.get(key))) return false;
      }
      return true;
    }
    return (
      other &&
      this.assignableIDSource == other.assignableIDSource &&
      fieldsEquals(this.assignableFields, other.assignableFields) &&
      this.assignableNotes == other.assignableNotes &&
      this.useLeader == other.useLeader &&
      this.groupIDSource == other.groupIDSource &&
      this.groupCustomName == other.groupCustomName &&
      this.groupUseSize == other.groupUseSize &&
      this.groupSizeSource == other.groupSizeSource &&
      this.groupNotes == other.groupNotes
    );
  }
}

const defaultSettings = new Setting({ name: "Default" });

const bereanCollegeRidesSettings = new Setting({
  name: "College Rides",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Main Rides",
      new Field({
        name: "Main Rides",
        type: "select",
        group: "availability",
        options: new Set<string>([
          "Friday",
          "Sunday First",
          "Sunday Second",
          "Sunday Third",
        ]),
        multiple: true,
        required: true,
        preset: true,
      }),
    ],
    [
      "Address",
      new Field({
        name: "Address",
        type: "text",
        group: "location",
        required: true,
        preset: true,
      }),
    ],
    [
      "Campus",
      new Field({
        name: "Campus",
        type: "select",
        group: "location",
        options: new Set<string>(["UCI", "CSULB", "Biola", "Chapman"]),
        preset: true,
      }),
    ],
    [
      "Year",
      new Field({
        name: "Year",
        type: "select",
        group: "affinity",
        options: new Set<string>(["Freshman", "Sophomore", "Junior", "Senior"]),
        preset: true,
      }),
    ],
    [
      "Backup Rides",
      new Field({
        name: "Backup Rides",
        type: "select",
        group: "availability",
        options: new Set<string>([
          "Friday",
          "Sunday First",
          "Sunday Second",
          "Sunday Third",
        ]),
        multiple: true,
        preset: true,
      }),
    ],
  ]),
  assignableNotes: true,
  useLeader: true,
  groupIDSource: "leader",
  groupUseSize: true,
  groupSizeSource: "leadersize",
});

const bibleStudyTablesSettings = new Setting({
  name: "Bible Study Tables",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "select",
        group: "affinity",
        options: new Set<string>(["College", "BAM", "FAM"]),
        preset: true,
      }),
    ],
  ]),
  useLeader: true,
  groupIDSource: "name",
  groupCustomName: true,
  groupUseSize: true,
});

const noLeaderGroupsSettings = new Setting({
  name: "No Leader Groups",
  assignableIDSource: "Email",
  assignableFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        required: true,
        preset: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "select",
        group: "affinity",
        options: new Set<string>(["College", "BAM", "FAM"]),
        preset: true,
      }),
    ],
  ]),
});

const presetList = [
  defaultSettings,
  bereanCollegeRidesSettings,
  bibleStudyTablesSettings,
  noLeaderGroupsSettings,
  new Setting({
    name: "test",
    assignableIDSource: "name",
    useLeader: true,
    groupIDSource: "leader",
  }),
];

const PresetForm = ({
  settings,
  settingsCallback,
  presets,
  presetsCallback,
}: {
  settings: Setting;
  settingsCallback: Dispatch<SetStateAction<Setting>>;
  presets: Map<string | undefined, Setting>;
  presetsCallback: ActionDispatch<
    [action: MapReducerAction<string | undefined, Setting>]
  >;
}) => {
  const [preset, setPreset] = useState<string>(settings.getName() || "Custom");

  const [newPresetName, setNewPresetName] = useState<string>("");

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    if (preset == "Custom") {
      settings.setName(newPresetName);
      presetsCallback({
        type: "create",
        key: newPresetName,
        value: settings,
      });
      settingsCallback(settings);
      setNewPresetName("");
      setPreset(newPresetName);
    } else settingsCallback(presets.get(preset) || defaultSettings);
  };

  useEffect(() => {
    setPreset(settings.getName() || "Custom");
  }, [settings]);

  const invalidNewPresetName =
    preset == "Custom" &&
    !newPresetName.trim() &&
    !presets.has(newPresetName.trim());

  return (
    <form className="my-1 flex flex-col" onSubmit={submitForm}>
      <label className="text-center">Preset</label>
      <div className="flex flex-row place-content-center">
        <div className="flex flex-col place-content-center">
          <select
            className="rounded-sm border"
            name="presets"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            {Array.from(presets.values()).map((value) => (
              <option
                className="dark:text-black"
                value={value.getName()}
                key={value.getName()}
              >
                {value.getName()}
              </option>
            ))}
            <option className="dark:text-black" value={"Custom"}>
              {"Custom"}
            </option>
          </select>
          {preset == "Custom" && (
            <input
              className="rounded-sm border"
              type="text"
              name="newAssignableField"
              value={newPresetName}
              placeholder="Preset Name*"
              onChange={(e) => setNewPresetName(e.target.value)}
            />
          )}
        </div>
        <button
          className={
            "rounded-full border px-1" +
            (invalidNewPresetName || settings.equals(presets.get(preset))
              ? " text-neutral-500"
              : "")
          }
          type="submit"
          disabled={
            invalidNewPresetName || settings.equals(presets.get(preset))
          }
        >
          {preset == "Custom" ? "Save" : "Use"}
        </button>
      </div>
    </form>
  );
};

const SettingsForm = ({
  settings,
  settingsCallback,
}: {
  settings: Setting;
  settingsCallback: Dispatch<SetStateAction<Setting>>;
}) => {
  const settingsFormRef = useRef(null);

  const [assignableIDSource, setAssignableIDSource] = useState<string>(
    settings.getAssignableIDSource()
  );
  const [assignableNotes, setAssignableNotes] = useState<boolean>(
    settings.getAssignableNotes()
  );
  const [useLeader, setUseLeader] = useState<boolean>(settings.getUseLeader());
  const updateUseLeader = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      setGroupSizeSource("groupsize");
      if (groupIDSource == "leader") setGroupIDSource("id");
    }
    setUseLeader(e.target.checked);
  };
  const [groupIDSource, setGroupIDSource] = useState<string>(
    settings.getGroupIDSource()
  );
  const [groupCustomName, setGroupCustomName] = useState<boolean>(
    settings.getGroupCustomName()
  );
  const updateGroupCustomName = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked && groupIDSource == "name") setGroupIDSource("id");
    setGroupCustomName(e.target.checked);
  };
  const [groupUseSize, setGroupUseSize] = useState<boolean>(
    settings.getGroupUseSize()
  );
  const [groupSizeSource, setGroupSizeSource] = useState<string>(
    settings.getGroupSizeSource()
  );
  const [groupNotes, setGroupNotes] = useState<boolean>(
    settings.getGroupNotes()
  );

  const [fieldName, setFieldName] = useState<string>("");
  const [fieldGroup, setFieldGroup] = useState<string>("miscellaneous");
  const updateFieldGroup = (fieldGroup: string) => {
    setFieldGroup(fieldGroup);
    updateFieldType("text");
  };
  const [fieldType, setFieldType] = useState<string>("text");
  const updateFieldType = (newFieldType: string) => {
    if (fieldType == "select") {
      setSelectOptions({ type: "replace", value: new Set<string>() });
      setMultipleSelect(false);
    }
    if (["checkbox"].includes(newFieldType)) setRequiredField(false);
    setFieldType(newFieldType);
  };
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const [assignableFields, assignableFieldsDispatch] = useMapReducer<
    string,
    Field
  >(settings.getAssignableFields());
  const createField = () => {
    const cleanedFieldName = fieldName.trim().toLocaleLowerCase();
    if (
      !["", "id", "name", ...assignableFields.keys()].includes(cleanedFieldName)
    ) {
      assignableFieldsDispatch({
        type: "create",
        key: fieldName,
        value: new Field({
          name: fieldName,
          type: fieldType,
          group: fieldGroup,
          required: requiredField,
          options: fieldType == "select" ? selectOptions : undefined,
          multiple: fieldType == "select" ? multipleSelect : undefined,
          preset: true,
        }),
      });
      setFieldName("");
      setFieldGroup("miscellaneous");
      setFieldType("text");
      setRequiredField(false);
      setOptionName("");
      setSelectOptions({ type: "replace", value: new Set<string>() });
      setMultipleSelect(false);
      setShowAddInputField(false);
    }
  };
  const deleteField = (field: string) => {
    assignableFieldsDispatch({
      type: "delete",
      key: field,
    });
    if (field == assignableIDSource) setAssignableIDSource("id");
    if (field == groupSizeSource) setGroupSizeSource("groupsize");
  };

  const [selectOptions, setSelectOptions] = useSetReducer<string>();
  const [optionName, setOptionName] = useState<string>("");
  const [multipleSelect, setMultipleSelect] = useState<boolean>(false);
  const createOption = () => {
    const cleanedOptionName = optionName.trim().toLocaleLowerCase();
    if (!["", "id", "name", ...selectOptions].includes(cleanedOptionName)) {
      setSelectOptions({ type: "create", value: optionName });
      setOptionName("");
    }
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    settingsCallback(
      new Setting({
        assignableIDSource: assignableIDSource,
        assignableFields: assignableFields,
        assignableNotes: assignableNotes,
        useLeader: useLeader,
        groupIDSource: groupIDSource,
        groupCustomName: groupCustomName,
        groupUseSize: groupUseSize,
        groupSizeSource: groupUseSize ? groupSizeSource : "",
        groupNotes: groupNotes,
      })
    );
  };

  useEffect(() => {
    setAssignableIDSource(settings.getAssignableIDSource());
    assignableFieldsDispatch({
      type: "replace",
      value: settings.getAssignableFields(),
    });
    setAssignableNotes(settings.getAssignableNotes());
    setUseLeader(settings.getUseLeader());
    setGroupIDSource(settings.getGroupIDSource());
    setGroupCustomName(settings.getGroupCustomName());
    setGroupUseSize(settings.getGroupUseSize());
    setGroupSizeSource(settings.getGroupSizeSource());
    setGroupNotes(settings.getGroupNotes());
  }, [settings, assignableFieldsDispatch]);

  const [showAddInputField, setShowAddInputField] = useState<boolean>(false);
  const [showAssignableFields, setShowAssignableFields] =
    useState<boolean>(false);

  const settingsUnaltered = settings.equals(
    new Setting({
      assignableIDSource: assignableIDSource,
      assignableFields: assignableFields,
      assignableNotes: assignableNotes,
      useLeader: useLeader,
      groupIDSource: groupIDSource,
      groupCustomName: groupCustomName,
      groupUseSize: groupUseSize,
      groupSizeSource: groupSizeSource,
      groupNotes: groupNotes,
    })
  );

  return (
    <form
      className="my-1 flex flex-col"
      onSubmit={submitForm}
      ref={settingsFormRef}
    >
      <label className="text-center">Settings</label>
      <div className="flex flex-row">
        <div className="flex flex-col gap-1">
          <h1 className="text-center">Assignable</h1>
          <label className="flex flex-row place-content-between gap-1">
            ID Source:
            <select
              className="rounded-sm border"
              name="idsource"
              value={assignableIDSource}
              onChange={(e) => setAssignableIDSource(e.target.value)}
            >
              <option className="text-black" value="id">
                ID Field
              </option>
              <option className="text-black" value="name">
                Name
              </option>
              {[...assignableFields.entries()]
                .filter(
                  ([, value]) =>
                    value.getRequired() &&
                    !["checkbox", "select"].includes(value.getType())
                )
                .map(([key]) => (
                  <option className="text-black" key={key} value={key}>
                    {key}
                  </option>
                ))}
            </select>
          </label>
          <hr />
          <ul className="flex flex-col border p-1">
            <label className="flex flex-row place-content-between gap-1">
              <span>
                Fields{" "}
                <span className="rounded-full bg-cyan-500 px-1">
                  {assignableFields.size}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowAssignableFields(!showAssignableFields)}
              >
                {showAssignableFields ? <>&uarr;</> : <>&darr;</>}
              </button>
            </label>
            {showAssignableFields && (
              <>
                <hr />
                {[...assignableFields.entries()].map(([key, value]) => (
                  <li key={key}>
                    <label className="flex flex-row place-content-between gap-1">
                      {value.getPlaceholderName()}
                      <button
                        className="rounded-sm border px-1"
                        onClick={() => deleteField(key)}
                      >
                        &times;
                      </button>
                    </label>
                    {value.getType() == "select" && (
                      <ul>
                        {Array.from(value.getOptions()).map((option) => (
                          <li
                            key={option}
                            className={
                              "list-inside " +
                              (value.getMultiple()
                                ? "list-[square]"
                                : "list-[circle]")
                            }
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    <hr />
                  </li>
                ))}
                <li className="flex flex-col border p-1">
                  <label className="flex flex-row place-content-between">
                    Add Input Field
                    <button
                      type="button"
                      onClick={() => setShowAddInputField(!showAddInputField)}
                    >
                      {showAddInputField ? <>&uarr;</> : <>&darr;</>}
                    </button>
                  </label>
                  {showAddInputField && (
                    <>
                      <input
                        className="rounded-sm border"
                        type="text"
                        name="newAssignableField"
                        value={fieldName}
                        placeholder="Field Name*"
                        onChange={(e) => setFieldName(e.target.value)}
                      />
                      <label className="flex flex-row place-content-between">
                        Field Group:
                        <select
                          className="rounded-sm border"
                          name="fieldgroup"
                          value={fieldGroup}
                          onChange={(e) => updateFieldGroup(e.target.value)}
                        >
                          <option
                            className="dark:text-black"
                            value="miscellaneous"
                          >
                            ---
                          </option>
                          <option className="dark:text-black" value="contact">
                            Contact
                          </option>
                          <option
                            className="dark:text-black"
                            value="availability"
                          >
                            Availability
                          </option>
                          <option className="dark:text-black" value="location">
                            Location
                          </option>
                          <option className="dark:text-black" value="affinity">
                            Affinity
                          </option>
                        </select>
                      </label>

                      <label className="flex flex-row place-content-between">
                        Field Type:
                        <select
                          className="rounded-sm border"
                          name="fieldtype"
                          value={fieldType}
                          onChange={(e) => updateFieldType(e.target.value)}
                        >
                          {fieldGroup == "contact" && (
                            <>
                              <option className="dark:text-black" value="email">
                                Email
                              </option>
                              <option className="dark:text-black" value="tel">
                                Phone
                              </option>
                            </>
                          )}
                          <option className="dark:text-black" value="text">
                            Text
                          </option>
                          {[
                            "miscellaneous",
                            "availability",
                            "location",
                            "affinity",
                          ].includes(fieldGroup) && (
                            <>
                              <option
                                className="dark:text-black"
                                value="number"
                              >
                                Number
                              </option>
                              <option
                                className="dark:text-black"
                                value="checkbox"
                              >
                                Checkbox
                              </option>
                              <option
                                className="dark:text-black"
                                value="select"
                              >
                                Select
                              </option>
                            </>
                          )}
                        </select>
                      </label>
                      {fieldType == "select" && (
                        <div className="flex flex-col border">
                          <div>Select Options</div>
                          <hr />
                          <ul>
                            {[...selectOptions].map((value) => (
                              <li
                                className="flex flex-row place-content-between"
                                key={value}
                              >
                                {value}
                                <button
                                  className="rounded-sm border px-1"
                                  onClick={() =>
                                    setSelectOptions({
                                      type: "delete",
                                      value: value,
                                    })
                                  }
                                >
                                  &times;
                                </button>
                              </li>
                            ))}
                          </ul>
                          <input
                            className="rounded-sm border"
                            type="text"
                            name="newSelectOption"
                            value={optionName}
                            placeholder="Option Name*"
                            onChange={(e) => setOptionName(e.target.value)}
                          />
                          <button
                            className="rounded-sm border px-1"
                            type="button"
                            onClick={createOption}
                          >
                            Add Option
                          </button>
                          <label className="flex flex-row place-content-between">
                            Multiple
                            <input
                              type="checkbox"
                              checked={multipleSelect}
                              onChange={(e) =>
                                setMultipleSelect(e.target.checked)
                              }
                            />
                          </label>
                        </div>
                      )}
                      {!["checkbox", "select"].includes(fieldType) && (
                        <label className="flex flex-row place-content-between">
                          Required
                          <input
                            type="checkbox"
                            checked={requiredField}
                            onChange={(e) => setRequiredField(e.target.checked)}
                          />
                        </label>
                      )}
                      <button
                        className="rounded-sm border px-1"
                        type="button"
                        onClick={createField}
                      >
                        Add Field
                      </button>
                    </>
                  )}
                </li>
              </>
            )}
          </ul>
          <hr />
          <label className="flex flex-row place-content-between">
            Notes
            <input
              type="checkbox"
              checked={assignableNotes}
              onChange={(e) => setAssignableNotes(e.target.checked)}
            />
          </label>
          <hr />
          <label className="flex flex-row place-content-between">
            Leaders
            <input
              type="checkbox"
              checked={useLeader}
              onChange={updateUseLeader}
            />
          </label>
        </div>
        <div className="mx-1 border-l-1"></div>
        <div className="flex flex-col gap-1">
          <h1 className="text-center">Group</h1>
          <label className="flex flex-row place-content-between gap-1">
            ID Source:
            <select
              className="rounded-sm border"
              name="groupidsource"
              value={groupIDSource}
              onChange={(e) => setGroupIDSource(e.target.value)}
            >
              <option className="text-black" value="id">
                ID Field
              </option>
              {groupCustomName && (
                <option className="text-black" value="name">
                  Name
                </option>
              )}
              {useLeader && (
                <option className="text-black" value="leader">
                  Leader
                </option>
              )}
            </select>
          </label>
          <hr />
          <label className="flex flex-row place-content-between">
            Name
            <input
              type="checkbox"
              checked={groupCustomName}
              onChange={updateGroupCustomName}
            />
          </label>
          <hr />
          <label className="flex flex-row place-content-between">
            Size
            <input
              type="checkbox"
              checked={groupUseSize}
              onChange={(e) => setGroupUseSize(e.target.checked)}
            />
          </label>
          {groupUseSize && (
            <select
              className="rounded-sm border"
              name="sizesource"
              value={groupSizeSource}
              onChange={(e) => setGroupSizeSource(e.target.value)}
            >
              <option className="dark:text-black" value="groupsize">
                Size Field
              </option>
              {useLeader && (
                <>
                  <option className="text-black" value="leadersize">
                    Leader Size
                  </option>
                  {[...assignableFields.entries()]
                    .filter(
                      ([, value]) =>
                        value.getType() == "number" &&
                        value.getGroup() == "miscellaneous"
                    )
                    .map(([key]) => (
                      <option className="text-black" key={key} value={key}>
                        {key}
                      </option>
                    ))}
                </>
              )}
            </select>
          )}
          <hr />
          <label className="flex flex-row place-content-between">
            Notes
            <input
              type="checkbox"
              checked={groupNotes}
              onChange={(e) => setGroupNotes(e.target.checked)}
            />
          </label>
        </div>
      </div>
      <button
        className={
          "rounded-full border" + (settingsUnaltered ? " text-neutral-500" : "")
        }
        type="submit"
        disabled={settingsUnaltered}
      >
        Save Settings
      </button>
    </form>
  );
};

const AssignableForm = ({
  settings,
  assignableCallback,
}: {
  settings: Setting;
  assignableCallback: (assignable: Assignable) => void;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [data, dataDispatch] = useMapReducer<string, any>(
    new Map([
      ["name", ""],
      ["id", ""],
      ["notes", ""],
    ])
  );
  const updateDataInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, valueAsNumber } = event.target;

    dataDispatch({
      type: "create",
      key: name,
      value:
        settings.getAssignableFields().get(name)?.getType() == "checkbox"
          ? checked
          : settings.getAssignableFields().get(name)?.getType() == "number" ||
              name == "leadersize"
            ? valueAsNumber
            : value,
    });
  };
  const updateDataSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value, selectedOptions } = event.target;
    dataDispatch({
      type: "create",
      key: name,
      value: settings.getAssignableFields().get(name)?.getMultiple()
        ? [...selectedOptions].map((o) => o.value)
        : value,
    });
  };

  const updateNotes = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    dataDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };

  /**load fields from settings*/
  useEffect(() => {
    for (const [fieldname, field] of settings.getAssignableFields().entries()) {
      if (!data.has(fieldname))
        dataDispatch({
          type: "create",
          key: fieldname,
          value:
            field.getType() == "select" && field.getMultiple()
              ? new Array<string>()
              : field.getType() == "checkbox"
                ? false
                : field.getType() == "number"
                  ? 0
                  : "",
        });
    }
    if (
      settings.getGroupSizeSource() == "leadersize" &&
      !data.has("leadersize")
    )
      dataDispatch({
        type: "create",
        key: "leadersize",
        value: 0,
      });
    for (const field of data.keys()) {
      if (
        !settings.getAssignableFields().get(field) &&
        !["name", "id", "notes", "leadersize"].includes(field)
      ) {
        dataDispatch({
          type: "delete",
          key: field,
        });
      }
    }
  }, [data, dataDispatch, settings]);

  const [isLeader, setIsLeader] = useState<boolean>(false);

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    const contact = new Map<string, string>();
    const availability = new Map<
      string,
      string | boolean | number | string[]
    >();
    const location = new Map<string, string | boolean | number | string[]>();
    const affinity = new Map<string, string | boolean | number | string[]>();
    const miscellaneous = new Map<
      string,
      string | boolean | number | string[]
    >();
    settings.getAssignableFields().forEach((field: Field) => {
      switch (field.getGroup()) {
        case "contact":
          contact.set(field.getName(), data.get(field.getName()));
          break;
        case "availability":
          availability.set(field.getName(), data.get(field.getName()));
          break;
        case "location":
          location.set(field.getName(), data.get(field.getName()));
          break;
        case "affinity":
          affinity.set(field.getName(), data.get(field.getName()));
          break;
        case "leadersize":
          break;
        default:
          miscellaneous.set(field.getName(), data.get(field.getName()));
      }
    });
    assignableCallback(
      new Assignable({
        id: data.get(settings.getAssignableIDSource()) || "!ERROR!",
        name: data.get("name"),
        contact: contact,
        availability: availability,
        location: location,
        affinity: affinity,
        miscellaneous: miscellaneous,
        leader: isLeader,
        size: isLeader
          ? settings.getGroupSizeSource() == "leadersize"
            ? data.get(settings.getGroupSizeSource())
            : settings.getGroupSizeSource()
          : undefined,
        notes: data.get("notes"),
      })
    );

    /**reset form fields */
    data.forEach((_, key) => {
      dataDispatch({ type: "create", key: key, value: "" });
    });
    setIsLeader(false);
    assignableFormRef.current?.reset();
  };

  return (
    <form
      className="flex flex-col rounded-md border p-2"
      onSubmit={submitForm}
      ref={assignableFormRef}
    >
      <label className="text-center">New Assignable</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={data.get("name")}
        placeholder={
          "Name*" + (settings.getAssignableIDSource() == "name" ? " (ID)" : "")
        }
        required
        minLength={1}
        onChange={updateDataInput}
      />
      {settings.getAssignableIDSource() == "id" && (
        <input
          className="rounded-sm border"
          type="text"
          name="id"
          value={data.get("id")}
          placeholder="ID*"
          required
          minLength={1}
          onChange={updateDataInput}
        />
      )}
      <ul>
        {[...settings.getAssignableFields().values()].map((field) => (
          <li className="whitespace-nowrap" key={field.getName()}>
            <label className="flex flex-row place-content-between">
              {["number", "checkbox", "select"].includes(field.getType()) &&
                field.getName() + (field.getRequired() ? "*" : "") + ":"}
              {field.getType() == "select" ? (
                <select
                  className="rounded-sm border"
                  name={field.getName()}
                  value={
                    data.get(field.getName()) || (field.getMultiple() ? [] : "")
                  }
                  multiple={field.getMultiple()}
                  required={field.getRequired()}
                  onChange={updateDataSelect}
                >
                  {!field.getMultiple() && (
                    <option value="">-{field.getName()}-</option>
                  )}
                  {Array.from(field.getOptions()).map((value) => (
                    <option
                      className={field.getMultiple() ? "" : "text-black"}
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="rounded-sm border"
                  type={field.getType()}
                  name={field.getName()}
                  value={
                    data.has(field.getName())
                      ? data.get(field.getName())
                      : field.getType() == "number"
                        ? 0
                        : ""
                  }
                  checked={data.get(field.getName()) || false}
                  placeholder={
                    field.getName() +
                    (field.getRequired() ? "*" : "") +
                    (field.getName() == settings.getAssignableIDSource()
                      ? " (ID)"
                      : field.getName() == settings.getAssignableIDSource()
                        ? " (Size)"
                        : "")
                  }
                  size={field.getType() == "number" ? 7 : undefined}
                  required={field.getRequired() || undefined}
                  minLength={
                    !field.getRequired() &&
                    ["text", "email", "tel"].includes(field.getType())
                      ? 1
                      : undefined
                  }
                  onChange={updateDataInput}
                />
              )}
            </label>
          </li>
        ))}
      </ul>
      {settings.getUseLeader() && (
        <label className="flex flex-row place-content-between">
          Leader
          <input
            type="checkbox"
            checked={isLeader}
            onChange={(e) => setIsLeader(e.target.checked)}
          />
        </label>
      )}
      {isLeader && settings.getGroupSizeSource() == "leadersize" && (
        <label className="flex flex-row place-content-between">
          Size*:
          <input
            className="rounded-sm border"
            type="number"
            name="leadersize"
            value={data.get("leadersize") || 0}
            placeholder="Size*:"
            size={7}
            min={0}
            required={true}
            onChange={updateDataInput}
          />
        </label>
      )}
      {settings.getAssignableNotes() && (
        <textarea
          name="notes"
          className="rounded-sm border"
          placeholder="Notes"
          value={data.get("notes")}
          onChange={updateNotes}
        />
      )}
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};

const GroupForm = ({
  settings,
  groupCallback,
  unassignedCollection,
}: {
  settings: Setting;
  groupCallback: (group: Group, leader?: Assignable) => void;
  unassignedCollection: Map<string, Assignable>;
}) => {
  const groupFormRef = useRef<HTMLFormElement>(null);
  const unassignedLeaderList = [...unassignedCollection.values()].filter((a) =>
    a.getLeader()
  );

  const [data, setData] = useState<{
    id: string;
    name?: string;
    size?: number;
    notes?: string;
  }>({
    id: "",
    name: "",
    size: 0,
    notes: "",
  });
  const updateData = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };
  const [leader, setLeader] = useState<string>("");

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    switch (settings.getGroupIDSource()) {
      case "leader":
        if (settings.getUseLeader())
          if (!!unassignedCollection.get(leader)) {
            const name = data.name && data.name.length > 0 ? data.name : leader;
            groupCallback(
              new Group({
                id: leader,
                name: name,
                leader: unassignedCollection.get(leader),
                size: settings.getGroupUseSize()
                  ? settings.getGroupSizeSource() == "groupsize"
                    ? data.size
                    : unassignedCollection.get(leader)?.getSize()
                  : undefined,
                notes: data.notes,
              }),
              unassignedCollection.get(leader)
            );
            setLeader("");
          }
        break;
      case "name":
        groupCallback(
          new Group({
            id: data.name as string,
            name: data.name,
            leader: unassignedCollection.get(leader),
            size: settings.getGroupUseSize()
              ? settings.getGroupSizeSource() == "groupsize"
                ? data.size
                : unassignedCollection.get(leader)?.getSize()
              : undefined,
            notes: data.notes,
          }),
          unassignedCollection.get(leader)
        );
        setLeader("");
        break;
      case "id":
      default:
        const name = data.name && data.name.length > 0 ? data.name : undefined;
        groupCallback(
          new Group({
            id: data.id,
            name: name,
            leader: settings.getUseLeader()
              ? unassignedCollection.get(leader)
              : undefined,
            size: settings.getGroupUseSize()
              ? settings.getGroupSizeSource() == "groupsize"
                ? data.size
                : unassignedCollection.get(leader)?.getSize()
              : undefined,
            notes: data.notes,
          }),
          unassignedCollection.get(leader)
        );
    }
    setData({
      id: "",
      name: "",
      size: 0,
      notes: "",
    });
    groupFormRef.current?.reset();
  };

  return (
    <form
      className="flex flex-col rounded-md border p-2"
      onSubmit={submitForm}
      ref={groupFormRef}
    >
      <label className="text-center">New Group</label>
      {settings.getUseLeader() && (
        <label className="flex flex-row place-content-between">
          {"Leader" +
            (settings.getGroupIDSource() == "leader" ? " (ID)" : "") +
            ":"}
          <select
            className="rounded-sm border"
            name="college"
            value={leader}
            onChange={(e) => {
              setLeader(e.target.value);
            }}
          >
            <option className="dark:text-black" value="">
              ---
            </option>
            {unassignedLeaderList.map((a) => (
              <option
                className="dark:text-black"
                key={a.getID()}
                value={a.getID()}
              >
                {a.getName()}
              </option>
            ))}
          </select>
        </label>
      )}
      {settings.getGroupIDSource() == "id" && (
        <input
          className="rounded-sm border"
          type="text"
          name="id"
          value={data.id}
          placeholder="ID*"
          required
          min={1}
          onChange={updateData}
        />
      )}
      {settings.getGroupCustomName() && (
        <input
          className="rounded-sm border"
          type="text"
          name="name"
          value={data.name}
          placeholder={
            "Name*" + (settings.getGroupIDSource() == "name" ? " (ID)" : "")
          }
          required
          min={1}
          onChange={updateData}
        />
      )}
      {settings.getGroupUseSize() &&
        settings.getGroupSizeSource() == "groupsize" && (
          <label className="flex flex-row place-content-between">
            Size:
            <input
              className="rounded-sm border"
              type="number"
              name="size"
              value={data.size}
              placeholder="Size*"
              required
              min={1}
              size={5}
              onChange={updateData}
            />
          </label>
        )}
      {settings.getGroupNotes() && (
        <textarea
          name="notes"
          className="rounded-sm border"
          placeholder="Notes"
          value={data.notes}
          onChange={updateData}
        />
      )}
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};

export default function Page() {
  const [assignableCollection, assignableDispatch] = useMapReducer<
    string,
    Assignable
  >();
  const [unassignedCollection, unassignedDispatch] = useMapReducer<
    string,
    Assignable
  >();
  const [groupCollection, groupDispatch] = useMapReducer<string, Group>();

  const [settings, setSettings] = useState<Setting>(defaultSettings);

  const [presetCollection, presetDispatch] = useMapReducer(
    new Map(presetList.map((setting) => [setting.getName(), setting]))
  );

  const createAssignable = (assignable: Assignable) => {
    assignableDispatch({
      type: "create",
      key: assignable.getID(),
      value: assignable,
    });
    unassignedDispatch({
      type: "create",
      key: assignable.getID(),
      value: assignable,
    });
  };

  const deleteAssignable = (assignable: Assignable) => {
    assignableDispatch({
      type: "delete",
      key: assignable.getID(),
    });
    unassignedDispatch({
      type: "delete",
      key: assignable.getID(),
    });
    groupCollection.forEach((value, key) => {
      if (value.getLeader() == assignable)
        groupDispatch({ type: "delete", key: key });
      for (const [memberKey, member] of value.getAllMembers().entries())
        if (member == assignable)
          groupDispatch({ type: "delete", key: memberKey });
    });
  };

  const createGroup = (group: Group, leader?: Assignable) => {
    groupDispatch({
      type: "create",
      key: group.getID(),
      value: group,
    });
    if (!!leader) unassignedDispatch({ type: "delete", key: leader.getID() });
  };

  const deleteGroup = (group: Group) => {
    const leader = group.getLeader();
    if (!!leader)
      unassignedDispatch({
        type: "create",
        key: leader.getID(),
        value: leader,
      });
    group.getAllMembers().forEach((value, key) => {
      unassignedDispatch({
        type: "create",
        key: key,
        value: value,
      });
    });
    groupDispatch({
      type: "delete",
      key: group.getID(),
    });
  };

  const addGroupMember = (group: Group) => {
    const newMember = unassignedList.shift();
    if (newMember) {
      group.getAllMembers().set(newMember.getID(), newMember);
      groupDispatch({ type: "create", key: group.getID(), value: group });
      unassignedDispatch({ type: "delete", key: newMember.getID() });
    }
  };

  const removeGroupMember = (group: Group, member: Assignable) => {
    group.getAllMembers().delete(member.getID());
    groupDispatch({ type: "create", key: group.getID(), value: group });
    unassignedDispatch({ type: "create", key: member.getID(), value: member });
  };

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);
  const [showSettingsForm, setShowSettingsForm] = useState<boolean>(false);

  const [assignableList, setAssignableList] = useState<Array<Assignable>>([]);
  const [unassignedList, setUnassignedList] = useState<Array<Assignable>>([]);
  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>([]);

  const [groupList, setGroupList] = useState<Array<Group>>([]);
  const [groupSort, setGroupSort] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<Array<string>>([]);

  useEffect(() => {
    setAssignableList(
      sortAssignables(
        filterAssignables(
          Array.from(assignableCollection.values()),
          assignableFilter
        ),
        assignableSort
      )
    );
    setUnassignedList(
      sortAssignables(
        filterAssignables(
          Array.from(unassignedCollection.values()),
          assignableFilter
        ),
        assignableSort
      )
    );
  }, [
    assignableCollection,
    unassignedCollection,
    assignableSort,
    assignableFilter,
  ]);

  useEffect(() => {
    setGroupList(
      sortGroups(
        filterGroups(Array.from(groupCollection.values()), groupFilter),
        groupSort
      )
    );
  }, [groupCollection, groupSort, groupFilter]);

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <div className="relative rounded-md border p-1">
          <button
            className={showSettingsForm ? "absolute top-1 right-2" : ""}
            onClick={() => setShowSettingsForm(!showSettingsForm)}
          >
            {showSettingsForm ? <>&times;</> : "Edit Settings"}
          </button>
          {showSettingsForm && (
            <>
              <PresetForm
                settings={settings}
                settingsCallback={setSettings}
                presets={presetCollection}
                presetsCallback={presetDispatch}
              />
              <hr />
              <SettingsForm
                settings={settings}
                settingsCallback={setSettings}
              />
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <AssignableForm
            settings={settings}
            assignableCallback={createAssignable}
          />
          <GroupForm
            settings={settings}
            groupCallback={createGroup}
            unassignedCollection={unassignedCollection}
          />
          {assignableCollection.size > 0 && (
            <div className="relative rounded-md border p-1">
              <input
                className="absolute top-2 right-2"
                type="checkbox"
                checked={showOnlyUnassigned}
                onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
              />
              <h1 className="text-center">
                {!showOnlyUnassigned ? "Assignables" : "Unassigned"}
              </h1>
              <select
                className="rounded-sm border"
                value={assignableSort}
                onChange={(e) => setAssignableSort(e.target.value)}
              >
                <option className="dark:text-black" value="">
                  --Sort--
                </option>
                <option className="dark:text-black" value="name">
                  Name
                </option>
                {settings.getUseLeader() && (
                  <option className="dark:text-black" value="leader">
                    Leader
                  </option>
                )}
                {settings.getUseLeader() &&
                  settings.getGroupSizeSource() != "groupsize" && (
                    <option className="dark:text-black" value="size">
                      Size
                    </option>
                  )}
                {Array.from(settings.getAssignableFields().entries())
                  .filter(([, value]) =>
                    ["text", "number"].includes(value.getType())
                  )
                  .map(([key, value]) =>
                    value.getType() == "select" ? (
                      <optgroup
                        className="dark:text-black"
                        key={key}
                        label={key}
                      >
                        {Array.from(value.getOptions()).map((option) => (
                          <option className="dark:text-black" key={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      <option className="dark:text-black" key={key}>
                        {key}
                      </option>
                    )
                  )}
              </select>
              {(settings.getUseLeader() ||
                Array.from(settings.getAssignableFields().entries()).filter(
                  ([, value]) =>
                    ["select", "checkbox"].includes(value.getType())
                ).length > 0) && (
                <select
                  className="rounded-sm border"
                  value={assignableFilter}
                  onChange={(e) =>
                    setAssignableFilter(
                      [...e.target.selectedOptions].map((o) => o.value)
                    )
                  }
                  multiple
                >
                  {settings.getUseLeader() && (
                    <option value="leader">Leader</option>
                  )}
                  {Array.from(settings.getAssignableFields().entries())
                    .filter(([, value]) =>
                      ["select", "checkbox"].includes(value.getType())
                    )
                    .map(([key, value]) =>
                      value.getType() == "select" ? (
                        <optgroup key={key} label={key}>
                          {Array.from(value.getOptions()).map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={key}>{key}</option>
                      )
                    )}
                </select>
              )}
              <ul className="m-1 max-h-[70svh] overflow-auto">
                {(!showOnlyUnassigned ? assignableList : unassignedList).map(
                  (value) => (
                    <li key={value.getID()}>
                      <AssignableComponent
                        data={value}
                        assignableCallback={deleteAssignable}
                      />
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          {groupCollection.size > 0 && (
            <div className="rounded-md border p-1">
              <h1 className="text-center">Groups</h1>
              <select
                className="rounded-sm border"
                value={groupSort}
                onChange={(e) => setGroupSort(e.target.value)}
              >
                <option className="dark:text-black" value="">
                  --Sort--
                </option>
                <option className="dark:text-black" value="name">
                  Name
                </option>
                {settings.getGroupUseSize() && (
                  <option className="dark:text-black" value="size">
                    Size
                  </option>
                )}
                {settings.getUseLeader() &&
                  Array.from(settings.getAssignableFields().entries())
                    .filter(([, value]) => ["text"].includes(value.getType()))
                    .map(([key, value]) =>
                      value.getType() == "select" ? (
                        <optgroup
                          className="dark:text-black"
                          key={key}
                          label={key}
                        >
                          {Array.from(value.getOptions()).map((option) => (
                            <option className="dark:text-black" key={option}>
                              {option}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        <option className="dark:text-black" key={key}>
                          {key}
                        </option>
                      )
                    )}
              </select>
              {(settings.getGroupUseSize() ||
                (settings.getUseLeader() &&
                  Array.from(settings.getAssignableFields().entries()).filter(
                    ([, value]) =>
                      ["select", "checkbox"].includes(value.getType())
                  ).length > 0)) && (
                <select
                  className="rounded-sm border"
                  value={groupFilter}
                  onChange={(e) =>
                    setGroupFilter(
                      [...e.target.selectedOptions].map((o) => o.value)
                    )
                  }
                  multiple
                >
                  {settings.getGroupUseSize() && (
                    <option value="unfull">Space Left</option>
                  )}
                  {Array.from(settings.getAssignableFields().entries())
                    .filter(([, value]) =>
                      ["select", "checkbox"].includes(value.getType())
                    )
                    .map(([key, value]) =>
                      value.getType() == "select" ? (
                        <optgroup key={key} label={key}>
                          {Array.from(value.getOptions()).map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={key}>{key}</option>
                      )
                    )}
                </select>
              )}
              <ul className="m-1 max-h-[70svh] overflow-auto">
                {groupList.map((value) => (
                  <li key={value.getID()}>
                    <GroupComponent
                      data={value}
                      deleteGroupCallback={deleteGroup}
                      addGroupMember={addGroupMember}
                      removeGroupMember={removeGroupMember}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
