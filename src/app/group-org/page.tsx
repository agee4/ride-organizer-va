"use client";

import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useReducer,
  useRef,
  useState,
} from "react";

class Assignable {
  private _id: string;
  private name: string;
  private contact?: Map<string, string>;
  private availability?: Map<string, string>;
  private location?: Map<string, string>;
  private affinity?: Map<string, string | number>;
  private head?: boolean;
  private size?: number;
  private notes?: string;

  constructor({
    id,
    name,
    contact,
    availability,
    location,
    affinity,
    head,
    size,
    notes,
  }: {
    id: string;
    name: string;
    contact?: Map<string, string>;
    availability?: Map<string, string>;
    location?: Map<string, string>;
    affinity?: Map<string, string>;
    head?: boolean;
    size?: number;
    notes?: string;
  }) {
    this._id = id;
    this.name = name;
    this.contact = contact;
    this.availability = availability;
    this.location = location;
    this.affinity = affinity;
    this.head = head;
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

  getHead() {
    return this.head;
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
  assignableCallback: ActionDispatch<[action: MapReducerAction<Assignable>]>;
}) => {
  return (
    <div className="my-1 max-w-[496px] rounded-md bg-cyan-200 p-2 dark:bg-cyan-800">
      <ul>
        <div className="flex flex-row place-content-between font-bold">
          {data.getName()}
          <button
            className="rounded-sm border px-1"
            onClick={() =>
              assignableCallback({ type: "delete", key: data.getID() })
            }
          >
            &times;
          </button>
        </div>
        <li className="text-xs italic">{data.getID()}</li>
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
  private head?: Assignable;
  private size?: number;

  constructor({
    id,
    name,
    head,
    size,
    members,
  }: {
    id: string;
    name?: string;
    head?: Assignable;
    size?: number;
    members?: Map<string, Assignable>;
  }) {
    this._id = id;
    this.members = members || new Map<string, Assignable>();
    this.name = name;
    this.head = head;
    this.size = size;
  }

  getID() {
    return this._id;
  }

  getHead() {
    return this.head;
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

type MapReducerAction<T> =
  | { type: "create"; key: string; value: T }
  | { type: "delete"; key: string }
  | { type: "replace"; value: Map<string, T> };

function mapReducer<T>() {
  return (itemMap: Map<string, T>, action: MapReducerAction<T>) => {
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

export const AssignableForm = ({
  assignableCallback,
}: {
  assignableCallback: ActionDispatch<[action: MapReducerAction<Assignable>]>;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [newAssignableData, setNewAssignableData] = useState<{
    id?: string;
    name: string;
  }>({
    id: "",
    name: "",
  });
  const updateAssignableForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewAssignableData({ ...newAssignableData, [name]: value });
  };

  const [newAssignableField, setNewAssignableField] = useState<string>("");
  const [newAssignableFieldType, setNewAssignableFieldType] =
    useState<string>("");
  const updateFieldType = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewAssignableFieldType(event.target.value);
  };
  const createAssignableField = () => {
    switch (newAssignableFieldType) {
      case "contact":
        assignableContactFieldDispatch({
          type: "create",
          key:
            newAssignableField || assignableContactField.size.toLocaleString(),
          value: "",
        });
        break;
      case "availability":
        assignableAvailabilityFieldDispatch({
          type: "create",
          key:
            newAssignableField || assignableAvailabilityField.size.toLocaleString(),
          value: "",
        });
        break;
      case "location":
        assignableLocationFieldDispatch({
          type: "create",
          key:
            newAssignableField || assignableLocationField.size.toLocaleString(),
          value: "",
        });
        break;
      case "affinity":
        assignableAffinityFieldDispatch({
          type: "create",
          key:
            newAssignableField || assignableAffinityField.size.toLocaleString(),
          value: "",
        });
        break;
      default:
        assignableMiscellaneousFieldDispatch({
          type: "create",
          key:
            newAssignableField || assignableMiscellaneousField.size.toLocaleString(),
          value: "",
        });
    }
    setNewAssignableField("");
  };

  const [assignableContactField, assignableContactFieldDispatch] = useReducer(
    mapReducer<string>(),
    new Map<string, string>()
  );
  const updateAssignableContactField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    assignableContactFieldDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [assignableAvailabilityField, assignableAvailabilityFieldDispatch] =
    useReducer(mapReducer<string>(), new Map<string, string>());
  const updateAssignableAvailabilityField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    assignableAvailabilityFieldDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [assignableLocationField, assignableLocationFieldDispatch] =
    useReducer(mapReducer<string>(), new Map<string, string>());
  const updateAssignableLocationField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    assignableLocationFieldDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [assignableAffinityField, assignableAffinityFieldDispatch] =
    useReducer(mapReducer<string>(), new Map<string, string>());
  const updateAssignableAffinityField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    assignableAffinityFieldDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const [assignableMiscellaneousField, assignableMiscellaneousFieldDispatch] =
    useReducer(mapReducer<string>(), new Map<string, string>());
  const updateAssignableMiscellaneousField = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    assignableMiscellaneousFieldDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };
  const createAssignableFromForm = (event: FormEvent) => {
    event.preventDefault();
    const newAssignableID = newAssignableData.id || newAssignableData.name;
    console.log(assignableContactField);
    const newAssignable = {
      id: newAssignableID,
      name: newAssignableData.name,
      contact: assignableContactField,
    };
    assignableCallback({
      type: "create",
      key: newAssignableID,
      value: new Assignable(newAssignable),
    });
    setNewAssignableData({
      id: "",
      name: "",
    });
    assignableContactFieldDispatch({
      type: "replace",
      value: new Map<string, string>(),
    });
    assignableFormRef.current?.reset();
  };
  return (
    <form
      className="my-1 flex flex-col rounded-md border p-2"
      onSubmit={createAssignableFromForm}
      ref={assignableFormRef}
    >
      <label className="text-center">New Assignable</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={newAssignableData.name}
        placeholder="Name"
        required
        minLength={1}
        onChange={updateAssignableForm}
      />
      <input
        className="rounded-sm border"
        type="text"
        name="id"
        value={newAssignableData.id}
        placeholder="Custom ID (optional)"
        onChange={updateAssignableForm}
      />
      <ul>
        {[...assignableContactField.entries()].map(([key, value]) => (
          <li key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Contact)"}
              onChange={updateAssignableContactField}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                assignableContactFieldDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...assignableAvailabilityField.entries()].map(([key, value]) => (
          <li className="inline-block whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Availability)"}
              onChange={updateAssignableAvailabilityField}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                assignableAvailabilityFieldDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...assignableLocationField.entries()].map(([key, value]) => (
          <li className="inline-block whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Location)"}
              onChange={updateAssignableLocationField}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                assignableLocationFieldDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...assignableAffinityField.entries()].map(([key, value]) => (
          <li className="inline-block whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key + "(Affinity)"}
              onChange={updateAssignableAffinityField}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                assignableAffinityFieldDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        {[...assignableMiscellaneousField.entries()].map(([key, value]) => (
          <li className="inline-block whitespace-nowrap" key={key}>
            <input
              className="rounded-sm border"
              type="text"
              name={key}
              value={value}
              placeholder={key}
              onChange={updateAssignableMiscellaneousField}
            />
            <button
              className="rounded-sm border px-1"
              type="button"
              onClick={() =>
                assignableMiscellaneousFieldDispatch({
                  type: "delete",
                  key: key,
                })
              }
            >
              &times;
            </button>
          </li>
        ))}
        <li className="inline-block whitespace-nowrap">
          <input
            className="rounded-sm border"
            type="text"
            name="newAssignableField"
            value={newAssignableField}
            placeholder="New Field"
            size={9}
            onChange={(e) => setNewAssignableField(e.target.value)}
          />
          <select
            className="rounded-sm border"
            name="college"
            value={newAssignableFieldType}
            onChange={updateFieldType}
          >
            <option className="dark:text-black">-field group-</option>
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
          <button
            className="rounded-sm border px-1"
            type="button"
            onClick={createAssignableField}
          >
            +
          </button>
        </li>
      </ul>
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};

export default function Page() {
  const groupFormRef = useRef<HTMLFormElement>(null);
  const [assignableCollection, assignableCollectionDispatch] = useReducer(
    mapReducer<Assignable>(),
    new Map<string, Assignable>()
  );
  const [groupCollection, groupCollectionDispatch] = useReducer(
    mapReducer<Group>(),
    new Map<string, Group>()
  );
  const [newGroupData, setNewGroupData] = useState<{
    id: string;
    name?: string;
  }>({
    id: "",
    name: "",
  });

  const updateGroupForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewGroupData({ ...newGroupData, [name]: value });
  };
  const createGroupFromForm = (event: FormEvent) => {
    event.preventDefault();
    const newGroupID = newGroupData.id;
    groupCollectionDispatch({
      type: "create",
      key: newGroupID,
      value: new Group({ id: newGroupID }),
    });
    setNewGroupData({
      id: "",
      name: "",
    });
    groupFormRef.current?.reset();
  };

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <p>WIP</p>
        <div className="flex flex-row">
          <div>
            <AssignableForm assignableCallback={assignableCollectionDispatch} />
            {assignableCollection && (
              <>
                <h1 className="text-center">Assignables</h1>
                <ul>
                  {[...assignableCollection.values()].map((value) => (
                    <li key={value.getID()}>
                      <AssignableComponent
                        data={value}
                        assignableCallback={assignableCollectionDispatch}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            <form
              className="my-1 flex flex-col rounded-md border p-2"
              onSubmit={createGroupFromForm}
              ref={groupFormRef}
            >
              <label className="text-center">New Group</label>
              <input
                className="rounded-sm border"
                type="text"
                name="id"
                value={newGroupData.id}
                placeholder="ID"
                onChange={updateGroupForm}
              />
              <button className="rounded-full border" type="submit">
                Create
              </button>
            </form>
            {groupCollection && (
              <>
                <h1 className="text-center">Groups</h1>
                <ul>
                  {[...groupCollection.values()].map((value) => (
                    <li key={value.getID()}>{JSON.stringify(value)}</li>
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
