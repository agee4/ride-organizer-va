"use client";

import { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useMapReducer, useSetReducer } from "./helpers";
import {
  defaultSettings,
  Field,
  FieldJSON,
  presetArray,
  Setting,
  SettingJSON,
} from "./settings";
import { AssignableDragLayer } from "./draganddrop";
import {
  Assignable,
  AssignableAttrJSON,
  AssignableJSON,
  filterAssignables,
  sortAssignables,
} from "./Assignable";
import { filterGroups, Group, GroupJSON, sortGroups } from "./Group";
import { PresetForm, SettingsForm } from "./SettingComponent";
import { AssignableArrayComponent } from "./AssignableComponent";
import { GroupComponent } from "./GroupComponent";
import { AssignableForm } from "./AssignableForm";
import { GroupForm } from "./GroupForm";

export default function Page() {
  const [assignableCollection, assignableDispatch] = useMapReducer<
    string,
    Assignable
  >();
  const [unassignedCollection, unassignedDispatch] = useSetReducer<string>();
  const [groupCollection, groupDispatch] = useMapReducer<string, Group>();

  const [settings, setSettings] = useState<Setting>(defaultSettings);

  const [presetCollection, presetDispatch] = useMapReducer<
    string | undefined,
    Setting
  >(
    new Map<string | undefined, Setting>(
      presetArray.map((setting) => [setting.getName(), setting])
    )
  );

  useEffect(() => {
    const storedSettingString = localStorage.getItem("settings");
    if (storedSettingString) {
      const storedSettingJSON: SettingJSON = JSON.parse(storedSettingString);
      const preset = presetCollection.get(storedSettingJSON["name"]);
      if (preset) setSettings(preset);
      else {
        const newSettingFields = new Map<string, Field>();
        if (storedSettingJSON["assignableFields"])
          for (const FieldJSONString of storedSettingJSON["assignableFields"]) {
            const storedField: FieldJSON = JSON.parse(FieldJSONString);
            newSettingFields.set(
              storedField["name"],
              new Field({
                name: storedField["name"],
                type: storedField["type"],
                group: storedField["group"],
                required: storedField["required"],
                options: new Set<string>(storedField["options"]),
                multiple: storedField["multiple"],
              })
            );
          }
        const newSetting = new Setting({
          name: storedSettingJSON["name"],
          assignableIDSource: storedSettingJSON["assignableIDSource"],
          assignableFields: newSettingFields,
          assignableNotes: storedSettingJSON["assignableNotes"],
          useLeader: storedSettingJSON["useLeader"],
          groupIDSource: storedSettingJSON["groupIDSource"],
          groupCustomName: storedSettingJSON["groupCustomName"],
          groupUseSize: storedSettingJSON["groupUseSize"],
          groupSizeSource: storedSettingJSON["groupSizeSource"],
          groupNotes: storedSettingJSON["groupNotes"],
          autoGroups: storedSettingJSON["autoGroups"],
        });
        setSettings(newSetting);
        if (storedSettingJSON["name"])
          presetDispatch({
            type: "create",
            key: storedSettingJSON["name"],
            value: newSetting,
          });
      }
    }
    const storedAssignableString = localStorage.getItem("assignable");
    if (storedAssignableString) {
      const storedAssignableArray: Array<AssignableJSON> = JSON.parse(
        storedAssignableString
      );
      for (const storedAssignable of storedAssignableArray)
        assignableDispatch({
          type: "create",
          key: storedAssignable["id"],
          value: new Assignable({
            id: storedAssignable["id"],
            name: storedAssignable["name"],
            attributes: new Map<string, string | number | boolean | string[]>(
              storedAssignable["attributes"]?.map((value) => {
                const test: AssignableAttrJSON = JSON.parse(value);
                return [test["key"], test["value"]];
              })
            ),
            attributeGroups: new Map<string, string>(
              storedAssignable["attributes"]?.map((value) => {
                const test: AssignableAttrJSON = JSON.parse(value);
                return [test["key"], test["group"]];
              })
            ),
            leader: storedAssignable["leader"],
            size: storedAssignable["size"]
              ? (storedAssignable["size"] as number)
              : undefined,
            notes: storedAssignable["notes"],
          }),
        });
    }
    const storedUnassignedString = localStorage.getItem("unassigned");
    if (storedUnassignedString)
      unassignedDispatch({
        type: "replace",
        value: new Set<string>(storedUnassignedString.split(",")),
      });
    const storedGroupString = localStorage.getItem("group");
    if (storedGroupString) {
      const storedGroupArray: Array<GroupJSON> = JSON.parse(storedGroupString);
      for (const storedGroup of storedGroupArray) {
        groupDispatch({
          type: "create",
          key: storedGroup["id"],
          value: new Group({
            id: storedGroup["id"],
            members: new Set<string>(storedGroup["members"]),
            name: storedGroup["name"],
            leader: storedGroup["leader"],
            size: storedGroup["size"],
            notes: storedGroup["notes"],
          }),
        });
      }
    }
  }, []);

  useEffect(() => {
    const settingFields = new Array<string>();
    for (const field of settings.getAssignableFields().values()) {
      const fieldString = JSON.stringify({
        name: field.getName(),
        type: field.getType(),
        group: field.getGroup(),
        required: field.getRequired(),
        options: Array.from(field.getOptions()),
        multiple: field.getMultiple(),
      });
      settingFields.push(fieldString);
    }
    localStorage.setItem(
      "settings",
      JSON.stringify({
        name: settings.getName(),
        assignableIDSource: settings.getAssignableIDSource(),
        assignableFields: settingFields,
        assignableNotes: settings.getAssignableNotes(),
        useLeader: settings.getUseLeader(),
        groupIDSource: settings.getGroupIDSource(),
        groupCustomName: settings.getGroupCustomName(),
        groupUseSize: settings.getGroupUseSize(),
        groupSizeSource: settings.getGroupSizeSource(),
        groupNotes: settings.getGroupNotes(),
        autoGroups: settings.getAutoGroups(),
      })
    );
  }, [settings]);
  useEffect(() => {
    const assignableStorage = new Array<AssignableJSON>();
    for (const assignable of assignableCollection.values()) {
      const assignableAttributes = new Array<string>();
      for (const [attrkey, attrval] of assignable.getAttributes().entries())
        assignableAttributes.push(
          JSON.stringify({
            key: attrkey,
            value: attrval,
            group: assignable.getAttributeGroups().get(attrkey) || "!ERROR!",
          })
        );
      assignableStorage.push({
        id: assignable.getID(),
        name: assignable.getName(),
        attributes: assignableAttributes,
        leader: assignable.getLeader(),
        size: assignable.getSize(),
        notes: assignable.getNotes(),
      });
    }
    localStorage.setItem("assignable", JSON.stringify(assignableStorage));
  }, [assignableCollection]);
  useEffect(() => {
    localStorage.setItem(
      "unassigned",
      Array.from(unassignedCollection).toString()
    );
  }, [unassignedCollection]);
  useEffect(() => {
    const groupStorage = new Array<GroupJSON>();
    for (const group of groupCollection.values()) {
      groupStorage.push({
        id: group.getID(),
        members: Array.from(group.getAllMembers()),
        name: group.getName(),
        leader: group.getLeader(),
        size: group.getSize(),
        notes: group.getNotes(),
      });
    }
    localStorage.setItem("group", JSON.stringify(groupStorage));
  }, [groupCollection]);

  const [assignableSort, setAssignableSort] = useState<string>("");
  const [assignableReverse, setAssignableReverse] = useState<boolean>(false);
  const [assignableFilter, setAssignableFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const assignableArray = useMemo(() => {
    let newAssignableArray = sortAssignables(
      filterAssignables(
        Array.from(assignableCollection.values()),
        unassignedCollection,
        assignableFilter
      ),
      assignableSort
    ).map((a) => a.getID());
    if (assignableReverse) newAssignableArray.reverse();
    return newAssignableArray;
  }, [
    assignableCollection,
    unassignedCollection,
    assignableSort,
    assignableReverse,
    assignableFilter,
  ]);

  const [groupSort, setGroupSort] = useState<string>("");
  const [groupReverse, setGroupReverse] = useState<boolean>(false);
  const [groupFilter, setGroupFilter] = useState<Array<string>>(
    new Array<string>()
  );
  const groupArray = useMemo(() => {
    let newGroupArray = sortGroups(
      filterGroups(
        Array.from(groupCollection.values()),
        assignableCollection,
        groupFilter
      ),
      groupSort
    ).map((g) => g.getID());
    if (groupReverse) newGroupArray.reverse();
    return newGroupArray;
  }, [
    groupCollection,
    assignableCollection,
    groupSort,
    groupReverse,
    groupFilter,
  ]);

  const createAssignable = (assignable: Assignable) => {
    assignableDispatch({
      type: "create",
      key: assignable.getID(),
      value: assignable,
    });
    if (settings.getAutoGroups() && assignable.getLeader()) {
      createGroup(
        new Group({
          id: assignable.getID(),
          leader: assignable.getID(),
          size: assignable.getSize(),
        })
      );
    } else {
      unassignedDispatch({
        type: "create",
        value: assignable.getID(),
      });
    }
  };

  const deleteAssignable = (assignableID: string) => {
    assignableDispatch({
      type: "delete",
      key: assignableID,
    });
    unassignedDispatch({
      type: "delete",
      value: assignableID,
    });
    /**ensure assignable is removed from any groups */
    groupCollection.forEach((group, groupKey) => {
      if (group.getLeader() == assignableID) {
        group.getAllMembers().forEach((memberID) => {
          unassignedDispatch({
            type: "create",
            value: memberID,
          });
        });
        groupDispatch({ type: "delete", key: groupKey });
      }
      group.getAllMembers().forEach((memberID) => {
        if (memberID == assignableID)
          groupDispatch({ type: "delete", key: memberID });
      });
      if (group.getAllMembers().has(assignableID)) {
        group.getAllMembers().delete(assignableID);
        groupDispatch({ type: "create", key: groupKey, value: group });
      }
    });
  };

  const createGroup = (group: Group) => {
    groupDispatch({
      type: "create",
      key: group.getID(),
      value: group,
    });
    const leader = group.getLeader();
    if (leader) unassignedDispatch({ type: "delete", value: leader });
  };

  const deleteGroup = (groupID: string) => {
    const group = groupCollection.get(groupID);
    if (group) {
      const leaderID = group.getLeader();
      if (leaderID)
        unassignedDispatch({
          type: "create",
          value: leaderID,
        });
      group.getAllMembers().forEach((memberID) => {
        unassignedDispatch({
          type: "create",
          value: memberID,
        });
      });
      groupDispatch({
        type: "delete",
        key: groupID,
      });
    }
  };

  const addGroupMember = (groupID: string, memberID?: string) => {
    const group = groupCollection.get(groupID);
    const newMember = assignableCollection.get(
      memberID
        ? memberID
        : assignableArray.filter((a) => unassignedCollection.has(a)).shift() ||
            ""
    );
    if (group && newMember) {
      group.getAllMembers().add(newMember.getID());
      groupCollection.forEach((otherGroup) => {
        if (groupID == otherGroup.getID()) {
          groupDispatch({ type: "create", key: groupID, value: group });
        } else {
          otherGroup.getAllMembers().delete(newMember.getID());
          groupDispatch({
            type: "create",
            key: otherGroup.getID(),
            value: otherGroup,
          });
        }
      });
      unassignedDispatch({ type: "delete", value: newMember.getID() });
    }
  };

  const removeGroupMember = (groupID: string, memberID: string) => {
    const group = groupCollection.get(groupID);
    const removedMember = assignableCollection.get(memberID);
    if (group && removedMember) {
      group.getAllMembers().delete(memberID);
      groupDispatch({ type: "create", key: groupID, value: group });
      unassignedDispatch({
        type: "create",
        value: memberID,
      });
    }
  };

  const [showSettingsForm, setShowSettingsForm] = useState<boolean>(false);
  const [showAssignableFilter, setShowAssignableFilter] =
    useState<boolean>(false);
  const [showGroupFilter, setShowGroupFilter] = useState<boolean>(false);

  const filterArray = useMemo(() => {
    return Array.from(settings.getAssignableFields().entries()).filter(
      ([, field]) => ["select", "checkbox"].includes(field.getType())
    );
  }, [settings]);

  const assignableFilterSize = useMemo(() => {
    const fullAssignableFilterSize =
      +settings.getUseLeader() +
      filterArray.length +
      filterArray
        .map(([, field]) => field.getOptions().size)
        .reduce((prev, curr) => prev + curr, 0);
    return fullAssignableFilterSize < 5 ? fullAssignableFilterSize : 4;
  }, [settings, filterArray]);
  const groupFilterSize = useMemo(() => {
    const fullGroupFilterSize =
      +settings.getGroupUseSize() +
      +settings.getUseLeader() *
        (filterArray.length +
          filterArray
            .map(([, field]) => field.getOptions().size)
            .reduce((prev, curr) => prev + curr, 0));
    return fullGroupFilterSize < 5 ? fullGroupFilterSize : 4;
  }, [settings, filterArray]);
  const showGroupForm = useMemo(() => {
    return (
      settings.getGroupIDSource() != "leader" ||
      Array.from(unassignedCollection).some((a) =>
        assignableCollection.get(a)?.getLeader()
      )
    );
  }, [settings, assignableCollection, unassignedCollection]);

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8">
        <h1>GroupU Org ~ Group Organizer</h1>
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
              createAssignable={createAssignable}
            />
            {showGroupForm ? (
              <GroupForm
                settings={settings}
                createGroup={createGroup}
                unassignedCollection={unassignedCollection}
                assignableCollection={assignableCollection}
              />
            ) : (
              <div />
            )}
            {!!assignableCollection.size && (
              <div className="relative rounded-md border p-1">
                <h1 className="text-center">Assignables</h1>
                <div className="flex flex-row place-content-end">
                  <select
                    className={
                      "rounded-sm border " +
                      (!assignableSort && "text-neutral-500")
                    }
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
                </div>
                {!!assignableFilterSize && (
                  <div className="flex flex-row place-content-end">
                    {showAssignableFilter ? (
                      <select
                        className="rounded-sm border"
                        value={assignableFilter}
                        onChange={(e) =>
                          setAssignableFilter(
                            [...e.target.selectedOptions].map((o) => o.value)
                          )
                        }
                        multiple
                        size={assignableFilterSize}
                      >
                        <option value="_unassigned">Unassigned</option>
                        {settings.getUseLeader() && (
                          <option value="_leader">Leader</option>
                        )}
                        {filterArray.map(([key, value]) =>
                          value.getType() == "select" ? (
                            <optgroup key={key} label={key}>
                              {Array.from(value.getOptions()).map((option) => (
                                <option value={key + "|" + option} key={option}>
                                  {option}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            <option value={key} key={key}>
                              {key}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <p
                        className={
                          "rounded-sm border " +
                          (assignableFilter.length < 1 &&
                            " border-neutral-500 text-neutral-500")
                        }
                        onClick={() =>
                          setShowAssignableFilter(!showAssignableFilter)
                        }
                      >
                        {assignableFilter.length < 1
                          ? "-Filter-"
                          : assignableFilter.toLocaleString()}
                      </p>
                    )}
                    <button
                      className="ml-1 font-bold text-neutral-500"
                      onClick={() =>
                        setShowAssignableFilter(!showAssignableFilter)
                      }
                    >
                      {showAssignableFilter ? (
                        <span>&times;</span>
                      ) : (
                        <span>&hellip;</span>
                      )}
                    </button>
                  </div>
                )}
                <AssignableArrayComponent
                  assignableArray={assignableArray}
                  assignableCollection={assignableCollection}
                  unassignedCollection={unassignedCollection}
                  groupCollection={groupCollection}
                  deleteAssignable={deleteAssignable}
                  removeGroupMember={removeGroupMember}
                />
              </div>
            )}
            {groupCollection.size > 0 && (
              <div className="rounded-md border p-1">
                <h1 className="text-center">Groups</h1>
                <div className="flex flex-row place-content-end">
                  <select
                    className={
                      "rounded-sm border " + (!groupSort && "text-neutral-500")
                    }
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
                </div>
                {!!groupFilterSize && (
                  <div className="flex flex-row place-content-end">
                    {showGroupFilter ? (
                      <select
                        className="rounded-sm border"
                        value={groupFilter}
                        onChange={(e) =>
                          setGroupFilter(
                            [...e.target.selectedOptions].map((o) => o.value)
                          )
                        }
                        multiple
                        size={groupFilterSize}
                      >
                        {settings.getGroupUseSize() && (
                          <option value="_unfull">Space Left</option>
                        )}
                        {filterArray.map(([key, value]) =>
                          value.getType() == "select" ? (
                            <optgroup key={key} label={key}>
                              {Array.from(value.getOptions()).map((option) => (
                                <option value={key + "|" + option} key={option}>
                                  {option}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            <option key={key}>{key}</option>
                          )
                        )}
                      </select>
                    ) : (
                      <p
                        className={
                          "rounded-sm border " +
                          (groupFilter.length < 1 &&
                            " border-neutral-500 text-neutral-500")
                        }
                        onClick={() => setShowGroupFilter(!showGroupFilter)}
                      >
                        {groupFilter.length < 1
                          ? "-Filter-"
                          : groupFilter.toLocaleString()}
                      </p>
                    )}
                    <button
                      className="ml-1 font-bold text-neutral-500"
                      onClick={() => setShowGroupFilter(!showGroupFilter)}
                    >
                      {showGroupFilter ? (
                        <span>&times;</span>
                      ) : (
                        <span>&hellip;</span>
                      )}
                    </button>
                  </div>
                )}
                <ul className="max-h-[70svh] overflow-auto">
                  {groupArray.map((value) => (
                    <li key={value}>
                      <GroupComponent
                        groupID={value}
                        groupCollection={groupCollection}
                        assignableCollection={assignableCollection}
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
  );
}
