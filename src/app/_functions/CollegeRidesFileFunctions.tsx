import { utils, WorkBook } from "xlsx";
import { Assignable, AssignableManagerAction } from "../_classes/Assignable";
import { Group, GroupManagerAction } from "../_classes/Group";

export const loadCollegeRides = (
  wb: WorkBook,
  assignableDispatch: (action: AssignableManagerAction) => void,
  groupDispatch: (action: GroupManagerAction) => void
) => {
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

export const saveCollegeRides = (
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
