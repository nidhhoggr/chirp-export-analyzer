#!/usr/bin/env node

const fs = require('fs');
const { parse } = require('csv-parse');
const _ = require("lodash");
const ChirpChannel = require("./ChirpChannel");
const {
   findKeyByValue,
} = require("./Utils");

function isNestedFrequencyMapping(frequencyMapping) {
  return _.isArray(frequencyMapping[0]);
}

class ChirpAnalysis {

  constructor() {
    this.channelMapping = {
      frequency: {},
      name: {},
      frequencyDupes: {},
      nameDupes: {},
    };

    this.frequencyMapping = {
      distinct: {},
      mismatching: {},
      matching: {},
    };
  }

  newChannelMapping(filename, {debug}, doneCb) {
    return fs.createReadStream(filename).pipe(parse({ delimiter: ',' }, (err, records) => {
      if (err) throw err;

      if (!this.channelMapping.frequency[filename]) {
        this.channelMapping.frequency[filename] = {};
      }
      if (!this.channelMapping.frequencyDupes[filename]) {
        this.channelMapping.frequencyDupes[filename] = {};
      }
      if (!this.channelMapping.nameDupes[filename]) {
        this.channelMapping.nameDupes[filename] = {};
      }
      if (!this.channelMapping.name[filename]) {
        this.channelMapping.name[filename] = {};
      }

      if (!ChirpChannel.isValidHeader(records[0])) {
        throw new Error(`Detected invalid header row: ${_.join(records[0])}`);
      }
      // Loop through each row in the CSV file
      for (const row of records.slice(1)) {//skip the first row
        const channelFreq = ChirpChannel.getColumnByName(row,"Frequency")
        let channelName = ChirpChannel.getColumnByName(row,"Name")
   
        if (!channelName || !channelFreq) continue;

        if (this.channelMapping.frequency[filename][channelFreq]) {
          if (ChirpChannel.areEqualRows(row, this.channelMapping.frequency[filename][channelFreq])) { 
            debug(1)(`detected matching duplicate frequency: ${filename}: ${channelName} - ${channelFreq}`);
            debug(2)(row, this.channelMapping.frequency[filename][channelFreq]);
            this.channelMapping.frequencyDupes[filename][channelFreq] = [
              row, this.channelMapping.frequency[filename][channelFreq]
            ];
            //its a matching duplicate so we wont add the filename entry
            //regardless if the filename isn't also a duplicate
            continue;
          } else {
            debug(2)(`shared frequencies don't match: ${filename}: ${channelName} - ${channelFreq}`);
            debug(2)(row, this.channelMapping.frequency[filename][channelFreq]);
            
            //it's a nested array
            if (isNestedFrequencyMapping(this.channelMapping.frequency[filename][channelFreq])) {
              this.channelMapping.frequency[filename][channelFreq] = [row, ...this.channelMapping.frequency[filename][channelFreq]];
            } else {
              this.channelMapping.frequency[filename][channelFreq] = [row, this.channelMapping.frequency[filename][channelFreq]];
            }
          }
        } else {
          this.channelMapping.frequency[filename][channelFreq] = row;
        }

        const channelNameExisting = this.channelMapping.name[filename][channelName];

        if (channelNameExisting) {
          debug(1)("detected duplicate channel name: ", filename, channelName);
          if (!this.channelMapping.nameDupes[filename][channelName]) {
            this.channelMapping.nameDupes[filename][channelName] = [row, channelNameExisting];
          } else {
            this.channelMapping.nameDupes[filename][channelName].push(row);
          }
          channelName = `${channelName}-${row[0]}`;
        }

        this.channelMapping.name[filename][channelName] = row;
      }
      doneCb();
    }));
  }

  computeChannelMapping(filename, {debug}) {
    return new Promise(resolve => {
      this.newChannelMapping(filename, {debug}, async () => {
        const fileFreqMapping = this.channelMapping.frequency[filename];
        let channelCount = 0;
        for (const channelFreq in fileFreqMapping) {
          if (isNestedFrequencyMapping(fileFreqMapping[channelFreq])) {
            const freqChannelLength = fileFreqMapping[channelFreq].length;
            debug(2)(freqChannelLength);
            channelCount += freqChannelLength;
            debug(1)(`freq ${channelFreq} has ${freqChannelLength} channels`);
            debug(fileFreqMapping[channelFreq]);
          } else {
            channelCount += 1;
            debug(1)(`freq ${channelFreq} has 1 channels`);
          }
        }
        debug(1)(`\ntotal channel count in ${filename} is ${channelCount}`);
        if (this.channelMapping.frequencyDupes[filename].length > 0) {
          debug(1)("\n removed duplicates:", this.channelMapping.frequencyDupes[filename]);
        }
        resolve(this.channelMapping);
      });
    });
  }

  compareFiles(filenames, opts) {
    return new Promise((resolve, reject) => {
      const firstFile = filenames[0];
      const secondFile = filenames[1];

      this.frequencyMapping.distinct[firstFile] = {};

      for (const channelFreq in this.channelMapping.frequency[firstFile]) {
        const firstFreqMapping = this.channelMapping.frequency[firstFile][channelFreq];
        const secondFreqMapping = this.channelMapping.frequency[secondFile][channelFreq];
        if (!secondFreqMapping) {
          this.frequencyMapping.distinct[firstFile][channelFreq] = firstFreqMapping;
        } else {
          this.#compareVaryingFrequencySets({firstFreqMapping, firstFile}, {
            secondFreqMapping, secondFile}, channelFreq, opts)  
        }
      }

      const mismatchingFrequencies = _.keys(this.frequencyMapping.mismatching);
      const matchingFrequencies = _.keys(this.frequencyMapping.matching);

      const intersection = _.intersection(mismatchingFrequencies,  matchingFrequencies);
      opts.debug(2)(`omitting the intersecting this.channelMapping.frequencys from mismatching: ${_.join(intersection)}`);
      this.frequencyMapping.mismatching = _.omit(this.frequencyMapping.mismatching, intersection);

      this.frequencyMapping.distinct[secondFile] = {};
      
      for (const channelFreq in this.channelMapping.frequency[secondFile]) {
        const secondFreqMapping = this.channelMapping.frequency[secondFile][channelFreq];
        const firstFreqMapping = this.channelMapping.frequency[firstFile][channelFreq];
        if (!firstFreqMapping) {
          this.frequencyMapping.distinct[secondFile][channelFreq] = secondFreqMapping;
        }
      }

      resolve();
    });
  }

  statistics({frequency}, {debug}) {
    const statistics = {
      mismatching: {
        length: _.keys(this.frequencyMapping.mismatching).length,
        frequencies: _.keys(this.frequencyMapping.mismatching),
        channelFreqMapping: _.mapValues(this.frequencyMapping.mismatching, function(o) {
          return `${new ChirpChannel(o[0]).toString()}, ${new ChirpChannel(o[1]).toString()}`
        }),
      },
      matching: {
        length: _.keys(this.frequencyMapping.matching).length,
        frequencies: _.keys(this.frequencyMapping.matching),
        channelFreqMapping: _.mapValues(this.frequencyMapping.matching, function(o) {
          return `${new ChirpChannel(o[0]).toString()}, ${new ChirpChannel(o[1]).toString()}`
        }),
      },
      distinct: {
        length: _.mapValues(this.frequencyMapping.distinct, function(o) {
          return _.keys(o).length
        }),
        keys: _.mapValues(this.frequencyMapping.distinct, function(o) {
          return _.join(_.keys(o))
        }),
        channelFreqMapping: _.mapValues(this.frequencyMapping.distinct, function(o) {
          return _.join(_.map(o, function(v) {
            if (isNestedFrequencyMapping(v)) {
              return _.join(_.map(v, function(x) {
                return x.slice(0, 3);
              }), ' | ');
            } else {
              return v.slice(0, 3);
            }
          }), ' | ')
        }),
      },
      frequencyDupes: {
        length: _.mapValues(this.channelMapping.frequencyDupes, function(o) {
          return _.keys(o).length
        }),
        keys: _.mapValues(this.channelMapping.frequencyDupes, function(o) {
          return _.join(_.keys(o))
        }),
        channelFreqMapping: _.mapValues(this.channelMapping.frequencyDupes, function(o) {
          return _.join(_.map(o, function(v) {
            if (isNestedFrequencyMapping(v)) {
              return _.join(_.map(v, function(x) {
                return x.slice(0, 3);
              }), ' - ');
            } else {
              return v.slice(0, 3);
            }
          }), ' | ')
        }),
      }
    };
    let channelComparison = {};
    let channelMapping = {};
    if (frequency) {
      let channelComparison = {};
      if (_.get(this.frequencyMapping.mismatching, frequency)) {
        channelComparison = this.compareChannelMismatch(
          this.frequencyMapping.mismatching[frequency][0], 
          this.frequencyMapping.mismatching[frequency][1]
        );
        const {
          mismatchingZipped,
          intersection,
          difference,
          differenceReverse,
          columns,
        } = channelComparison;
        debug(1)("Mismatching", mismatchingZipped);
        debug(1)("Intersection", intersection);
        debug(1)(`Mismatching Columns: ${_.join(columns)}`);
        debug(1)("Difference 1 -> 2", difference);
        debug(1)("Difference 2 <- 1", differenceReverse);
      } else if (_.get(this.frequencyMapping.matching, frequency)) {
        debug(1)("Matching", _.get(this.frequencyMapping.matching, frequency))
      }

      for (const filename in this.channelMapping.frequency) {
        channelMapping[filename] = [];
        const freqItem = this.channelMapping.frequency[filename][frequency];
        if (!freqItem) {
          debug(1)(`${filename} does not contain a channel with frequency: ${frequency}`);
          continue;
        }
        debug(1)(filename);
        if (isNestedFrequencyMapping(freqItem)) {
          const ck = _.map(this.channelMapping.frequency[filename][frequency], o => ChirpChannel.toColumnKeyed(o))
          ck.map(o => debug(1)(o));
          channelMapping[filename].push(...ck);
        } else {
          const ck = ChirpChannel.toColumnKeyed(this.channelMapping.frequency[filename][frequency]);
          debug(1)(ck);
          channelMapping[filename].push(ck);
        }
      }
    }
    return {
      statistics,
      channelComparison,
      channelMapping,
    }
  }

  compareChannelMismatch(chan1, chan2) {
    
    const chirpChan1 = new ChirpChannel(chan1);
    const chirpChan2 = new ChirpChannel(chan2);
    const chirpChanZip1 = chirpChan1.getColumnKeyed();
    const chirpChanZip2 = chirpChan2.getColumnKeyed();
    const mismatchingZipped = [
      chirpChanZip1,
      chirpChanZip2,
    ];
    const intersection = chirpChan1.getIntersection(chirpChan2);
    const difference = chirpChan1.getDifference(chirpChan2);
    const columns = [];
    for (const mv of difference) {
      columns.push(findKeyByValue(chirpChanZip1, mv));
    }
    const differenceReverse = chirpChan2.getDifference(chirpChan1);
    return {
      mismatchingZipped,
      intersection,
      difference,
      differenceReverse,
      columns, 
    }
  }


  #compareVaryingFrequencySets({firstFreqMapping, firstFile}, {
    secondFreqMapping, secondFile}, channelFreq, opts) {

    if (isNestedFrequencyMapping(firstFreqMapping)) {
      for (const freqItem of firstFreqMapping) {
        this.#compareVaryingFrequencySets({firstFreqMapping: freqItem, firstFile}, {
          secondFreqMapping, secondFile}, channelFreq, opts)
      }
    } else if (isNestedFrequencyMapping(secondFreqMapping)) {
      for (const freqItem of secondFreqMapping) {
        this.#compareVaryingFrequencySets({firstFreqMapping, firstFile}, {
          secondFreqMapping: freqItem, secondFile}, channelFreq, opts)
      }
    } else {
      const freqsEq = ChirpChannel.areEqualRows(firstFreqMapping, secondFreqMapping);
      if (!freqsEq) {
        const shouldIgnore = this.#shouldIgnoreColumnDifference(firstFreqMapping, secondFreqMapping, opts);

        if (!shouldIgnore) {
          this.frequencyMapping.mismatching[channelFreq] = [
            firstFreqMapping,
            secondFreqMapping
          ];

          return;
        }
      } 

      this.frequencyMapping.matching[channelFreq] = [
        firstFreqMapping,
        secondFreqMapping
      ];
    }
  }

  #shouldIgnoreColumnDifference(freq1, freq2, {debug, ignore_difference_columns}) {

    const {
      columns,
    } = this.compareChannelMismatch(freq1, freq2);

    if (columns.length > 0) {
      debug(2)(freq1.slice(0, 3), columns, ignore_difference_columns);
    }

    return columns.length > 0 && _.isEqual(columns, ignore_difference_columns);
  }


}

module.exports = ChirpAnalysis;
