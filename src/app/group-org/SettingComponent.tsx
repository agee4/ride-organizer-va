import {
  ActionDispatch,
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { MapReducerAction, useMapReducer, useSetReducer } from "./helpers";
import { defaultSettings, Field, Setting } from "./settings";

export const PresetForm = ({
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
      const newSetting = new Setting({
        name: newPresetName,
        assignableIDSource: settings.getAssignableIDSource(),
        assignableFields: settings.getAssignableFields(),
        assignableNotes: settings.getAssignableNotes(),
        useLeader: settings.getUseLeader(),
        groupIDSource: settings.getGroupIDSource(),
        groupCustomName: settings.getGroupCustomName(),
        groupUseSize: settings.getGroupUseSize(),
        groupSizeSource: settings.getGroupSizeSource(),
        groupNotes: settings.getGroupNotes(),
        autoGroups: settings.getAutoGroups(),
      });
      presetsCallback({
        type: "create",
        key: newPresetName,
        value: newSetting,
      });
      settingsCallback(newSetting);
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

export const SettingsForm = ({
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
      if (autoGroups) setAutoGroups(false);
    }
    setUseLeader(e.target.checked);
  };

  const [groupIDSource, setGroupIDSource] = useState<string>(
    settings.getGroupIDSource()
  );
  const updateGroupIDSource = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value != "leader" && autoGroups) setAutoGroups(false);
    setGroupIDSource(e.target.value);
  };

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
  const updateGroupUseSize = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && autoGroups && groupSizeSource == "groupsize")
      setGroupSizeSource("leadersize");
    setGroupUseSize(e.target.checked);
  };

  const [groupSizeSource, setGroupSizeSource] = useState<string>(
    settings.getGroupSizeSource()
  );
  const [groupNotes, setGroupNotes] = useState<boolean>(
    settings.getGroupNotes()
  );
  const [autoGroups, setAutoGroups] = useState<boolean>(
    settings.getAutoGroups()
  );
  const updateAutoGroup = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && groupUseSize && groupSizeSource == "groupsize")
      setGroupSizeSource("leadersize");
    setAutoGroups(e.target.checked);
  };

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
        autoGroups: autoGroups,
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
    setAutoGroups(settings.getAutoGroups());
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
      autoGroups: autoGroups,
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
              onChange={updateGroupIDSource}
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
              onChange={updateGroupUseSize}
            />
          </label>
          {groupUseSize && (
            <select
              className="rounded-sm border"
              name="sizesource"
              value={groupSizeSource}
              onChange={(e) => setGroupSizeSource(e.target.value)}
            >
              {!autoGroups && (
                <option className="dark:text-black" value="groupsize">
                  Size Field
                </option>
              )}
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
          {useLeader && groupIDSource == "leader" && (
            <>
              <hr />
              <label className="flex flex-row place-content-between">
                Auto Groups
                <input
                  type="checkbox"
                  checked={autoGroups}
                  onChange={updateAutoGroup}
                />
              </label>
            </>
          )}
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
