// person.tsx

export enum RideTimes {
  FRIDAY = "Friday",
  FIRST = "First",
  SECOND = "Second",
  THIRD = "Third",
}

export class Person {
  public name: string
  public rides: RideTimes[]
  public address: string
  public college: string
  public notes?: string

  constructor(name: string, rides: RideTimes[], address: string, college: string, notes?: string) {
    this.name = name
    this.rides = rides
    this.address = address
    this.college = college
    this.notes = notes
  }
}