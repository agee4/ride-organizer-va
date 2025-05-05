import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Setting } from "./settings";
import { Assignable } from "./Assignable";
import { Group } from "./Group";

export const GroupForm = ({
  settings,
  createGroup,
  unassignedCollection,
  assignableCollection,
}: {
  settings: Setting;
  createGroup: (group: Group) => void;
  unassignedCollection: Set<string>;
  assignableCollection: Map<string, Assignable>;
}) => {
  const groupFormRef = useRef<HTMLFormElement>(null);
  const unassignedLeaderArray = Array.from(unassignedCollection).filter((a) =>
    assignableCollection.get(a)?.getLeader()
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
          if (!!assignableCollection.get(leader)) {
            const name = data.name && data.name.length > 0 ? data.name : leader;
            createGroup(
              new Group({
                id: leader,
                name: name,
                leader: leader,
                size: settings.getGroupUseSize()
                  ? settings.getGroupSizeSource() == "groupsize"
                    ? data.size
                    : assignableCollection.get(leader)?.getSize()
                  : undefined,
                notes: data.notes,
              })
            );
            setLeader("");
          }
        break;
      case "name":
        createGroup(
          new Group({
            id: data.name as string,
            name: data.name,
            size: settings.getGroupUseSize()
              ? settings.getGroupSizeSource() == "groupsize"
                ? data.size
                : assignableCollection.get(leader)?.getSize()
              : undefined,
            notes: data.notes,
          })
        );
        setLeader("");
        break;
      case "id":
      default:
        const name = data.name && data.name.length > 0 ? data.name : undefined;
        createGroup(
          new Group({
            id: data.id,
            name: name,
            leader: settings.getUseLeader() ? leader : undefined,
            size: settings.getGroupUseSize()
              ? settings.getGroupSizeSource() == "groupsize"
                ? data.size
                : assignableCollection.get(leader)?.getSize()
              : undefined,
            notes: data.notes,
          })
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
        <label className="flex flex-row flex-wrap place-content-between">
          {"Leader" +
            (settings.getGroupIDSource() == "leader" ? " (ID)" : "") +
            ":"}
          <select
            className="rounded-sm border"
            name="groupleader"
            value={leader}
            onChange={(e) => {
              setLeader(e.target.value);
            }}
            required={settings.getGroupIDSource() == "leader"}
          >
            <option className="dark:text-black" value="">
              ---
            </option>
            {unassignedLeaderArray.map((a) => (
              <option className="dark:text-black" key={a} value={a}>
                {assignableCollection.get(a)?.getName() || a}
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
          <label className="flex flex-row flex-wrap place-content-between">
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
