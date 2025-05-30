import {
  ActionDispatch,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { MapReducerAction, useMapReducer, useSetReducer } from "./helpers";
import { defaultSettings, Field, Setting, SIZESOURCE } from "./settings";
import { DEFAULTASSIGNABLEFIELDS } from "./Assignable";
import { useModal } from "./modal";

export const PresetForm = ({
  settings,
  settingsCallback,
  presets,
  presetsCallback,
}: {
  settings: Setting;
  settingsCallback: (setting: Setting) => void;
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
              className="w-full rounded-sm border"
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
  settingsCallback: (setting: Setting) => void;
}) => {
  const settingsFormRef = useRef<HTMLFormElement>(null);

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
    if (e.target.checked && autoGroups && groupSizeSource == SIZESOURCE.GROUP)
      setGroupSizeSource(SIZESOURCE.LEADER);
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
    if (e.target.checked && groupUseSize && groupSizeSource == SIZESOURCE.GROUP)
      setGroupSizeSource(SIZESOURCE.LEADER);
    setAutoGroups(e.target.checked);
  };
  const [assignableFields, assignableFieldsDispatch] = useMapReducer<
    string,
    Field
  >(settings.getAssignableFields());
  const deleteField = (field: string) => {
    assignableFieldsDispatch({
      type: "delete",
      key: field,
    });
    if (field == assignableIDSource) setAssignableIDSource("id");
    if (field == groupSizeSource) setGroupSizeSource("groupsize");
  };

  const createField = (field: Field) => {
    assignableFieldsDispatch({
      type: "create",
      key: field.getName(),
      value: field,
    });
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

  const FieldComponent = () => {
    const [fieldComponentCollection, fCDispatch] = useMapReducer<string, Field>(
      assignableFields
    );
    const deleteFieldHelper = (field: string) => {
      fCDispatch({
        type: "delete",
        key: field,
      });
      deleteField(field);
    };
    const createFieldHelper = (field: Field) => {
      fCDispatch({
        type: "create",
        key: field.getName(),
        value: field,
      });
      createField(field);
    };

    const CreateFieldComponent = () => {
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
        const cleanedFieldName = fieldName.trim().toLocaleLowerCase();
        if (
          !(cleanedFieldName in DEFAULTASSIGNABLEFIELDS) &&
          !["", ...assignableFields.keys()].includes(cleanedFieldName)
        ) {
          createFieldHelper(
            new Field({
              name: fieldName,
              type: fieldType,
              group: fieldGroup,
              required: requiredField,
              options: fieldType == "select" ? selectOptions : undefined,
              multiple: fieldType == "select" ? multipleSelect : undefined,
            })
          );

          setFieldName("");
          setFieldGroup("miscellaneous");
          setFieldType("text");
          setRequiredField(false);
          setOptionName("");
          setSelectOptions({ type: "replace", value: new Set<string>() });
          setMultipleSelect(false);
          createFieldModal.closeModal();
        }
      };

      return (
        <form
          className="flex flex-col gap-1 rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800"
          onSubmit={submitForm}
        >
          <label className="text-center">New Field</label>
          <label className="flex flex-row flex-wrap place-content-between gap-1">
            Name*:
            <input
              className="w-full rounded-sm border"
              type="text"
              name="newAssignableField"
              value={fieldName}
              placeholder="Name*"
              required
              minLength={1}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </label>
          <label className="flex flex-row place-content-between">
            Group:
            <select
              className="rounded-sm border"
              name="fieldgroup"
              value={fieldGroup}
              onChange={(e) => updateFieldGroup(e.target.value)}
            >
              <option className="dark:text-black" value="miscellaneous">
                ---
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
          </label>

          <label className="flex flex-row place-content-between">
            Type:
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
                  <option className="dark:text-black" value="number">
                    Number
                  </option>
                  <option className="dark:text-black" value="checkbox">
                    Checkbox
                  </option>
                  <option className="dark:text-black" value="select">
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
                  onChange={(e) => setMultipleSelect(e.target.checked)}
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
          <button className="rounded-sm border px-1" type="submit">
            Create
          </button>
        </form>
      );
    };
    const createFieldModal = useModal(<CreateFieldComponent />);

    return (
      <>
        {createFieldModal.Modal}
        <div className="flex flex-col gap-1 border bg-white p-1 dark:bg-black">
          <label className="flex flex-col place-content-between gap-1">
            Fields
            <span className="rounded-full bg-cyan-500 px-1">
              {fieldComponentCollection.size}
            </span>
          </label>
          <hr />
          {/**View & Remove Assignable Fields */}
          {[...fieldComponentCollection.entries()].map(([key, value]) => (
            <div key={key}>
              <label className="flex flex-row place-content-between gap-1">
                {value.getPlaceholderName()}
                <button
                  className="rounded-sm border px-1"
                  onClick={() => deleteFieldHelper(key)}
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
            </div>
          ))}
          {/**Add Assignable Field */}
          <div className="flex flex-col rounded-sm border-4 border-double border-cyan-500 bg-cyan-200 p-1 dark:bg-cyan-800">
            <button
              type="button"
              onClick={() =>
                createFieldModal.setModal(<CreateFieldComponent />)
              }
            >
              Create Input Field
            </button>
          </div>
        </div>
      </>
    );
  };
  const fieldModal = useModal(<FieldComponent />);

  return (
    <>
      {fieldModal.Modal}
      <form
        className="flex flex-col"
        onSubmit={submitForm}
        ref={settingsFormRef}
      >
        <label className="text-center">Settings</label>
        <div className="flex flex-row max-[30rem]:flex-col">
          {/**Assignable */}
          <div className="flex flex-col gap-1">
            <h1 className="text-center">Assignable</h1>
            {/**Assignable ID Source */}
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
            {/**Assignable Fields */}
            <button
              className="flex flex-row place-content-between gap-1 border-4 border-double bg-cyan-50 p-1 dark:bg-cyan-950"
              type="button"
              onClick={() => fieldModal.setModal(<FieldComponent />)}
            >
              Fields
              <span className="rounded-full bg-cyan-500 px-1">
                {assignableFields.size}
              </span>
            </button>
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
          <div className="mx-1 border-t-1 border-l-1"></div>
          {/**Group */}
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
            {/**Group Size Source */}
            {groupUseSize && (
              <select
                className="rounded-sm border"
                name="sizesource"
                value={groupSizeSource}
                onChange={(e) => setGroupSizeSource(e.target.value)}
              >
                {!autoGroups && (
                  <option className="dark:text-black" value={SIZESOURCE.GROUP}>
                    Size Field
                  </option>
                )}
                {useLeader && (
                  <>
                    <option className="text-black" value={SIZESOURCE.LEADER}>
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
            "rounded-full border" +
            (settingsUnaltered ? " text-neutral-500" : "")
          }
          type="submit"
          disabled={settingsUnaltered}
        >
          Save Settings
        </button>
      </form>
    </>
  );
};
