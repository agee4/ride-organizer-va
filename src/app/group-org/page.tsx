"use client";

import {
  ActionDispatch,
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  use,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

type RecursiveMap<K, V> = Map<K, V | RecursiveMap<K, V>>;

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

class Assignable {
  private _id: string;
  private name: string;
  private contact?: Map<string, string>;
  private availability?: Map<string, string | boolean>;
  private location?: Map<string, string | boolean>;
  private affinity?: Map<string, string | number | boolean>;
  private miscellaneous?: Map<string, any>;
  private leader?: boolean;
  private size?: number;
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
    availability?: Map<string, string | boolean>;
    location?: Map<string, string | boolean>;
    affinity?: Map<string, string | number | boolean>;
    miscellaneous?: Map<string, any>;
    leader?: boolean;
    size?: number;
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
    return this.size;
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
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
          {data.getAvailability() &&
            Array.from(data.getAvailability() as Map<string, string>)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
          {data.getLocation() &&
            Array.from(data.getLocation() as Map<string, string>)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
          {data.getAffinity() &&
            Array.from(data.getAffinity() as Map<string, string>)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
          {data.getMiscellaneous() &&
            Array.from(data.getMiscellaneous() as Map<string, string>)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
        </ul>
      </ul>
    </div>
  );
};

class Group {
  private _id: string;
  private members: Map<string, Assignable>;
  private name?: string;
  private leader?: Assignable;
  private size?: number;

  constructor({
    id,
    name,
    leader,
    size,
    members,
  }: {
    id: string;
    name?: string;
    leader?: Assignable;
    size?: number;
    members?: Map<string, Assignable>;
  }) {
    this._id = id;
    this.members = members || new Map<string, Assignable>();
    this.name = name;
    this.leader = leader;
    this.size = size;
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
}: {
  data: Group;
  deleteGroupCallback: (group: Group) => void;
}) => {
  const leader = data.getLeader();

  return (
    <div className="my-1 max-w-[496px] rounded-md bg-neutral-400 p-2 dark:bg-neutral-600">
      <ul>
        <div className="flex flex-row place-content-between font-bold">
          {data.getName() || leader?.getName() || data.getID()}
          <button
            className="rounded-sm border px-1"
            onClick={() => deleteGroupCallback(data)}
          >
            &times;
          </button>
        </div>
        <li className="text-xs italic">{data.getID()}</li>
        {!!leader && (
          <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
            <ul>
              <div className="font-bold">{leader.getName()}</div>
              <li className="text-xs italic">{leader.getID()}</li>
              <ul className="m-1">
                {leader.getContact() &&
                  Array.from(
                    data.getLeader()?.getContact() as Map<string, string>
                  ).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                {leader.getAvailability() &&
                  Array.from(
                    data.getLeader()?.getAvailability() as Map<string, string>
                  ).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                {leader.getLocation() &&
                  Array.from(leader.getLocation() as Map<string, string>).map(
                    ([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    )
                  )}
              </ul>
            </ul>
          </div>
        )}
      </ul>
    </div>
  );
};

class Field {
  private name: string;
  private type: string;
  private group: string;
  private optional: boolean = false;
  private preset: boolean = false;

  constructor({
    name,
    type,
    group,
    optional,
    preset,
  }: {
    name: string;
    type: string;
    group: string;
    optional?: boolean;
    preset?: boolean;
  }) {
    this.name = name;
    this.type = type;
    this.group = group;
    this.optional = optional || false;
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

  getOptional() {
    return this.optional;
  }

  getPreset() {
    return this.preset;
  }

  getPlaceholderName() {
    return (
      this.name +
      (!this.optional ? "*" : "") +
      (this.group != "miscellaneous" ? " (" + this.group + ")" : "") +
      (" [" + this.type + "]")
    );
  }

  equals(other: Field | undefined) {
    return (
      other &&
      this.name == other.name &&
      this.type == other.type &&
      this.group == other.group &&
      this.optional == other.optional &&
      this.preset == other.preset
    );
  }
}

class Preset {
  private assignableIDSource: string;
  private allowFieldCreation: boolean;
  private assignablePresetFields: Map<string, Field>;
  private useLeader: boolean;
  private groupIDSource: string;
  private groupCustomName: boolean;
  private groupUseSize: boolean;
  private groupSizeSource: string;

  constructor({
    assignableIDSource,
    allowFieldCreation,
    assignablePresetFields,
    useLeader,
    groupIDSource,
    groupCustomName,
    groupUseSize,
    groupSizeSource,
  }: {
    assignableIDSource?: string;
    allowFieldCreation?: boolean;
    assignablePresetFields?: Map<string, Field>;
    useLeader?: boolean;
    groupIDSource?: string;
    groupCustomName?: boolean;
    groupUseSize?: boolean;
    groupSizeSource?: string;
  }) {
    this.assignableIDSource = assignableIDSource || "id";
    this.allowFieldCreation = allowFieldCreation || false;
    this.assignablePresetFields =
      assignablePresetFields || new Map<string, Field>();
    this.useLeader = useLeader || false;
    this.groupIDSource = groupIDSource || "id";
    this.groupCustomName = groupCustomName || false;
    this.groupUseSize = groupUseSize || false;
    this.groupSizeSource = groupSizeSource || "size";
  }

  getAssignableIDSource() {
    return this.assignableIDSource;
  }

  getAllowFieldCreation() {
    return this.allowFieldCreation;
  }

  getAssignablePresetFields() {
    return this.assignablePresetFields;
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

  equals(other: Preset | undefined) {
    function presetFieldsEquals(
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
      this.allowFieldCreation == other.allowFieldCreation &&
      presetFieldsEquals(
        this.assignablePresetFields,
        other.assignablePresetFields
      ) &&
      this.useLeader == other.useLeader &&
      this.groupIDSource == other.groupIDSource &&
      this.groupCustomName == other.groupCustomName &&
      this.groupUseSize == other.groupUseSize &&
      this.groupSizeSource == other.groupSizeSource
    );
  }
}

const defaultPreset = new Preset({});

const bereanCollegeRidesPreset = new Preset({
  assignableIDSource: "Email",
  assignablePresetFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        preset: true,
      }),
    ],
    [
      "Address",
      new Field({
        name: "Address",
        type: "string",
        group: "location",
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        optional: true,
        preset: true,
      }),
    ],
  ]),
  useLeader: true,
  groupIDSource: "leader",
});

const bibleStudyTablesPreset = new Preset({
  assignableIDSource: "Email",
  assignablePresetFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        optional: true,
        preset: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "string",
        group: "affinity",
        optional: true,
        preset: true,
      }),
    ],
  ]),
  useLeader: true,
});

const noLeaderGroupsPreset = new Preset({
  assignableIDSource: "Email",
  assignablePresetFields: new Map<string, Field>([
    [
      "Email",
      new Field({
        name: "Email",
        type: "email",
        group: "contact",
        preset: true,
      }),
    ],
    [
      "Phone",
      new Field({
        name: "Phone",
        type: "tel",
        group: "contact",
        optional: true,
        preset: true,
      }),
    ],
    [
      "Affinity",
      new Field({
        name: "Affinity",
        type: "string",
        group: "affinity",
        optional: true,
        preset: true,
      }),
    ],
  ]),
});

const PresetForm = ({
  preset,
  presetCallback,
}: {
  preset: Preset;
  presetCallback: Dispatch<SetStateAction<Preset>>;
}) => {
  const assignablePresetFormRef = useRef(null);

  const [assignableIDSource, setAssignableIDSource] = useState<string>(
    preset.getAssignableIDSource()
  );
  /* const [allowFieldCreation, setAllowFieldCreation] = useState<boolean>(
    preset.getAllowFieldCreation()
  ); */
  const [useLeader, setUseLeader] = useState<boolean>(preset.getUseLeader());
  const updateUseLeader = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked && groupIDSource == "leader") setGroupIDSource("id");
    setUseLeader(e.target.checked);
  };
  const [groupIDSource, setGroupIDSource] = useState<string>(
    preset.getGroupIDSource()
  );
  const [groupCustomName, setGroupCustomName] = useState<boolean>(false);
  const updateGroupCustomName = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked && groupIDSource == "name") setGroupIDSource("id");
    setGroupCustomName(e.target.checked);
  };
  const [groupUseSize, setGroupUseSize] = useState<boolean>(false);
  const [groupSizeSource, setGroupSizeSource] = useState<string>(
    preset.getGroupSizeSource()
  );

  const [fieldName, setFieldName] = useState<string>("");
  const [fieldGroup, setFieldGroup] = useState<string>("miscellaneous");
  const updateFieldGroup = (fieldGroup: string) => {
    setFieldGroup(fieldGroup);
    setFieldType("string");
  };
  const [fieldType, setFieldType] = useState<string>("string");
  const updateFieldType = (fieldType: string) => {
    if (fieldType == "checkbox") setOptionalField(true);
    setFieldType(fieldType);
  };
  const [optionalField, setOptionalField] = useState<boolean>(false);
  const [assignablePresetFields, assignablePresetFieldsDispatch] =
    useMapReducer<string, Field>(preset.getAssignablePresetFields());
  const createField = () => {
    const cleanedFieldName = fieldName.trim().toLocaleLowerCase();
    if (
      !["", "id", "name", ...assignablePresetFields.keys()].includes(
        cleanedFieldName
      )
    ) {
      assignablePresetFieldsDispatch({
        type: "create",
        key: fieldName,
        value: new Field({
          name: fieldName,
          type: fieldType,
          group: fieldGroup,
          optional: optionalField,
          preset: true,
        }),
      });
      setFieldName("");
      setFieldGroup("miscellaneous");
      setFieldType("string");
      setOptionalField(false);
      setShowAddInputField(false);
    }
  };
  const deleteField = (field: string) => {
    assignablePresetFieldsDispatch({
      type: "delete",
      key: field,
    });
    if (field == assignableIDSource) setAssignableIDSource("id");
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    presetCallback(
      new Preset({
        assignableIDSource: assignableIDSource,
        /* allowFieldCreation: allowFieldCreation, */
        assignablePresetFields: assignablePresetFields,
        useLeader: useLeader,
        groupIDSource: groupIDSource,
        groupCustomName: groupCustomName,
        groupUseSize: groupUseSize,
        groupSizeSource: groupUseSize ? groupSizeSource : "",
      })
    );
  };

  const [showAddInputField, setShowAddInputField] = useState<boolean>(false);
  const [showAssignablePresetFields, setShowAssignablePresetFields] =
    useState<boolean>(false);
  const presetUnaltered = preset.equals(
    new Preset({
      assignableIDSource: assignableIDSource,
      /* allowFieldCreation: allowFieldCreation, */
      assignablePresetFields: assignablePresetFields,
      useLeader: useLeader,
      groupIDSource: groupIDSource,
      groupCustomName: groupCustomName,
      groupUseSize: groupUseSize,
      groupSizeSource: groupUseSize ? groupSizeSource : "",
    })
  );

  return (
    <form
      className="my-1 flex flex-col"
      onSubmit={submitForm}
      ref={assignablePresetFormRef}
    >
      <label className="text-center">Presets</label>
      <div className="flex flex-row">
        <div>
          <label>
            Assignable ID Source:{" "}
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
              {[...assignablePresetFields.entries()]
                .filter(
                  ([_, value]) =>
                    !value.getOptional() && value.getType() != "boolean"
                )
                .map(([key, _]) => (
                  <option className="text-black" key={key} value={key}>
                    {key}
                  </option>
                ))}
            </select>
          </label>
          <ul className="flex flex-col border p-1">
            <div className="flex flex-row place-content-between">
              <li>Assignable Fields</li>
              <button
                type="button"
                onClick={() =>
                  setShowAssignablePresetFields(!showAssignablePresetFields)
                }
              >
                {showAssignablePresetFields ? <>&uarr;</> : <>&darr;</>}
              </button>
            </div>
            {showAssignablePresetFields && (
              <>
                <hr />
                {[...assignablePresetFields.entries()].map(([key, value]) => (
                  <li className="flex flex-row place-content-between" key={key}>
                    {value.getPlaceholderName()}
                    <button
                      className="rounded-sm border px-1"
                      onClick={() => deleteField(key)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
                <li className="flex flex-col border p-1">
                  <div className="flex flex-row place-content-between">
                    <div>Add Input Field</div>
                    <button
                      type="button"
                      onClick={() => setShowAddInputField(!showAddInputField)}
                    >
                      {showAddInputField ? <>&uarr;</> : <>&darr;</>}
                    </button>
                  </div>
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
                      <label className="whitespace-nowrap">
                        Field Group:{" "}
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
                      {[
                        "miscellaneous",
                        "contact",
                        "availability",
                        "affinity",
                      ].includes(fieldGroup) && (
                        <label className="whitespace-nowrap">
                          Field Type:{" "}
                          <select
                            className="rounded-sm border"
                            name="fieldtype"
                            defaultValue={fieldType}
                            onChange={(e) => updateFieldType(e.target.value)}
                          >
                            {fieldGroup == "contact" && (
                              <>
                                <option
                                  className="dark:text-black"
                                  value="email"
                                >
                                  Email
                                </option>
                                <option className="dark:text-black" value="tel">
                                  Phone
                                </option>
                              </>
                            )}
                            <option className="dark:text-black" value="string">
                              Text
                            </option>
                            {[
                              "miscellaneous",
                              "availability",
                              "affinity",
                            ].includes(fieldGroup) && (
                              <>
                                {fieldGroup == "miscellaneous" && (
                                  <option
                                    className="dark:text-black"
                                    value="number"
                                  >
                                    Number
                                  </option>
                                )}
                                <option
                                  className="dark:text-black"
                                  value="checkbox"
                                >
                                  Checkbox
                                </option>
                              </>
                            )}
                          </select>
                        </label>
                      )}
                      <label>
                        Optional
                        <input
                          type="checkbox"
                          checked={optionalField}
                          onChange={(e) => setOptionalField(e.target.checked)}
                        />
                      </label>
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
          {/* <label className="flex flex-row place-content-between">
            Field Creation
            <input
              type="checkbox"
              checked={allowFieldCreation}
              onChange={(e) => setAllowFieldCreation(e.target.checked)}
            />
          </label> */}
          <hr />
          <label className="flex flex-row place-content-between">
            Leaders
            <input
              type="checkbox"
              checked={useLeader}
              onChange={updateUseLeader}
            />
          </label>
          <hr />
        </div>
        <div className="mx-1 border-r-1"></div>
        <div>
          <label>
            Group ID Source:{" "}
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
            Group Names
            <input
              type="checkbox"
              checked={groupCustomName}
              onChange={updateGroupCustomName}
            />
          </label>
          <hr />
          <label className="flex flex-row place-content-between">
            Group Size
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
              defaultValue={groupSizeSource}
              onChange={(e) => setGroupSizeSource(e.target.value)}
            >
              <option className="dark:text-black" value="size">
                Size
              </option>
              {useLeader &&
                [...assignablePresetFields.entries()]
                  .filter(([_, value]) => value.getType() == "number")
                  .map(([key, _]) => (
                    <option className="text-black" key={key} value={key}>
                      {key}
                    </option>
                  ))}
            </select>
          )}
          <hr />
        </div>
      </div>
      <button
        className={
          "rounded-full border" + (presetUnaltered ? " text-neutral-500" : "")
        }
        type="submit"
      >
        Save Presets
      </button>
    </form>
  );
};

const AssignableForm = ({
  preset,
  assignableCallback,
}: {
  preset: Preset;
  assignableCallback: (assignable: Assignable) => void;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [data, dataDispatch] = useMapReducer<string, any>(
    new Map([
      ["name", ""],
      ["id", ""],
    ])
  );
  const updateData = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;

    dataDispatch({
      type: "create",
      key: name,
      value:
        preset.getAssignablePresetFields().get(name)?.getType() == "checkbox"
          ? checked
          : value,
    });
  };

  /**custom fields */
  {
    /* const [customFields, customFieldsDispatch] = useMapReducer<string, Field>();
  const [fieldName, setFieldName] = useState<string>("");
  const [fieldGroup, setFieldGroup] = useState<string>("miscellaneous");
  const [fieldType, setFieldType] = useState<string>("string");
  const [optionalField, setOptionalField] = useState<boolean>(false);
  const createField = () => {
    if (
      !preset.getAssignablePresetFields().get(fieldName) &&
      !["", "name", "id"].includes(fieldName)
    ) {
      customFieldsDispatch({
        type: "create",
        key: fieldName,
        value: new Field({
          name: fieldName,
          type: fieldType,
          group: fieldGroup,
          optional: optionalField,
        }),
      });
      setFieldName("");
      setShowAddInputField(false);
    }
  }; */
  }

  /**load fields from preset & custom */
  useEffect(() => {
    for (const [fieldname, field] of preset
      .getAssignablePresetFields()
      .entries()) {
      if (!data.has(fieldname))
        dataDispatch({
          type: "create",
          key: fieldname,
          value:
            field.getType() == "checkbox"
              ? false
              : field.getType() == "number"
                ? 0
                : "",
        });
    }
    {
      /* for (const field of customFields.values()) {
      tagDispatch({
        type: "create",
        key: field.getName(),
        value:
          field.getType() == "boolean"
            ? false
            : field.getType() == "number"
              ? 0
              : "",
      });
    } */
    }
    for (const field of data.keys()) {
      if (
        !preset.getAssignablePresetFields().get(field) &&
        !["name", "id"].includes(field) /* &&
        !customFields.get(field) */
      ) {
        dataDispatch({
          type: "delete",
          key: field,
        });
      }
    }
  }, [preset /* customFields */]);

  const [isLeader, setIsLeader] = useState<boolean>(false);

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    const contact = new Map<string, string>();
    const availability = new Map<string, string>();
    const location = new Map<string, string>();
    const affinity = new Map<string, string | number>();
    const miscellaneous = new Map<string, any>();
    new Map([
      ...preset.getAssignablePresetFields() /* ...customFields */,
    ]).forEach((field: Field) => {
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
        default:
          miscellaneous.set(field.getName(), data.get(field.getName()));
      }
    });
    assignableCallback(
      new Assignable({
        id: data.get(preset.getAssignableIDSource()) || "!ERROR!",
        name: data.get("name"),
        contact: contact,
        availability: availability,
        location: location,
        affinity: affinity,
        miscellaneous: miscellaneous,
        leader: isLeader,
      })
    );

    /**reset form fields */
    data.forEach((_, key) => {
      dataDispatch({ type: "create", key: key, value: "" });
    });
    assignableFormRef.current?.reset();
  };

  /* const [showAddInputField, setShowAddInputField] = useState<boolean>(false); */

  return (
    <form
      className="my-1 flex flex-col rounded-md border p-2"
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
          "Name*" + (preset.getAssignableIDSource() == "name" ? " (ID)" : "")
        }
        required
        minLength={1}
        onChange={updateData}
      />
      {preset.getAssignableIDSource() == "id" && (
        <input
          className="rounded-sm border"
          type="text"
          name="id"
          value={data.get("id")}
          placeholder="ID*"
          required
          minLength={1}
          onChange={updateData}
        />
      )}
      <ul>
        {[
          ...preset.getAssignablePresetFields().values(),
          /* ...customFields.values(), */
        ].map((field) => (
          <li className="whitespace-nowrap" key={field.getName()}>
            <label className="flex flex-row place-content-between">
              {["number", "checkbox"].includes(field.getType()) &&
                field.getName() + (field.getOptional() ? "" : "*") + ": "}
              <input
                className="rounded-sm border"
                type={field.getType()}
                name={field.getName()}
                value={
                  data.get(field.getName()) ||
                  (field.getType() == "number" ? 0 : "")
                }
                checked={data.get(field.getName()) || false}
                placeholder={
                  field.getName() +
                  (field.getOptional() ? "" : "*") +
                  (field.getName() == preset.getAssignableIDSource()
                    ? " (ID)"
                    : "")
                }
                size={field.getType() == "number" ? 7 : undefined}
                required={!field.getOptional() || undefined}
                minLength={
                  !field.getOptional() &&
                  ["text", "email", "tel"].includes(field.getType())
                    ? 1
                    : undefined
                }
                onChange={updateData}
              />
            </label>
            {/* !field.getPreset() && (
              <button
                className="rounded-sm border px-1"
                type="button"
                onClick={() => {
                  customFieldsDispatch({
                    type: "delete",
                    key: field.getName(),
                  });
                  tagDispatch({
                    type: "delete",
                    key: field.getName(),
                  });
                }}
              >
                &times;
              </button>
            ) */}
          </li>
        ))}
        {/* preset.getAllowFieldCreation() && (
          <li className="border whitespace-nowrap">
            <div className="flex flex-col border p-1">
              <div className="flex flex-row place-content-between">
                <div>Add Input Field</div>
                <button
                  type="button"
                  onClick={() => setShowAddInputField(!showAddInputField)}
                >
                  {showAddInputField ? <>uarr;</> : <>&darr;</>}
                </button>
              </div>
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
                  <div className="whitespace-nowrap">
                    <select
                      className="rounded-sm border"
                      name="fieldgroup"
                      value={fieldGroup}
                      onChange={(e) => setFieldGroup(e.target.value)}
                    >
                      <option className="dark:text-black" value="miscellaneous">
                        Tag Group
                      </option>
                      <option className="dark:text-black" value="contact">
                        Contact
                      </option>
                      <option className="dark:text-black" value="availability">
                        Availability
                      </option>
                      <option className="dark:text-black" value="location">
                        Location
                      </option>
                      <option className="dark:text-black" value="affinity">
                        Affinity
                      </option>
                    </select>
                    {["miscellaneous", "contact"].includes(fieldGroup) && (
                      <select
                        className="rounded-sm border"
                        name="fieldtype"
                        defaultValue={fieldType}
                        onChange={(e) => setFieldType(e.target.value)}
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
                        <option className="dark:text-black" value="string">
                          Text
                        </option>
                        {fieldGroup == "miscellaneous" && (
                          <>
                            <option className="dark:text-black" value="number">
                              Number
                            </option>
                            <option className="dark:text-black" value="boolean">
                              T/F
                            </option>
                          </>
                        )}
                      </select>
                    )}
                    {fieldType != "boolean" && (
                      <label>
                        Optional
                        <input
                          type="checkbox"
                          checked={optionalField}
                          onChange={(e) => setOptionalField(e.target.checked)}
                        />
                      </label>
                    )}
                  </div>
                  <button
                    className="rounded-sm border px-1"
                    type="button"
                    onClick={createField}
                  >
                    Add Field
                  </button>
                </>
              )}
            </div>
          </li>
        ) */}
      </ul>
      {preset.getUseLeader() && (
        <label>
          Leader
          <input
            type="checkbox"
            checked={isLeader}
            onChange={(e) => setIsLeader(e.target.checked)}
          />
        </label>
      )}
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};

const GroupForm = ({
  preset,
  groupCallback,
  assignableCollection,
}: {
  preset: Preset;
  groupCallback: (group: Group, leader?: Assignable) => void;
  assignableCollection: Map<string, Assignable>;
}) => {
  const groupFormRef = useRef<HTMLFormElement>(null);
  const unassignedLeaderList = [...assignableCollection.values()].filter((a) =>
    a.getLeader()
  );

  const [data, setData] = useState<{
    id: string;
    name?: string;
    size?: number;
  }>({
    id: "",
    name: "",
    size: 0,
  });
  const updateData = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };
  const [leader, setLeader] = useState<string>("");

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    switch (preset.getGroupIDSource()) {
      case "leader":
        if (preset.getUseLeader())
          if (!!assignableCollection.get(leader)) {
            const name = data.name && data.name.length > 0 ? data.name : leader;
            groupCallback(
              new Group({
                id: leader,
                name: name,
                leader: assignableCollection.get(leader),
                size: assignableCollection
                  .get(leader)
                  ?.getSize() /**TODO change to any preset defined size field */,
              }),
              assignableCollection.get(leader)
            );
            setLeader("");
          }
        break;
      case "name":
        groupCallback(
          new Group({
            id: data.name as string,
            name: data.name,
            leader: preset.getUseLeader()
              ? assignableCollection.get(leader)
              : undefined,
            size: preset.getGroupUseSize()
              ? assignableCollection.get(leader)?.getSize()
              : undefined /**TODO change to any preset defined size field */,
          }),
          assignableCollection.get(leader)
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
            leader: preset.getUseLeader()
              ? assignableCollection.get(leader)
              : undefined,
            size: preset.getGroupUseSize()
              ? assignableCollection.get(leader)?.getSize()
              : undefined /**TODO change to any preset defined size field */,
          }),
          assignableCollection.get(leader)
        );
    }
    setData({
      id: "",
      name: "",
      size: 0,
    });
    groupFormRef.current?.reset();
  };

  return (
    <form
      className="my-1 flex flex-col rounded-md border p-2"
      onSubmit={submitForm}
      ref={groupFormRef}
    >
      <label className="text-center">New Group</label>
      {preset.getUseLeader() && (
        <label className="whitespace-nowrap">
          {"Leader" +
            (preset.getGroupIDSource() == "leader" ? " (ID)" : "") +
            ": "}
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
      {preset.getGroupIDSource() == "id" && (
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
      {preset.getGroupCustomName() && (
        <input
          className="rounded-sm border"
          type="text"
          name="name"
          value={data.name}
          placeholder={
            "Name*" + (preset.getGroupIDSource() == "name" ? " (ID)" : "")
          }
          required
          min={1}
          onChange={updateData}
        />
      )}
      {preset.getGroupUseSize() && preset.getGroupSizeSource() == "size" && (
        <input
          className="rounded-sm border"
          type="number"
          name="size"
          value={data.size}
          placeholder="Size*"
          required
          min={1}
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

  const addAssignable = (assignable: Assignable) => {
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

  const [assignablePreset, setAssignablePreset] =
    useState<Preset>(defaultPreset);

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
    });
  };

  const addGroup = (group: Group, leader?: Assignable) => {
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

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);
  const [showPresetForm, setShowPresetForm] = useState<boolean>(false);

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <p>WIP</p>
        <div className="rounded-md border p-1">
          <button
            className="float-right"
            onClick={() => setShowPresetForm(!showPresetForm)}
          >
            {showPresetForm ? <>&times;</> : "Edit Presets"}
          </button>
          {showPresetForm && (
            <PresetForm
              preset={assignablePreset}
              presetCallback={setAssignablePreset}
            />
          )}
        </div>
        <div className="flex flex-row">
          <div>
            <AssignableForm
              preset={assignablePreset}
              assignableCallback={addAssignable}
            />
            <div>
              {assignableCollection.size > 0 && (
                <button
                  className="float-right"
                  onClick={() => setShowOnlyUnassigned(!showOnlyUnassigned)}
                >
                  &hellip;
                </button>
              )}
              {assignableCollection &&
                (!showOnlyUnassigned ? (
                  <>
                    <h1 className="text-center">Assignables</h1>
                    <ul className="m-1 h-[70svh] overflow-auto">
                      {[...assignableCollection.values()].map((value) => (
                        <li key={value.getID()}>
                          <AssignableComponent
                            data={value}
                            assignableCallback={deleteAssignable}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h1 className="text-center">Unassigned</h1>
                    <ul className="m-1 h-[70svh] overflow-auto">
                      {[...unassignedCollection.values()].map((value) => (
                        <li key={value.getID()}>
                          <AssignableComponent
                            data={value}
                            assignableCallback={deleteAssignable}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
            </div>
          </div>
          <div className="mx-1 border-r-1"></div>
          <div>
            <GroupForm
              preset={assignablePreset}
              groupCallback={addGroup}
              assignableCollection={unassignedCollection}
            />
            {groupCollection && (
              <>
                <h1 className="text-center">Groups</h1>
                <ul className="m-1 h-[70svh] overflow-auto">
                  {[...groupCollection.values()].map((value) => (
                    <li key={value.getID()}>
                      <GroupComponent
                        data={value}
                        deleteGroupCallback={deleteGroup}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
