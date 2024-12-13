# chirp export analyzer

this is a simple utility to analyze a csv export of a chirp file. It's most useful for comparing the differences between two separate Chirp csv exports.

## Usage

### Analyze a single chirp file for duplicates

```
./analyze chirp-export.csv
```

### Analyze a particular frequency in a single chrip file

This is useful when there are multiple channels sharing the same frequency.

```
./analyze chirp-export.csv 151.940000
```

### Compare Two Seperate exports against one another

```
./analyze chirp-export-1.csv chirp-export-2.csv
```

### Analyze a freqeuncy in either chirp file

This is useful when there is a shared and/or mismatched frequency.

```
./analyze chirp-export-1.csv chirp-export-2.csv 146.530000
```

### Environment Variables

```
DEBUG=0 ./analyze chirp-export-1.csv chirp-export-2.csv
```

This will disable debugging (enabled by default). Currently this is basically useless.

```
DEBUG=2 ./analyze chirp-export-1.csv chirp-export-2.csv
```

This will increase debugging verbosity.

```
IGNORE_POWER_DIFFERENCE=1 ./analyze chirp-export-1.csv chirp-export-2.csv
```

Usually there will be mismatches based on the power setting alone. When enabling this flag there should usually be less mismatches.

## NOTE

Mismatched only take into considerations every other filed besides the channel number and name. As a result, channels with the same settings but a different channel name or number will *NOT* be considered a mismatch. The following list is the name of the columns export from chirp in their respective order:

 * Location
 * Name
 * Frequency
 * Duplex
 * Offset
 * Tone
 * rToneFreq
 * cToneFreq
 * DtcsCode
 * DtcsPolarity
 * RxDtcsCode
 * CrossMode
 * Mode
 * TStep
 * Skip
 * Power
 * Comment
 * URCALL
 * RPT1CALL
 * RPT2CALL
 * DVCODE
