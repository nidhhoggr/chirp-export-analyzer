const _ = require("lodash");
const ChirpAnalysis = require("./../src/ChirpAnalysis");
const {
  isNumber,
} = require("./../src/Utils");

const opts = {
  debug: () => () => {}
}

test('getStatsFromComparison', async() => {
    const ca = new ChirpAnalysis();
    const chirpFile = __dirname + "/files/rich.csv";
    const chirpFile2 = __dirname + "/files/dan.csv";
    await ca.computeChannelMapping(chirpFile, opts);
    await ca.computeChannelMapping(chirpFile2, opts);
    await ca.compareFiles([chirpFile, chirpFile2], opts)
    const {statistics} = ca.statistics({frequency: null}, opts);
    const {mismatching, matching, distinct, frequencyDupes } = statistics;
    expect(mismatching.length).toBe(15);
    expect(matching.length).toBe(90);
    expect(distinct.length[chirpFile]).toBe(54);
    expect(distinct.length[chirpFile2]).toBe(1);
    expect(frequencyDupes.length[chirpFile]).toBe(5);
    expect(frequencyDupes.length[chirpFile2]).toBe(2);
    expect(frequencyDupes.keys[chirpFile2]).toBe('154.702500,168.775000');
    expect(frequencyDupes.channelFreqMapping[chirpFile2]).toBe('59,LE-SANDP,154.702500 - 57,LE-SAML,154.702500 | 85,BDR-PATROL,168.775000 - 71,USFS-2,168.775000');
});

test('getStatsFromComparisonWhileIgnoringPowerLevels', async() => {
    const ignorantOpts = {ignore_difference_columns: ["Power"], ...opts};
    const ca = new ChirpAnalysis();
    const chirpFile = __dirname + "/files/rich.csv";
    const chirpFile2 = __dirname + "/files/dan.csv";
    await ca.computeChannelMapping(chirpFile, ignorantOpts);
    await ca.computeChannelMapping(chirpFile2, ignorantOpts);
    await ca.compareFiles([chirpFile, chirpFile2], ignorantOpts)
    const {statistics} = ca.statistics({frequency: null}, ignorantOpts);
    const {mismatching, matching, distinct, frequencyDupes } = statistics;
    expect(mismatching.length).toBe(1);
    expect(matching.length).toBe(104);
    expect(distinct.length[chirpFile]).toBe(54);
    expect(distinct.length[chirpFile2]).toBe(1);
    expect(frequencyDupes.length[chirpFile]).toBe(5);
    expect(frequencyDupes.length[chirpFile2]).toBe(2);
    expect(frequencyDupes.keys[chirpFile2]).toBe('154.702500,168.775000');
    expect(frequencyDupes.channelFreqMapping[chirpFile2]).toBe('59,LE-SANDP,154.702500 - 57,LE-SAML,154.702500 | 85,BDR-PATROL,168.775000 - 71,USFS-2,168.775000');
});
