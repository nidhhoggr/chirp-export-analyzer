const _ = require("lodash");

class ChirpChannel {

  constructor(row) {
    this.row = row;
  }

  static columnNames = [
    "Location",
    "Name",
    "Frequency",
    "Duplex",
    "Offset",
    "Tone",
    "rToneFreq",
    "cToneFreq",
    "DtcsCode",
    "DtcsPolarity",
    "RxDtcsCode",
    "CrossMode",
    "Mode",
    "TStep",
    "Skip",
    "Power",
    "Comment",
    "URCALL",
    "RPT1CALL",
    "RPT2CALL",
    "DVCODE"
  ];

  static isValidHeader(row) {
    return row == _.join(this.columnNames);
  }

  static areEqualRows(row1, row2) {
    return _.isEqual(
      ChirpChannel.omitChannelNumberAndName(row1), 
      ChirpChannel.omitChannelNumberAndName(row2)
    );
  }

  static toColumnKeyed(row) {
    return _.zipObject(this.columnNames, row) 
  }

  getColumnKeyed() {
    return ChirpChannel.toColumnKeyed(this.row)
  }

  static omitChannelNumberAndName(row) {
    return row.slice(2);
  }

  static getColumnByName(row, name) {
    const columnIndex = this.columnNames.indexOf(name);
    return row[columnIndex];
  }

  getWithoutChannelNumberAndName() {
    return ChirpChannel.omitChannelNumberAndName(this.row)
  }

  getIntersection(chirpChan) {
    return _.intersection(
      this.getWithoutChannelNumberAndName(),
      chirpChan.getWithoutChannelNumberAndName()
    );
  }

  getDifference(chirpChan) {
    return _.difference(
      this.getWithoutChannelNumberAndName(),
      chirpChan.getWithoutChannelNumberAndName()
    );
  }

  toString() {
    return `${ChirpChannel.getColumnByName(this.row, "Location")} - ${ChirpChannel.getColumnByName(this.row, "Name")}`;
  }
}

module.exports = ChirpChannel;
