"use client";

import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useMapReducer } from "./helpers";
import {
  defaultSettings,
  presetArray,
  PresetForm,
  Setting,
  SettingsForm,
} from "./settings";
import { GroupOrganizerContext } from "./context";
import { AssignableDragLayer } from "./draganddrop";
import { Assignable, filterAssignables, sortAssignables } from "./Assignable";
import { filterGroups, Group, sortGroups } from "./Group";
import { AssignableArrayComponent } from "./AssignableComponent";
import { GroupComponent } from "./GroupComponent";
import { AssignableForm } from "./AssignableForm";
import { GroupForm } from "./GroupForm";

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
    new Map(presetArray.map((setting) => [setting.getName(), setting]))
  );

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);
  const [showSettingsForm, setShowSettingsForm] = useState<boolean>(false);

  const [assignableArray, setAssignableArray] = useState<Array<string>>(
    new Array<string>()
  );
  const [unassignedArray, setUnassignedArray] = useState<Array<string>>(
    new Array<string>()
  );
  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableReverse, setAssignableReverse] = useState<boolean>(false);
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>(
    new Array<string>()
  );

  const [groupArray, setGroupArray] = useState<Array<Group>>(
    new Array<Group>()
  );
  const [groupSort, setGroupSort] = useState<string>("");
  const [groupReverse, setGroupReverse] = useState<boolean>(false);
  const [groupFilter, setGroupFilter] = useState<Array<string>>(
    new Array<string>()
  );

  /**Update Assignable Array */
  useEffect(() => {
    setAssignableArray(
      assignableReverse
        ? sortAssignables(
            filterAssignables(
              Array.from(assignableCollection.values()),
              assignableFilter
            ),
            assignableSort
          )
            .map((a) => a.getID())
            .reverse()
        : sortAssignables(
            filterAssignables(
              Array.from(assignableCollection.values()),
              assignableFilter
            ),
            assignableSort
          ).map((a) => a.getID())
    );
    setUnassignedArray(
      assignableReverse
        ? sortAssignables(
            filterAssignables(
              Array.from(unassignedCollection.values()),
              assignableFilter
            ),
            assignableSort
          )
            .map((a) => a.getID())
            .reverse()
        : sortAssignables(
            filterAssignables(
              Array.from(unassignedCollection.values()),
              assignableFilter
            ),
            assignableSort
          ).map((a) => a.getID())
    );
  }, [
    assignableCollection,
    unassignedCollection,
    assignableSort,
    assignableReverse,
    assignableFilter,
  ]);

  /**Update Group Array */
  useEffect(() => {
    setGroupArray(
      groupReverse
        ? sortGroups(
            filterGroups(Array.from(groupCollection.values()), groupFilter),
            groupSort
          ).reverse()
        : sortGroups(
            filterGroups(Array.from(groupCollection.values()), groupFilter),
            groupSort
          )
    );
  }, [groupCollection, groupSort, groupReverse, groupFilter]);

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
    groupCollection.forEach((group, groupKey) => {
      if (group.getLeader() == assignable) {
        group.getAllMembers().forEach((value, key) => {
          unassignedDispatch({
            type: "create",
            key: key,
            value: value,
          });
        });
        groupDispatch({ type: "delete", key: groupKey });
      }
      group.getAllMembers().forEach((member, memberKey) => {
        if (member.equals(assignable))
          groupDispatch({ type: "delete", key: memberKey });
      });
      if (group.getAllMembers().has(assignable.getID())) {
        group.getAllMembers().delete(assignable.getID());
        groupDispatch({ type: "create", key: groupKey, value: group });
      }
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

  const addGroupMember = (group: Group, memberid?: string) => {
    const newMember = assignableCollection.get(
      memberid ? memberid : unassignedArray.shift() || ""
    );
    if (newMember) {
      group.getAllMembers().set(newMember.getID(), newMember);
      groupCollection.forEach((otherGroup) => {
        if (group.getID() == otherGroup.getID()) {
          groupDispatch({ type: "create", key: group.getID(), value: group });
        } else {
          otherGroup.getAllMembers().delete(newMember.getID());
          groupDispatch({
            type: "create",
            key: otherGroup.getID(),
            value: otherGroup,
          });
        }
      });
      unassignedDispatch({ type: "delete", key: newMember.getID() });
    }
  };

  const removeGroupMember = (group: Group, member: Assignable) => {
    group.getAllMembers().delete(member.getID());
    groupDispatch({ type: "create", key: group.getID(), value: group });
    unassignedDispatch({ type: "create", key: member.getID(), value: member });
  };

  const filterArray = Array.from(
    settings.getAssignableFields().entries()
  ).filter(([, value]) => ["select", "checkbox"].includes(value.getType()));

  return (
    <GroupOrganizerContext.Provider
      value={{
        assignableCollection: assignableCollection,
        unassignedCollection: unassignedCollection,
        groupCollection: groupCollection,
        selectMode: false,
      }}
    >
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
          <DndProvider backend={HTML5Backend}>
            <AssignableDragLayer assignableCollection={assignableCollection} />
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
                  <button
                    className="ml-1 font-bold text-neutral-500"
                    onClick={() => setAssignableReverse(!assignableReverse)}
                  >
                    {assignableReverse ? (
                      <span>&uarr;</span>
                    ) : (
                      <span>&darr;</span>
                    )}
                  </button>
                  {(settings.getUseLeader() || filterArray.length > 0) && (
                    <select
                      className="rounded-sm border"
                      value={assignableFilter}
                      onChange={(e) =>
                        setAssignableFilter(
                          [...e.target.selectedOptions].map((o) => o.value)
                        )
                      }
                      multiple
                      size={
                        +settings.getUseLeader() + filterArray.length < 5
                          ? +settings.getUseLeader() + filterArray.length
                          : 4
                      }
                    >
                      {settings.getUseLeader() && (
                        <option value="leader">Leader</option>
                      )}
                      {filterArray.map(([key, value]) =>
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
                  <AssignableArrayComponent
                    assignableArray={
                      showOnlyUnassigned ? unassignedArray : assignableArray
                    }
                    deleteAssignable={deleteAssignable}
                    removeGroupMember={removeGroupMember}
                  />
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
                        .filter(([, value]) =>
                          ["text"].includes(value.getType())
                        )
                        .map(([key, value]) =>
                          value.getType() == "select" ? (
                            <optgroup
                              className="dark:text-black"
                              key={key}
                              label={key}
                            >
                              {Array.from(value.getOptions()).map((option) => (
                                <option
                                  className="dark:text-black"
                                  key={option}
                                >
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
                  <button
                    className="ml-1 font-bold text-neutral-500"
                    onClick={() => setGroupReverse(!groupReverse)}
                  >
                    {groupReverse ? <span>&uarr;</span> : <span>&darr;</span>}
                  </button>
                  {(settings.getGroupUseSize() ||
                    (settings.getUseLeader() && filterArray.length > 0)) && (
                    <select
                      className="rounded-sm border"
                      value={groupFilter}
                      onChange={(e) =>
                        setGroupFilter(
                          [...e.target.selectedOptions].map((o) => o.value)
                        )
                      }
                      multiple
                      size={
                        +settings.getGroupUseSize() +
                          +settings.getUseLeader() * filterArray.length <
                        5
                          ? +settings.getGroupUseSize() +
                            +settings.getUseLeader() * filterArray.length
                          : 4
                      }
                    >
                      {settings.getGroupUseSize() && (
                        <option value="unfull">Space Left</option>
                      )}
                      {filterArray.map(([key, value]) =>
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
                  <ul className="max-h-[70svh] overflow-auto">
                    {groupArray.map((value) => (
                      <li key={value.getID()}>
                        <GroupComponent
                          data={value}
                          deleteGroup={deleteGroup}
                          addGroupMember={addGroupMember}
                          removeGroupMember={removeGroupMember}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DndProvider>
        </main>
      </div>
    </GroupOrganizerContext.Provider>
  );
}
