import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Field, Setting } from "./settings";
import { useMapReducer } from "./helpers";
import {
  Assignable,
  AssignableManagerAction,
  DEFAULTASSIGNABLEFIELDS,
} from "./Assignable";

export const AssignableForm = ({
  settings,
  assignableDispatch,
}: {
  settings: Setting;
  assignableDispatch: (action: AssignableManagerAction) => void;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [data, dataDispatch] = useMapReducer<string, any>(
    new Map([
      [DEFAULTASSIGNABLEFIELDS.NAME, ""],
      [DEFAULTASSIGNABLEFIELDS.ID, ""],
      [DEFAULTASSIGNABLEFIELDS.NOTES, ""],
    ])
  );
  const updateDataInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, valueAsNumber } = event.target;

    dataDispatch({
      type: "create",
      key: name,
      value:
        settings.getAssignableFields().get(name)?.getType() == "checkbox"
          ? checked
          : settings.getAssignableFields().get(name)?.getType() == "number" ||
              name == "leadersize"
            ? valueAsNumber
            : value,
    });
  };
  const updateDataSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value, selectedOptions } = event.target;
    dataDispatch({
      type: "create",
      key: name,
      value: settings.getAssignableFields().get(name)?.getMultiple()
        ? [...selectedOptions].map((o) => o.value)
        : value,
    });
  };

  const updateNotes = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    dataDispatch({
      type: "create",
      key: name,
      value: value,
    });
  };

  /**load fields from settings*/
  useMemo(() => {
    for (const [fieldname, field] of settings.getAssignableFields().entries()) {
      if (!data.has(fieldname))
        dataDispatch({
          type: "create",
          key: fieldname,
          value:
            field.getType() == "select" && field.getMultiple()
              ? new Array<string>()
              : field.getType() == "checkbox"
                ? false
                : field.getType() == "number"
                  ? 0
                  : "",
        });
    }
    if (
      settings.getGroupSizeSource() == "leadersize" &&
      !data.has("leadersize")
    )
      dataDispatch({
        type: "create",
        key: "leadersize",
        value: 0,
      });
    for (const field of data.keys()) {
      if (
        !settings.getAssignableFields().get(field) &&
        !Object.values<string>(DEFAULTASSIGNABLEFIELDS).includes(field)
      ) {
        dataDispatch({
          type: "delete",
          key: field,
        });
      }
    }
  }, [data, dataDispatch, settings]);

  const [isLeader, setIsLeader] = useState<boolean>(false);

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    const attributes = new Map<
      string,
      string | boolean | number | Array<string>
    >();
    const attributeGroups = new Map<string, string>();
    settings.getAssignableFields().forEach((field: Field) => {
      attributeGroups.set(field.getName(), field.getGroup());
      attributes.set(field.getName(), data.get(field.getName()));
    });
    assignableDispatch({
      type: "create",
      assignable: new Assignable({
        id: data.get(settings.getAssignableIDSource()) || "!ERROR!",
        name: data.get(DEFAULTASSIGNABLEFIELDS.NAME),
        attributes: attributes,
        attributeGroups: attributeGroups,
        leader: isLeader,
        size: isLeader
          ? settings.getGroupSizeSource() == "leadersize"
            ? data.get(settings.getGroupSizeSource())
            : settings.getGroupSizeSource()
          : undefined,
        notes: data.get(DEFAULTASSIGNABLEFIELDS.NOTES),
      }),
    });

    /**reset form fields */
    data.forEach((_, key) => {
      dataDispatch({ type: "create", key: key, value: "" });
    });
    setIsLeader(false);
    assignableFormRef.current?.reset();
  };

  return (
    <form
      className="flex flex-col rounded-md border border-cyan-500 bg-cyan-200 p-2 dark:bg-cyan-800"
      onSubmit={submitForm}
      ref={assignableFormRef}
    >
      <label className="text-center">New Assignable</label>
      <label className="flex flex-row flex-wrap place-content-between gap-1">
        {"Name*" +
          (settings.getAssignableIDSource() == "name" ? " (ID)" : "") +
          ":"}
        <input
          className="rounded-sm border"
          type="text"
          name={DEFAULTASSIGNABLEFIELDS.NAME}
          value={data.get(DEFAULTASSIGNABLEFIELDS.NAME)}
          placeholder={
            "Name*" +
            (settings.getAssignableIDSource() == "name" ? " (ID)" : "")
          }
          required
          minLength={1}
          onChange={updateDataInput}
        />
      </label>
      {settings.getAssignableIDSource() == "id" && (
        <label className="flex flex-row flex-wrap place-content-between gap-1">
          ID*:
          <input
            className="rounded-sm border"
            type="text"
            name={DEFAULTASSIGNABLEFIELDS.ID}
            value={data.get(DEFAULTASSIGNABLEFIELDS.ID)}
            placeholder="ID*"
            required
            minLength={1}
            onChange={updateDataInput}
          />
        </label>
      )}
      {[...settings.getAssignableFields().values()].map((field) =>
        field.getType() == "select" ? (
          <label
            className="flex flex-row flex-wrap place-content-between gap-1"
            key={field.getName()}
          >
            {field.getName() + (field.getRequired() ? "*" : "") + ":"}
            <select
              className="rounded-sm border"
              name={field.getName()}
              value={
                data.get(field.getName()) ||
                (field.getMultiple() ? new Array<string>() : "")
              }
              multiple={field.getMultiple()}
              size={
                field.getMultiple()
                  ? Math.min(field.getOptions().size, 4)
                  : undefined
              }
              required={field.getRequired()}
              onChange={updateDataSelect}
            >
              {!field.getMultiple() && (
                <option value="">-{field.getName()}-</option>
              )}
              {Array.from(field.getOptions()).map((value) => (
                <option
                  className={field.getMultiple() ? "" : "text-black"}
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : field.getType() == "checkbox" ? (
          <label
            className="flex flex-row flex-wrap place-content-between gap-1"
            key={field.getName()}
          >
            {field.getName()}
            <input
              className="rounded-sm border"
              type={field.getType()}
              name={field.getName()}
              value={
                data.has(field.getName())
                  ? data.get(field.getName())
                  : field.getType() == "number"
                    ? 0
                    : ""
              }
              checked={data.get(field.getName()) || false}
              placeholder={
                field.getName() +
                (field.getRequired() ? "*" : "") +
                (field.getName() == settings.getAssignableIDSource()
                  ? " (ID)"
                  : field.getName() == settings.getAssignableIDSource()
                    ? " (Size)"
                    : "")
              }
              size={field.getType() == "number" ? 7 : undefined}
              required={field.getRequired() || undefined}
              minLength={
                !field.getRequired() &&
                ["text", "email", "tel"].includes(field.getType())
                  ? 1
                  : undefined
              }
              onChange={updateDataInput}
              key={field.getName()}
            />
          </label>
        ) : (
          <label
            className="flex flex-row flex-wrap place-content-between gap-1"
            key={field.getName()}
          >
            {field.getName() +
              (field.getRequired() ? "*" : "") +
              (field.getName() == settings.getAssignableIDSource()
                ? " (ID)"
                : field.getName() == settings.getAssignableIDSource()
                  ? " (Size)"
                  : "") +
              ":"}
            <input
              className="rounded-sm border"
              type={field.getType()}
              name={field.getName()}
              value={
                data.has(field.getName())
                  ? data.get(field.getName())
                  : field.getType() == "number"
                    ? 0
                    : ""
              }
              checked={data.get(field.getName()) || false}
              placeholder={
                field.getName() +
                (field.getRequired() ? "*" : "") +
                (field.getName() == settings.getAssignableIDSource()
                  ? " (ID)"
                  : field.getName() == settings.getAssignableIDSource()
                    ? " (Size)"
                    : "")
              }
              size={field.getType() == "number" ? 7 : undefined}
              required={field.getRequired() || undefined}
              minLength={
                !field.getRequired() &&
                ["text", "email", "tel"].includes(field.getType())
                  ? 1
                  : undefined
              }
              min={field.getType() == "number" ? 0 : undefined}
              onChange={updateDataInput}
            />
          </label>
        )
      )}
      {settings.getUseLeader() && (
        <label className="flex flex-row place-content-between">
          Leader
          <input
            type="checkbox"
            checked={isLeader}
            onChange={(e) => setIsLeader(e.target.checked)}
          />
        </label>
      )}
      {isLeader && settings.getGroupSizeSource() == "leadersize" && (
        <label className="flex flex-row flex-wrap place-content-between">
          Size*:
          <input
            className="rounded-sm border"
            type="number"
            name={DEFAULTASSIGNABLEFIELDS.SIZE}
            value={data.get(DEFAULTASSIGNABLEFIELDS.SIZE) || 1}
            placeholder="Size*:"
            size={7}
            min={1}
            required={true}
            onChange={updateDataInput}
          />
        </label>
      )}
      {settings.getAssignableNotes() && (
        <textarea
          name={DEFAULTASSIGNABLEFIELDS.NOTES}
          className="rounded-sm border"
          placeholder="Notes"
          value={data.get(DEFAULTASSIGNABLEFIELDS.NOTES)}
          onChange={updateNotes}
        />
      )}
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};
