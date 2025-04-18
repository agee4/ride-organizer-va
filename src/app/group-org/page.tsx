"use client";

import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  use,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

type RecursiveMap<K, V> = Map<K, V | RecursiveMap<K, V>>;

class Assignable {
  private _id: string;
  private name: string;
  private contact?: Map<string, string>;
  private availability?: Map<string, string>;
  private location?: Map<string, string>;
  private affinity?: Map<string, string | number>;
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
    availability?: Map<string, string>;
    location?: Map<string, string>;
    affinity?: Map<string, string>;
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
            Array.from(data.getContact() as Map<string, string>).map(
              ([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              )
            )}
          {data.getAvailability() &&
            Array.from(data.getAvailability() as Map<string, string>).map(
              ([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              )
            )}
          {data.getLocation() &&
            Array.from(data.getLocation() as Map<string, string>).map(
              ([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              )
            )}
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

const AssignableForm = ({
  preset,
  assignableCallback,
}: {
  preset: any;
  assignableCallback: (assignable: Assignable) => void;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [data, setData] = useState<{
    id?: string;
    name: string;
  }>({
    id: "",
    name: "",
  });
  const updateForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };

  const [fieldName, setFieldName] = useState<string>("");
  const [fieldType, setFieldType] = useState<string>("");
  const updateFieldType = (event: ChangeEvent<HTMLSelectElement>) => {
    setFieldType(event.target.value);
  };
  const createField = () => {
    switch (fieldType) {
      case "contact":
        contactDispatch({
          type: "create",
          key: fieldName || "Field " + contact.size.toLocaleString(),
          value: "",
        });
        break;
      case "availability":
        availabilityDispatch({
          type: "create",
          key: fieldName || "Field " + availability.size.toLocaleString(),
          value: "",
        });
        break;
      case "location":
        locationDispatch({
          type: "create",
          key: fieldName || "Field " + location.size.toLocaleString(),
          value: "",
        });
        break;
      case "affinity":
        affinityDispatch({
          type: "create",
          key: fieldName || "Field " + affinity.size.toLocaleString(),
          value: "",
        });
        break;
      default:
        miscellaneousDispatch({
          type: "create",
          key: fieldName || "Field " + miscellaneous.size.toLocaleString(),
          value: "",
        });
    }
    setFieldName("");
  };

  const [contact, contactDispatch] = useReducer(
    mapReducer<string, string>(),
    new Map<string, string>()
  );
  const updateContact = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    contactDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [availability, availabilityDispatch] = useReducer(
    mapReducer<string, string>(),
    new Map<string, string>()
  );
  const updateAvailability = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    availabilityDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [location, locationDispatch] = useReducer(
    mapReducer<string, string>(),
    new Map<string, string>()
  );
  const updateLocation = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    locationDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [affinity, affinityDispatch] = useReducer(
    mapReducer<string, string>(),
    new Map<string, string>()
  );
  const updateAffinity = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    affinityDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [miscellaneous, miscellaneousDispatch] = useReducer(
    mapReducer<string, string>(),
    new Map<string, string>()
  );
  const updateMiscellaneous = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    miscellaneousDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };

  useEffect(() => {
    if (preset.presetFields)
      for (const idk of preset.presetFields) {
        switch (idk[1][0]) {
          case "contact":
            contactDispatch({
              type: "create",
              key: idk[0],
              value: "",
            });
            break;
          default:
            miscellaneousDispatch({
              type: "create",
              key: idk[0],
              value: "",
            });
        }
      }
  }, [preset]);

  const [isLeader, setIsLeader] = useState<boolean>(false);

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    const ID = () => {
      switch (preset.useIDSource) {
        case "name":
          return data.name;
        case "id":
        default:
          return data.id;
      }
    };
    assignableCallback(
      new Assignable({
        id: ID() || "error",
        name: data.name,
        contact: contact,
        availability: availability,
        location: location,
        affinity: affinity,
        leader: isLeader,
      })
    );

    /**reset form fields */
    setData({
      id: "",
      name: "",
    });
    contact.forEach((_, key) => {
      contactDispatch({ type: "create", key: key, value: "" });
    });
    availability.forEach((_, key) => {
      availabilityDispatch({ type: "create", key: key, value: "" });
    });
    location.forEach((_, key) => {
      locationDispatch({ type: "create", key: key, value: "" });
    });
    affinity.forEach((_, key) => {
      affinityDispatch({ type: "create", key: key, value: "" });
    });
    miscellaneous.forEach((_, key) => {
      miscellaneousDispatch({ type: "create", key: key, value: "" });
    });
    assignableFormRef.current?.reset();
  };

  return (
    <form
      className="my-1 flex flex-col"
      onSubmit={submitForm}
      ref={assignableFormRef}
    >
      <label className="text-center">New Assignable</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={data.name}
        placeholder={"Name" + (preset.useIDSource == "name" ? " (ID)" : "")}
        required
        minLength={1}
        onChange={updateForm}
      />
      {preset?.useIDSource == "id" && (
        <input
          className="rounded-sm border"
          type="text"
          name="id"
          value={data.id}
          placeholder="Custom ID"
          required
          minLength={1}
          onChange={updateForm}
        />
      )}
      <ul>
        {[...contact.entries()].map(([key, value]) => (
          <li className="whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Contact)"}
              onChange={updateContact}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                contactDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...availability.entries()].map(([key, value]) => (
          <li className="whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Availability)"}
              onChange={updateAvailability}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                availabilityDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...location.entries()].map(([key, value]) => (
          <li className="whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Location)"}
              onChange={updateLocation}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                locationDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...affinity.entries()].map(([key, value]) => (
          <li className="whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Affinity)"}
              onChange={updateAffinity}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                affinityDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...miscellaneous.entries()].map(([key, value]) => (
          <li className="whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key}
              onChange={updateMiscellaneous}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                miscellaneousDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {preset.allowFieldCreation && (
          <li className="whitespace-nowrap">
            <input
              className="rounded-sm border"
              type="text"
              name="newAssignableField"
              value={fieldName}
              placeholder="New Field"
              size={10}
              onChange={(e) => setFieldName(e.target.value)}
            />
            <select
              className="rounded-sm border"
              name="fieldtype"
              value={fieldType}
              onChange={updateFieldType}
            >
              <option className="dark:text-black">---</option>
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
              <option className="dark:text-black">Other</option>
            </select>
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={createField}
            >
              +
            </button>
          </li>
        )}
      </ul>
      {preset?.useLeader && (
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

const AssignablePresetForm = ({
  assignablePreset,
  assignablePresetCallback,
}: {
  assignablePreset: any;
  assignablePresetCallback: any;
}) => {
  const assignablePresetFormRef = useRef(null);

  const [idSource, setIDSource] = useState<string>(
    assignablePreset.useIDSource
  );
  const [allowFieldCreation, setAllowFieldCreation] = useState<boolean>(
    assignablePreset.allowFieldCreation
  );
  const [useLeader, setUseLeader] = useState<boolean>(
    assignablePreset.useLeader
  );

  const [fieldName, setFieldName] = useState<string>("");
  const [fieldGroup, setFieldGroup] = useState<string>("");
  const [fieldType, setFieldType] = useState<string>("string");
  const [optionalField, setOptionalField] = useState<boolean>(false);
  const [presetFields, presetFieldsDispatch] = useReducer(
    mapReducer<string, [string, string]>(),
    new Map<string, [string, string]>()
  );
  const createField = () => {
    switch (fieldType) {
      /* case "contact":
        contactDispatch({
          type: "create",
          key: fieldName || "Field " + contact.size.toLocaleString(),
          value: "",
        });
        break;
      case "availability":
        availabilityDispatch({
          type: "create",
          key: fieldName || "Field " + availability.size.toLocaleString(),
          value: "",
        });
        break;
      case "location":
        locationDispatch({
          type: "create",
          key: fieldName || "Field " + location.size.toLocaleString(),
          value: "",
        });
        break;
      case "affinity":
        affinityDispatch({
          type: "create",
          key: fieldName || "Field " + affinity.size.toLocaleString(),
          value: "",
        });
        break; */
      default:
        presetFieldsDispatch({
          type: "create",
          key: fieldName /* || "Field " + miscellaneous.size.toLocaleString() */,
          value: [fieldGroup, fieldType],
        });
    }
    setFieldName("");
  };
  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    assignablePresetCallback({
      useIDSource: idSource,
      allowFieldCreation: allowFieldCreation,
      useLeader: useLeader,
      presetFields: presetFields,
    });
  };

  return (
    <form
      className="my-1 flex flex-col"
      onSubmit={submitForm}
      ref={assignablePresetFormRef}
    >
      <label className="text-center">Assignable Presets</label>
      <label>
        ID Source:{" "}
        <select
          className="rounded-sm border"
          name="idsource"
          value={idSource}
          onChange={(e) => setIDSource(e.target.value)}
        >
          <option className="text-black" value="id">
            ID Field
          </option>
          <option className="text-black" value="name">
            Name
          </option>
          {[...presetFields.entries()].map(([key, value]) => (
            <option className="text-black" key={key} value={key}>
              {key} ({value[0]})
            </option>
          ))}
        </select>
      </label>
      <hr />
      <ul>
        {[...presetFields.entries()].map(([key, value]) => (
          <li className="flex flex-row place-content-between" key={key}>
            {key} {value}
            <button
              className="rounded-sm border px-1"
              onClick={() =>
                presetFieldsDispatch({
                  type: "delete",
                  key: key /* || "Field " + miscellaneous.size.toLocaleString() */,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <hr />
      <div className="border p-1">
        <label>
          Add Input Field
          <input
            className="rounded-sm border"
            type="text"
            name="newAssignableField"
            value={fieldName}
            placeholder="Field Name"
            onChange={(e) => setFieldName(e.target.value)}
          />
        </label>
        <div className="whitespace-nowrap">
          <select
            className="rounded-sm border"
            name="fieldgroup"
            value={fieldGroup}
            onChange={(e) => setFieldGroup(e.target.value)}
          >
            <option className="dark:text-black">---</option>
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
            <option className="dark:text-black">Other</option>
          </select>
          <select
            className="rounded-sm border"
            name="fieldtype"
            defaultValue={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
          >
            <option className="dark:text-black" value="string">
              String
            </option>
            <option className="dark:text-black" value="number">
              Number
            </option>
            <option className="dark:text-black" value="boolean">
              Boolean
            </option>
          </select>
          <label>
            Optional?
            <input
              type="checkbox"
              checked={optionalField}
              onChange={(e) => setOptionalField(e.target.checked)}
            />
          </label>
        </div>
        <button
          className="rounded-sm border px-1"
          type="button"
          onClick={createField}
        >
          Add Field
        </button>
      </div>
      <hr />
      <label>
        Allow Field Creation?
        <input
          type="checkbox"
          checked={allowFieldCreation}
          onChange={(e) => setAllowFieldCreation(e.target.checked)}
        />
      </label>
      <hr />
      <label>
        Uses Leaders?
        <input
          type="checkbox"
          checked={useLeader}
          onChange={(e) => setUseLeader(e.target.checked)}
        />
      </label>
      <button className="rounded-full border" type="submit">
        Save Assignable Presets
      </button>
    </form>
  );
};

const GroupForm = ({
  groupCallback,
  assignableCollection,
}: {
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
  }>({
    id: "",
    name: "",
  });
  const updateData = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };
  const [useLeader, setUseLeader] = useState<boolean>(false);
  const [leader, setLeader] = useState<string>("");

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    if (useLeader) {
      const name = data.name && data.name.length > 0 ? data.name : undefined;
      groupCallback(
        new Group({
          id: leader,
          name: name,
          leader: assignableCollection.get(leader),
        }),
        assignableCollection.get(leader)
      );
    } else {
      const name = data.name && data.name.length > 0 ? data.name : undefined;
      groupCallback(
        new Group({
          id: data.id,
          name: name,
        })
      );
    }
    setData({
      id: "",
      name: "",
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
      <div className="whitespace-nowrap">
        {(unassignedLeaderList.length > 0 || useLeader) && (
          <button
            className="rounded-sm border px-1"
            type="button"
            onClick={() => setUseLeader(!useLeader)}
          >
            {useLeader ? "Leader" : "ID"}
          </button>
        )}
        {useLeader ? (
          <select
            className="rounded-sm border"
            name="college"
            value={leader}
            onChange={(e) => {
              setLeader(e.target.value);
            }}
          >
            <option className="dark:text-black" value={undefined}>
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
        ) : (
          <input
            className="rounded-sm border"
            type="text"
            name="id"
            value={data.id}
            placeholder="ID"
            onChange={updateData}
          />
        )}
      </div>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={data.name}
        placeholder="Name (Optional)"
        onChange={updateData}
      />
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};

export default function Page() {
  const [assignableCollection, assignableDispatch] = useReducer(
    mapReducer<string, Assignable>(),
    new Map<string, Assignable>()
  );
  const [unassignedCollection, unassignedDispatch] = useReducer(
    mapReducer<string, Assignable>(),
    new Map<string, Assignable>()
  );
  const [groupCollection, groupDispatch] = useReducer(
    mapReducer<string, Group>(),
    new Map<string, Group>()
  );

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

  const [assignablePreset, setAssignablePreset] = useState({
    useIDSource: "id",
    allowFieldCreation: false,
    useLeader: false,
  });

  const deleteAssignable = (assignable: Assignable) => {
    assignableDispatch({
      type: "delete",
      key: assignable.getID(),
    });
    unassignedDispatch({
      type: "delete",
      key: assignable.getID(),
    });
    for (const group of groupCollection.values()) {
      if (group.getLeader() == assignable)
        groupDispatch({ type: "delete", key: group.getID() });
    }
  };

  const addGroup = (group: Group, leader?: Assignable) => {
    groupDispatch({
      type: "create",
      key: group.getID(),
      value: group,
    });
    if (leader) unassignedDispatch({ type: "delete", key: leader.getID() });
  };

  const deleteGroup = (group: Group) => {
    const leader = group.getLeader();
    if (!!leader) {
      unassignedDispatch({
        type: "create",
        key: leader.getID(),
        value: leader,
      });
    }
    for (const assignable of group.getAllMembers().values()) {
      unassignedDispatch({
        type: "create",
        key: assignable.getID(),
        value: assignable,
      });
    }
    groupDispatch({
      type: "delete",
      key: group.getID(),
    });
  };

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);
  const [showAssignablePreset, setShowAssignablePreset] =
    useState<boolean>(false);

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <p>WIP</p>
        <div className="flex flex-row">
          <div>
            <div className="rounded-md border p-2">
              <button
                className="float-right"
                onClick={() => setShowAssignablePreset(!showAssignablePreset)}
              >
                &hellip;
              </button>
              {showAssignablePreset ? (
                <AssignablePresetForm
                  assignablePreset={assignablePreset}
                  assignablePresetCallback={setAssignablePreset}
                />
              ) : (
                <AssignableForm
                  preset={assignablePreset}
                  assignableCallback={addAssignable}
                />
              )}
            </div>
            <div>
              <button
                className="float-right"
                onClick={() => setShowOnlyUnassigned(!showOnlyUnassigned)}
              >
                &hellip;
              </button>
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
          <div>
            <GroupForm
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
