"use client";

import { ChangeEvent, FormEvent, useState } from "react";

class CustomAssignable {
  private _id: string;
  private name: string;

  constructor({ id, name }: { id: string; name: string }) {
    this._id = id;
    this.name = name;
  }

  getID() {
    return this._id;
  }

  getName() {
    return this.name;
  }
}

function createAssignableClass(className: string, contact?: string[]) {
  const classDef = `class ${className} extends ${CustomAssignable} {
    constructor({
      id,
      name,
      ${contact ? contact.map((p) => `${p},`).join("\n") : ""}
    }) {
      super({id, name});
      ${contact ? contact.map((p) => `this.${p} = ${p};`).join("\n") : ""}
    }

    ${contact ? contact.map((p) => `get${p.charAt(0).toLocaleUpperCase() + p.slice(1)}() {return this.${p}}`).join("\n") : ""}
  }
  return ${className};`;
  return new Function(classDef)();
}

export default function Page() {
  const [className, setClassName] = useState<string>("");
  const [dynamicAssignable, setDynamicAssignable] = useState<any>();

  const updateForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setClassName(value);
  };
  const createClass = (event: FormEvent) => {
    event.preventDefault();
    const test = createAssignableClass(className, ["email", "phone"]);
    setDynamicAssignable(() => test);
  };
  const logDC = () => {
    if (dynamicAssignable) {
      const test = new dynamicAssignable({
        id: "id",
        name: "objectname",
        email: "agee4@uci.edu",
        phone: "9163857559",
      });
      console.log(test);
      console.log(Object.getOwnPropertyNames(test));
      console.log(test.getPhone());
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>group organizer test</h1>
        <p>WIP</p>
        <form
          className="my-1 flex flex-col rounded-md border p-2"
          onSubmit={createClass}
          /* ref={formRef} */
        >
          <input
            className="rounded-sm border"
            type="text"
            name="className"
            value={className}
            placeholder="Class Name"
            required
            minLength={1}
            onChange={updateForm}
          />
          <button className="rounded-full border" type="submit">
            Create New Class
          </button>
        </form>
        <button onClick={logDC}>Test</button>
      </main>
    </div>
  );
}
