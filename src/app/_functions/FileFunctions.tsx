import { utils, WorkBook } from "xlsx";
import { Assignable, AssignableManagerAction } from "../_classes/Assignable";
import { Group, GroupManagerAction } from "../_classes/Group";
import { Setting } from "../_classes/settings";

export const loadFile = (
  wb: WorkBook,
  wbMappings: Map<
    string,
    {
      mappings: Map<string, string>;
      leader: boolean;
      group: boolean;
    }
  >,
  settings: Setting,
  assignableDispatch: (action: AssignableManagerAction) => void,
  groupDispatch: (action: GroupManagerAction) => void
) => {
  const leaderSizeTemp = new Map<string, number>();

  for (const wsn of wb.SheetNames) {
    const ws = wb.Sheets[wsn];
    const data: any[] = utils.sheet_to_json(ws);
    if (wbMappings.has(wsn)) {
      const wsMap = wbMappings.get(wsn)?.mappings || new Map<string, string>();
      if (wbMappings.get(wsn)?.group)
        /**Loading Groups */
        for (const x of data) {
          let leader;
          const members = new Set<string>();
          let notes;
          for (const key of Object.keys(x)) {
            const header = wsMap.get(key);
            switch (header) {
              case "Leader":
                leader = x[key].slice(
                  x.Driver.indexOf("(") + 1,
                  x.Driver.indexOf(")")
                );
                break;
              case "Members":
                x[key]
                  .split(",")
                  .forEach((member: string) =>
                    members.add(
                      member.slice(member.indexOf("(") + 1, member.indexOf(")"))
                    )
                  );
                break;
              case "Notes":
                notes = x[key];
                break;
            }
          }
          groupDispatch({
            type: "create",
            group: new Group({
              id: leader,
              members: members,
              leader: leader,
              size: leaderSizeTemp.get(leader),
              notes: notes,
            }),
          });
        } /**Loading Assignables */
      else
        for (const x of data) {
          let name = "";
          let id = "";
          let notes;
          let size;
          const attributes = new Map<
            string,
            string | boolean | number | string[]
          >();
          const attributeGroups = new Map<string, string>();
          for (const key of Object.keys(x)) {
            const header = wsMap.get(key);
            switch (header) {
              case "Name":
                name = x[key];
                if (settings.getAssignableIDSource() == "name") id = name;
                break;
              case "ID":
                if (settings.getAssignableIDSource() == "id") id = x[key];
                break;
              case "Notes":
                notes = x[key];
                break;
              case "Size":
                size = x[key];
                leaderSizeTemp.set(id, size);
                break;
              default:
                if (header) {
                  const field = settings.getAssignableFields().get(header);
                  if (field) {
                    attributes.set(
                      header,
                      field.getType() == "select" && field.getMultiple()
                        ? (x[key].split(",") as Array<string>)
                        : x[key]
                    );
                    attributeGroups.set(header, field.getGroup() || "");
                  }
                  if (settings.getAssignableIDSource() == header) id = x[key];
                }
            }
          }
          assignableDispatch({
            type: "create",
            assignable: new Assignable({
              id: id,
              name: name,
              attributes: attributes,
              attributeGroups: attributeGroups,
              leader: wbMappings.get(wsn)?.leader,
              notes: notes,
              size: size,
            }),
          });
        }
    }
  }

  /**Loading Groups */
  /* for (const wsn of wb.SheetNames) {
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
  } */
};

export const saveFile = (
  wb: WorkBook,
  assignableCollection: Map<string, Assignable>,
  groupCollection: Map<string, Group>
) => {
  const passengerJSON = [];
  for (const passenger of assignableCollection
    .values()
    .filter((a) => !a.getLeader())) {
    passengerJSON.push({
      "Email Address": passenger.getAttributes().get("Email"),
      Name: passenger.getName(),
      "Phone Number": passenger.getAttributes().get("Phone"),
      Rides: passenger.getAttributes().get("Main Rides")?.toLocaleString(),
      Address: passenger.getAttributes().get("Address"),
      College: passenger.getAttributes().get("Campus"),
      Year: passenger.getAttributes().get("Year"),
      "Backup Rides": passenger
        .getAttributes()
        .get("Backup Rides")
        ?.toLocaleString(),
      Notes: passenger.getNotes(),
    });
  }
  const ws_p = utils.json_to_sheet(passengerJSON);
  utils.book_append_sheet(wb, ws_p, "Passengers");
  const driverJSON = [];
  for (const driver of assignableCollection
    .values()
    .filter((a) => !a.getLeader())) {
    driverJSON.push({
      "Email Address": driver.getAttributes().get("Email"),
      Name: driver.getName(),
      "Phone Number": driver.getAttributes().get("Phone"),
      Seats: driver.getSize(),
      College: driver.getAttributes().get("Campus"),
      Rides: driver.getAttributes().get("Main Rides")?.toLocaleString(),
      Address: driver.getAttributes().get("Address"),
      Notes: driver.getNotes(),
    });
  }
  const ws_d = utils.json_to_sheet(driverJSON);
  utils.book_append_sheet(wb, ws_d, "Drivers");
  if (groupCollection.size > 0) {
    const rideJSON = [];
    for (const ride of groupCollection.values()) {
      const rideRecord: Record<string, string | number> = {};
      const rideDriver = assignableCollection.get(ride.getLeader() || "");
      rideRecord["Driver"] =
        rideDriver?.getName() + "(" + rideDriver?.getID() + ")";
      Array.from(ride.getAllMembers().values()).forEach(
        (passengerID, index) => {
          const passenger = assignableCollection.get(passengerID || "");
          rideRecord["Passenger " + (index + 1)] =
            passenger?.getName() + "(" + passengerID + ")";
        }
      );
      rideJSON.push(rideRecord);
    }
    const ws_r = utils.json_to_sheet(rideJSON);
    utils.book_append_sheet(wb, ws_r, "Rides");
  }
};
