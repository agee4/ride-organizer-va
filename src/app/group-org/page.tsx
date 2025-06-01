"use client";

import { useEffect, useState } from "react";
import { useMapReducer, useSetReducer } from "../_functions/helpers";
import { useModal } from "../_components/modal";
import {
  defaultSettings,
  Field,
  FieldJSON,
  presetArray,
  Setting,
  SettingJSON,
} from "../_classes/settings";
import {
  Assignable,
  AssignableAttrJSON,
  AssignableJSON,
  AssignableManagerAction,
} from "../_classes/Assignable";
import { Group, GroupJSON, GroupManagerAction } from "../_classes/Group";
import { PresetForm, SettingsForm } from "../_components/_group_org/SettingComponent";
import { AssignableManager } from "../_components/_group_org/_assignable_manager/AssignableManager";
import { GroupManager } from "../_components/_group_org/_group_manager/GroupManager";
import { LoadFile } from "../_components/_group_org/LoadFile";
import { SaveFile } from "../_components/_group_org/SaveFile";

export default function Page() {
  const [assignableCollection, assignableDispatch] = useMapReducer<
    string,
    Assignable
  >();
  const [unassignedCollection, unassignedDispatch] = useSetReducer<string>();
  const [groupCollection, groupDispatch] = useMapReducer<string, Group>();

  const [settings, setSettings] = useState<Setting>(defaultSettings);
  const updateSettings = (setting: Setting) => {
    setSettings(setting);
    closeModal();
  };

  const [presetCollection, presetDispatch] = useMapReducer<
    string | undefined,
    Setting
  >(
    new Map<string | undefined, Setting>(
      presetArray.map((setting) => [setting.getName(), setting])
    )
  );

  const { Modal, setModal, closeModal } = useModal(undefined, true);

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
  }, [
    unassignedDispatch,
    presetCollection,
    presetDispatch,
    assignableDispatch,
    groupDispatch,
  ]);

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

  const assignableManagerDispatch = (action: AssignableManagerAction) => {
    closeModal();
    switch (action.type) {
      case "create":
        assignableDispatch({
          type: "create",
          key: action.assignable.getID(),
          value: action.assignable,
        });
        if (settings.getAutoGroups() && action.assignable.getLeader()) {
          groupManagerDispatch({
            type: "create",
            group: new Group({
              id: action.assignable.getID(),
              leader: action.assignable.getID(),
              size: action.assignable.getSize(),
            }),
          });
        } else {
          unassignedDispatch({
            type: "create",
            value: action.assignable.getID(),
          });
        }
        break;
      case "delete":
        assignableDispatch({
          type: "delete",
          key: action.assignableID,
        });
        unassignedDispatch({
          type: "delete",
          value: action.assignableID,
        });
        /**ensure assignable is removed from any groups */
        groupCollection.forEach((group, groupKey) => {
          if (group.getLeader() == action.assignableID) {
            group.getAllMembers().forEach((memberID) => {
              unassignedDispatch({
                type: "create",
                value: memberID,
              });
            });
            groupDispatch({ type: "delete", key: groupKey });
          }
          group.getAllMembers().forEach((memberID) => {
            if (memberID == action.assignableID)
              groupDispatch({ type: "delete", key: memberID });
          });
          if (group.getAllMembers().has(action.assignableID)) {
            group.getAllMembers().delete(action.assignableID);
            groupDispatch({ type: "create", key: groupKey, value: group });
          }
        });
        break;
      default:
        throw Error("Unknown action");
    }
  };

  const groupManagerDispatch = (action: GroupManagerAction) => {
    closeModal();
    switch (action.type) {
      case "create":
        groupDispatch({
          type: "create",
          key: action.group.getID(),
          value: action.group,
        });
        const leader = action.group.getLeader();
        if (leader) unassignedDispatch({ type: "delete", value: leader });
        for (const member of Array.from(action.group.getAllMembers()))
          unassignedDispatch({ type: "delete", value: member });
        break;
      case "delete":
      case "addmember":
      case "removemember":
        const group = groupCollection.get(action.groupID);
        if (group)
          switch (action.type) {
            case "delete":
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
                key: action.groupID,
              });
              break;
            case "addmember":
            case "removemember":
              const member = assignableCollection.get(action.memberID);
              if (member)
                switch (action.type) {
                  case "addmember":
                    group.getAllMembers().add(action.memberID);
                    groupCollection.forEach((otherGroup) => {
                      if (action.groupID == otherGroup.getID()) {
                        groupDispatch({
                          type: "create",
                          key: action.groupID,
                          value: group,
                        });
                      } else {
                        otherGroup.getAllMembers().delete(action.memberID);
                        groupDispatch({
                          type: "create",
                          key: otherGroup.getID(),
                          value: otherGroup,
                        });
                      }
                    });
                    unassignedDispatch({
                      type: "delete",
                      value: member.getID(),
                    });
                    break;
                  case "removemember":
                    group.getAllMembers().delete(action.memberID);
                    groupDispatch({
                      type: "create",
                      key: action.groupID,
                      value: group,
                    });
                    unassignedDispatch({
                      type: "create",
                      value: action.memberID,
                    });
                    break;
                }
          }
    }
  };
  const [showGroupManager, setShowGroupManager] = useState<boolean>(false);

  const allowShowGroupManager =
    showGroupManager ||
    settings.getGroupIDSource() != "leader" ||
    Array.from(unassignedCollection).some((a) =>
      assignableCollection.get(a)?.getLeader()
    ) ||
    groupCollection.size > 0;

  return (
    <main
      role="main"
      className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-4 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-8"
    >
      {Modal}
      <div className="row-start-2 flex flex-col items-center gap-8">
        <h1 className="font-[family-name:var(--font-geist-mono)]">
          GroupU Org ~ Group Organizer
        </h1>
        {/**Settings & File Forms */}
        <div className="flex flex-col place-content-between gap-1 md:flex-row">
          {/**Setting Form */}
          <div className="flex place-content-center md:block">
            <button
              className="rounded-md border-4 border-double p-1 text-center"
              onClick={() =>
                setModal(
                  <div className="rounded-md border bg-white p-1 text-center dark:bg-black">
                    {/**Preset Form */}
                    <PresetForm
                      settings={settings}
                      settingsCallback={updateSettings}
                      presets={presetCollection}
                      presetsCallback={presetDispatch}
                    />
                    <hr />
                    {/**Settings Form */}
                    <SettingsForm
                      settings={settings}
                      settingsCallback={updateSettings}
                    />
                  </div>
                )
              }
            >
              Settings
            </button>
          </div>
          {/**File Forms */}
          <div className="flex place-content-center md:block">
            <button
              className="rounded-md border-4 border-double p-1 text-center"
              onClick={() =>
                setModal(
                  <div className="rounded-md border bg-white p-1 dark:bg-black">
                    <div className="text-center">
                      <span className="text-red-500">
                        WARNING: ONLY WORKS FOR THE{" "}
                      </span>
                      <span className="text-blue-500">
                        COLLEGE RIDES PRESET
                      </span>
                      <span className="text-red-500">. USE WITH CAUTION.</span>
                    </div>
                    {/**Load Form */}
                    <LoadFile
                      assignableCollection={assignableCollection}
                      assignableDispatch={assignableManagerDispatch}
                      groupDispatch={groupManagerDispatch}
                    />
                    <hr />
                    {/**Save Form */}
                    <SaveFile
                      assignableCollection={assignableCollection}
                      groupCollection={groupCollection}
                    />
                  </div>
                )
              }
            >
              Open/Save File
            </button>
          </div>
        </div>
        {/**Assignable & Group Managers */}
        <div className="flex flex-col gap-1">
          {/**Assignable/Group Manager Toggle */}
          {allowShowGroupManager && (
            <button
              className={
                "rounded-sm border px-1 " +
                (showGroupManager
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950"
                  : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950")
              }
              onClick={() => setShowGroupManager(!showGroupManager)}
            >
              Manage {showGroupManager ? "Assignables" : "Groups"}
            </button>
          )}
          {/**Assignable or Group Manager */}
          {!showGroupManager ? (
            <AssignableManager
              settings={settings}
              assignableCollection={assignableCollection}
              unassignedCollection={unassignedCollection}
              assignableDispatch={assignableManagerDispatch}
              modalDispatch={setModal}
            />
          ) : (
            <GroupManager
              settings={settings}
              assignableCollection={assignableCollection}
              unassignedCollection={unassignedCollection}
              groupCollection={groupCollection}
              groupDispatch={groupManagerDispatch}
              modalDispatch={setModal}
            />
          )}
        </div>
      </div>
    </main>
  );
}
