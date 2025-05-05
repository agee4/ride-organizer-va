import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Field, Setting } from "./settings";
import { useMapReducer } from "./helpers";
import { Assignable } from "./Assignable";

export const AssignableForm = ({
  settings,
  createAssignable,
}: {
  settings: Setting;
  createAssignable: (assignable: Assignable) => void;
}) => {
  const assignableFormRef = useRef<HTMLFormElement>(null);

  const [data, dataDispatch] = useMapReducer<string, any>(
    new Map([
      ["name", ""],
      ["id", ""],
      ["notes", ""],
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
  useEffect(() => {
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
        !["name", "id", "notes", "leadersize"].includes(field)
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
    createAssignable(
      new Assignable({
        id: data.get(settings.getAssignableIDSource()) || "!ERROR!",
        name: data.get("name"),
        attributes: attributes,
        attributeGroups: attributeGroups,
        leader: isLeader,
        size: isLeader
          ? settings.getGroupSizeSource() == "leadersize"
            ? data.get(settings.getGroupSizeSource())
            : settings.getGroupSizeSource()
          : undefined,
        notes: data.get("notes"),
      })
    );

    /**reset form fields */
    data.forEach((_, key) => {
      dataDispatch({ type: "create", key: key, value: "" });
    });
    setIsLeader(false);
    assignableFormRef.current?.reset();
  };

  return (
    <form
      className="flex flex-col rounded-md border p-2"
      onSubmit={submitForm}
      ref={assignableFormRef}
    >
      <label className="text-center">New Assignable</label>
      <input
        className="rounded-sm border"
        type="text"
        name="name"
        value={data.get("name")}
        placeholder={
          "Name*" + (settings.getAssignableIDSource() == "name" ? " (ID)" : "")
        }
        required
        minLength={1}
        onChange={updateDataInput}
      />
      {settings.getAssignableIDSource() == "id" && (
        <input
          className="rounded-sm border"
          type="text"
          name="id"
          value={data.get("id")}
          placeholder="ID*"
          required
          minLength={1}
          onChange={updateDataInput}
        />
      )}
      {[...settings.getAssignableFields().values()].map((field) =>
        field.getType() == "select" ? (
          <label
            className="flex flex-row flex-wrap place-content-between"
            key={field.getName()}
          >
            {["number", "checkbox", "select"].includes(field.getType()) &&
              field.getName() + (field.getRequired() ? "*" : "") + ":"}

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
                  ? field.getOptions().size < 4
                    ? field.getOptions().size
                    : 4
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
            className="flex flex-row flex-wrap place-content-between"
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
        <label className="flex flex-row place-content-between">
          Size*:
          <input
            className="rounded-sm border"
            type="number"
            name="leadersize"
            value={data.get("leadersize") || 0}
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
          name="notes"
          className="rounded-sm border"
          placeholder="Notes"
          value={data.get("notes")}
          onChange={updateNotes}
        />
      )}
      <button className="rounded-full border" type="submit">
        Create
      </button>
    </form>
  );
};
