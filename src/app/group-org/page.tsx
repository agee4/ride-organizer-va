"use client";

import { ChangeEvent, FormEvent, useReducer, useRef, useState } from "react";

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

export const assignableReducer = (
  assignableCollection: Map<string, Assignable>,
  action:
    | { type: "create"; value: Assignable }
    | { type: "delete"; value: Assignable }
    | { type: "set"; value: Map<string, Assignable> }
) => {
  switch (action.type) {
    case "create": {
      return new Map([...assignableCollection.entries()]).set(
        action.value.getID(),
        action.value
      );
    }
    case "delete": {
      const newCollection = new Map([...assignableCollection.entries()]);
      newCollection.delete(action.value.getID());
      return newCollection;
    }
    case "set": {
      return action.value;
    }
    default:
      throw Error("Unknown action");
  }
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

export const groupReducer = (
  groupCollection: Map<string, Group>,
  action:
    | { type: "create"; value: Group }
    | { type: "delete"; value: Group }
    | { type: "set"; value: Map<string, Group> }
) => {
  switch (action.type) {
    case "create": {
      return new Map([...groupCollection.entries()]).set(
        action.value.getID(),
        action.value
      );
    }
    case "delete": {
      const newCollection = new Map([...groupCollection.entries()]);
      newCollection.delete(action.value.getID());
      return newCollection;
    }
    case "set": {
      return action.value;
    }
    default:
      throw Error("Unknown action");
  }
};

export default function Page() {
  const formRef = useRef<HTMLFormElement>(null);
  const [assignableCollection, setAssignableCollection] = useReducer(
    assignableReducer,
    new Map<string, Assignable>()
  );
  const [newAssignableData, setNewAssignableData] = useState<{
    id?: string;
    name: string;
  }>({
    id: "",
    name: "",
  });
  const [groupCollection, setGroupCollection] = useReducer(
    groupReducer,
    new Map<string, Group>()
  );
  const [newGroupData, setNewGroupData] = useState<{
    id: string;
    name?: string;
  }>({
    id: "",
    name: "",
  });

  const updateAssignableForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewAssignableData({ ...newAssignableData, [name]: value });
  };
  const createAssignableFromForm = (event: FormEvent) => {
    event.preventDefault();
    const newAssignableID = newAssignableData.id || newAssignableData.name;
    const newAssignable = {
      id: newAssignableID,
      name: newAssignableData.name,
    };
    setAssignableCollection({
      type: "create",
      value: new Assignable(newAssignable),
    });
    setNewAssignableData({
      id: "",
      name: "",
    });
    formRef.current?.reset();
  };
  const updateGroupForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewGroupData({ ...newGroupData, [name]: value });
  };
  const createGroupFromForm = (event: FormEvent) => {
    event.preventDefault();
    setGroupCollection({
      type: "create",
      value: new Group({ id: newGroupData.id }),
    });
    formRef.current?.reset();
  };

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <p>WIP</p>
        <div className="flex flex-row">
          <form
            className="my-1 flex flex-col rounded-md border p-2"
            onSubmit={createAssignableFromForm}
            ref={formRef}
          >
            <label>New Assignable</label>
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
              placeholder="Custom ID"
              onChange={updateAssignableForm}
            />
            <button className="rounded-full border" type="submit">
              Create Assignable
            </button>
          </form>
          <form
            className="my-1 flex flex-col rounded-md border p-2"
            onSubmit={createGroupFromForm}
            ref={formRef}
          >
            <label>New Group</label>
            <input
              className="rounded-sm border"
              type="text"
              name="id"
              value={newGroupData.id}
              placeholder="ID"
              required
              minLength={1}
              onChange={updateGroupForm}
            />
            <button className="rounded-full border" type="submit">
              Create Group
            </button>
          </form>
        </div>
        <div className="flex flex-row">
          {assignableCollection && (
            <>
              <h1>Assignables</h1>
              <ul>
                {[...assignableCollection.values()].map((value) => (
                  <li key={value.getID()}>{JSON.stringify(value)}</li>
                ))}
              </ul>
            </>
          )}
          {groupCollection && (
            <>
              <h1>Groups</h1>
              <ul>
                {[...groupCollection.values()].map((value) => (
                  <li key={value.getID()}>{JSON.stringify(value)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
