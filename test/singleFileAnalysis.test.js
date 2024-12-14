const _ = require("lodash");
const ChirpAnalysis = require("./../src/ChirpAnalysis");
const {
  isNumber,
} = require("./../src/Utils");

const opts = {
  debug: () => () => {}
}

test('getStatsFromSingleFileWithDupes', async() => {
    const ca = new ChirpAnalysis();
    const chirpFile = __dirname + "/files/rich.csv";
    await ca.computeChannelMapping(chirpFile, opts);
    const {statistics} = ca.statistics({frequency: null}, opts);
    const {mismatching, matching, distinct, frequencyDupes } = statistics;
    expect(mismatching.length).toBe(0);
    expect(matching.length).toBe(0);
    expect(distinct.length).toStrictEqual({});
    expect(frequencyDupes.length[chirpFile]).toBe(5);
    expect(frequencyDupes.keys[chirpFile]).toBe('151.940000,462.612500,145.270000,154.702500,168.775000');
    expect(frequencyDupes.channelFreqMapping[chirpFile]).toBe('66,MURS 3,151.940000 - 7,MURS 3,151.940000 | 76,GMRS 3,462.612500 - 6,GMRS 3,462.612500 | 230,KE7ADT,145.270000 - 9,ATHOL,145.270000 | 259,LE-SANDP,154.702500 - 257,LE-SAML,154.702500 | 285,BDR-PATROL,168.775000 - 271,USFS-2,168.775000');
});


test('getStatsFromSingleFileWithFrequency', async() => {
    const ca = new ChirpAnalysis();
    const chirpFile = __dirname + "/files/rich.csv";
    await ca.computeChannelMapping(chirpFile, opts);
    const statistics = ca.statistics({frequency: "151.940000"}, opts);
    expect(statistics.channelMapping[chirpFile].length).toBe(3)
    expect(statistics.channelMapping[chirpFile][0]).toStrictEqual({
      Location: '250',
      Name: 'MURS-3',
      Frequency: '151.940000',
      Duplex: '',
      Offset: '0.000000',
      Tone: '',
      rToneFreq: '88.5',
      cToneFreq: '88.5',
      DtcsCode: '023',
      DtcsPolarity: 'NN',
      RxDtcsCode: '023',
      CrossMode: 'Tone->Tone',
      Mode: 'NFM',
      TStep: '5.00',
      Skip: 'S',
      Power: '8.0W',
      Comment: '',
      URCALL: '',
      RPT1CALL: '',
      RPT2CALL: '',
      DVCODE: ''
   });
   expect(statistics.channelMapping[chirpFile][1]).toStrictEqual({
      Location: '71',
      Name: 'MURS3T',
      Frequency: '151.940000',
      Duplex: '',
      Offset: '0.000000',
      Tone: 'DTCS',
      rToneFreq: '88.5',
      cToneFreq: '88.5',
      DtcsCode: '662',
      DtcsPolarity: 'NN',
      RxDtcsCode: '023',
      CrossMode: 'Tone->Tone',
      Mode: 'NFM',
      TStep: '5.00',
      Skip: '',
      Power: '5.0W',
      Comment: '',
      URCALL: '',
      RPT1CALL: '',
      RPT2CALL: '',
      DVCODE: ''
   });
   expect(statistics.channelMapping[chirpFile][2]).toStrictEqual({
      Location: '7',
      Name: 'MURS 3',
      Frequency: '151.940000',
      Duplex: '',
      Offset: '0.000000',
      Tone: '',
      rToneFreq: '88.5',
      cToneFreq: '88.5',
      DtcsCode: '023',
      DtcsPolarity: 'NN',
      RxDtcsCode: '023',
      CrossMode: 'Tone->Tone',
      Mode: 'NFM',
      TStep: '5.00',
      Skip: '',
      Power: '5.0W',
      Comment: '',
      URCALL: '',
      RPT1CALL: '',
      RPT2CALL: '',
      DVCODE: ''
   });
});
