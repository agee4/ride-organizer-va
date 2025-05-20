import { ChangeEvent, useRef, useState } from "react";
import { read, utils } from "xlsx";
import { Assignable, AssignableManagerAction } from "./Assignable";
import { Group, GroupManagerAction } from "./Group";

export const LoadFile = ({
  assignableCollection,
  assignableDispatch,
  groupDispatch,
}: {
  assignableCollection: Map<string, Assignable>;
  assignableDispatch: (action: AssignableManagerAction) => void;
  groupDispatch: (action: GroupManagerAction) => void;
}) => {
  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileSelectorRef.current) fileSelectorRef.current.value = "";
  };

  const clearPeople = () => {
    assignableCollection.forEach((value) =>
      assignableDispatch({
        type: "delete",
        assignableID: value.getID(),
      })
    );
  };
  const loadSheet = async () => {
    clearPeople();
    const f = selectedFile
      ? selectedFile
      : await fetch("/placeholdersheet.xlsx");
    const ab = await f.arrayBuffer();
    const wb = read(ab);

    const leaderSizeTemp = new Map<string, number>();

    /**Loading Assignables */
    for (const wsn of wb.SheetNames) {
      const ws = wb.Sheets[wsn];
      const data: any[] = utils.sheet_to_json(ws);
      if (wsn.toLocaleLowerCase().trim().includes("passenger")) {
        for (const x of data) {
          const attributes = new Map<
            string,
            string | boolean | number | string[]
          >();
          const attributeGroups = new Map<string, string>();
          if (x["Email Address"]) {
            attributes.set("Email", x["Email Address"]);
            attributeGroups.set("Email", "Contact");
          }
          if (x["Phone Number"]) {
            attributes.set("Phone", x["Phone Number"]);
            attributeGroups.set("Phone", "Contact");
          }
          if (x.Rides) {
            const cleanedRidesArray = (x.Rides.split(",") as Array<string>).map(
              (value) => value.toLocaleLowerCase().trim()
            );
            attributes.set(
              "Main Rides",
              cleanedRidesArray.map((value) =>
                value.includes("friday")
                  ? "Friday"
                  : value.includes("first")
                    ? "Sunday First"
                    : value.includes("second")
                      ? "Sunday Second"
                      : value.includes("third")
                        ? "Sunday Third"
                        : "ERROR"
              )
            );
            attributeGroups.set("Main Rides", "Availability");
          }
          if (x.Address) {
            attributes.set("Address", x.Address);
            attributeGroups.set("Address", "Location");
          }
          if (x.College) {
            attributes.set("Campus", x.College);
            attributeGroups.set("Campus", "Location");
          }
          if (x.Year) {
            attributes.set("Year", x.Year);
            attributeGroups.set("Year", "Affinity");
          }
          if (x["Backup Rides"]) {
            const cleanedRidesArray = (
              x["Backup Rides"].split(",") as Array<string>
            ).map((value) => value.toLocaleLowerCase().trim());
            attributes.set(
              "Backup Rides",
              cleanedRidesArray.map((value) =>
                value.includes("friday")
                  ? "Friday"
                  : value.includes("first")
                    ? "Sunday First"
                    : value.includes("second")
                      ? "Sunday Second"
                      : value.includes("third")
                        ? "Sunday Third"
                        : "ERROR"
              )
            );
            attributeGroups.set("Backup Rides", "Availability");
          }

          assignableDispatch({
            type: "create",
            assignable: new Assignable({
              id: x["Email Address"] ? x["Email Address"] : "",
              name: x.Name ? x.Name : "",
              attributes: attributes,
              attributeGroups: attributeGroups,
              notes: x.Notes,
            }),
          });
        }
      } else if (wsn.toLocaleLowerCase().trim().includes("driver")) {
        for (const x of data) {
          const attributes = new Map<
            string,
            string | boolean | number | string[]
          >();
          const attributeGroups = new Map<string, string>();
          if (x["Email Address"]) {
            attributes.set("Email", x["Email Address"]);
            attributeGroups.set("Email", "Contact");
          }
          if (x["Phone Number"]) {
            attributes.set("Phone", x["Phone Number"]);
            attributeGroups.set("Phone", "Contact");
          }
          if (x.Rides) {
            const cleanedRidesArray = (x.Rides.split(",") as Array<string>).map(
              (value) => value.toLocaleLowerCase().trim()
            );
            attributes.set(
              "Main Rides",
              cleanedRidesArray.map((value) =>
                value.includes("friday")
                  ? "Friday"
                  : value.includes("first")
                    ? "Sunday First"
                    : value.includes("second")
                      ? "Sunday Second"
                      : value.includes("third")
                        ? "Sunday Third"
                        : value
              )
            );
            attributeGroups.set("Main Rides", "Availability");
          }
          if (x.Address) {
            attributes.set("Address", x.Address);
            attributeGroups.set("Address", "Location");
          }
          if (x.College) {
            attributes.set("Campus", x.College);
            attributeGroups.set("Campus", "Location");
          }
          if (x.Year) {
            attributes.set("Year", x.Year);
            attributeGroups.set("Year", "Affinity");
          }

          const newDriver = new Assignable({
            id: x["Email Address"] ? x["Email Address"] : "",
            name: x.Name ? x.Name : "",
            attributes: attributes,
            attributeGroups: attributeGroups,
            leader: true,
            size: x.Seats ? x.Seats : 0,
            notes: x.Notes,
          });

          leaderSizeTemp.set(newDriver.getID(), x.Seats || 0);
          assignableDispatch({
            type: "create",
            assignable: newDriver,
          });
        }
      }
    }

    /**Loading Groups */
    for (const wsn of wb.SheetNames) {
      if (wsn.toLocaleLowerCase().trim().includes("ride")) {
        const ws = wb.Sheets[wsn];
        const data: any[] = utils.sheet_to_json(ws);
        for (const x of data) {
          const rdriver = x.Driver.slice(
            x.Driver.indexOf("(") + 1,
            x.Driver.indexOf(")")
          );
          const rpassengers = new Set<string>();
          for (const k in x) {
            if (k.toLocaleLowerCase().trim().includes("passenger"))
              if (x[k])
                for (const rpassengerstring of x[k].split(",")) {
                  rpassengers.add(
                    rpassengerstring.slice(
                      rpassengerstring.indexOf("(") + 1,
                      rpassengerstring.indexOf(")")
                    )
                  );
                }
          }
          groupDispatch({
            type: "create",
            group: new Group({
              id: rdriver,
              members: rpassengers,
              leader: rdriver,
              size: leaderSizeTemp.get(rdriver),
            }),
          });
        }
      }
    }
  };

  return (
    <div>
      <label className="block">
        <span className="text-neutral-500">Choose a sheet to upload:</span>
        <br />
        <input
          className="file:rounded-sm file:border file:px-2"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv,.ods,.gsheet"
          ref={fileSelectorRef}
        />
        {selectedFile && (
          <button className="rounded-full border px-2" onClick={clearFile}>
            Clear
          </button>
        )}
      </label>
      <div className="flex flex-row">
        <button
          className="rounded-full border px-2 disabled:text-neutral-500"
          onClick={loadSheet}
        >
          Load Data
        </button>
        <button className="rounded-full border px-2" onClick={clearPeople}>
          Clear Data
        </button>
      </div>
    </div>
  );
};
