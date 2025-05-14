"use client";

import { useEffect, useState } from "react";
import { useMapReducer, useSetReducer } from "./helpers";
import {
  defaultSettings,
  Field,
  FieldJSON,
  presetArray,
  Setting,
  SettingJSON,
} from "./settings";
import { Assignable, AssignableAttrJSON, AssignableJSON } from "./Assignable";
import { Group, GroupJSON } from "./Group";
import { PresetForm, SettingsForm } from "./SettingComponent";
import { AssignableManager } from "./AssignableManager";
import { GroupManager } from "./GroupManager";

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

  /**Load settings, assignables, unassigned, and groups from localStorage */
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

  /**Save the following to localStorage */
  /**Settings */
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
  /**Assignables */
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
  /**Unassigned */
  useEffect(() => {
    localStorage.setItem(
      "unassigned",
      Array.from(unassignedCollection).toString()
    );
  }, [unassignedCollection]);
  /**Groups */
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

  const addGroupMember = (groupID: string, memberID: string) => {
    const group = groupCollection.get(groupID);
    const newMember = assignableCollection.get(memberID);
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
  const [showGroupManager, setShowGroupManager] = useState<boolean>(false);

  const allowShowGroupManager =
    showGroupManager ||
    settings.getGroupIDSource() != "leader" ||
    Array.from(unassignedCollection).some((a) =>
      assignableCollection.get(a)?.getLeader()
    ) ||
    groupCollection.size > 0;

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
        <div className="flex flex-col gap-1">
          {allowShowGroupManager && (
            <button
              className="rounded-sm border px-1"
              onClick={() => setShowGroupManager(!showGroupManager)}
            >
              Manage {!showGroupManager ? "Groups" : "Assignables"}
            </button>
          )}
          {!showGroupManager ? (
            <AssignableManager
              settings={settings}
              assignableCollection={assignableCollection}
              unassignedCollection={unassignedCollection}
              createAssignable={createAssignable}
              deleteAssignable={deleteAssignable}
            />
          ) : (
            <GroupManager
              settings={settings}
              assignableCollection={assignableCollection}
              unassignedCollection={unassignedCollection}
              groupCollection={groupCollection}
              createGroup={createGroup}
              deleteGroup={deleteGroup}
              addGroupMember={addGroupMember}
              removeGroupMember={removeGroupMember}
            />
          )}
        </div>
      </main>
    </div>
  );
}
